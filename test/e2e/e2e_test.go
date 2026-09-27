package e2e

import (
	"bytes"
	"io"
	"net"
	"net/http"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
	"github.com/shreyasprajapti/kairos/internal/scenario"
	"github.com/shreyasprajapti/kairos/internal/trigger"
)

func startTarget(t *testing.T) (net.Listener, string, func()) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to start target: %v", err)
	}

	go func() {
		for {
			conn, err := l.Accept()
			if err != nil {
				return
			}
			go func(c net.Conn) {
				defer c.Close()
				io.Copy(c, c)
			}(conn)
		}
	}()

	return l, l.Addr().String(), func() { l.Close() }
}

func TestE2E_ProxyWithControlPlane(t *testing.T) {
	_, targetAddr, closeTarget := startTarget(t)
	defer closeTarget()

	proxyAddr := "127.0.0.1:19001"
	apiAddr := "127.0.0.1:19002"

	// 1. Setup Backend Services
	cfg := config.NewChaosConfig()
	p, err := proxy.NewProxy(proxyAddr, targetAddr)
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	p.Use(middleware.NewLatencyMiddleware(cfg))
	p.Use(middleware.NewResetMiddleware(cfg))

	// Setup trigger for scenario testing
	trig := trigger.NewEveryNthConnection(2)
	p.SetTrigger(trig)

	go p.Start()
	defer p.Stop()

	// 2. Setup HTTP API
	apiServer := api.NewServer(p.Registry(), p.Metrics(), cfg)
	
	go func() {
		if err := apiServer.Start(apiAddr); err != nil && err != http.ErrServerClosed {
			// Ignore server closed errors
		}
	}()
	time.Sleep(100 * time.Millisecond) // Wait for listeners to boot

	// 3. Verify normal traffic (No chaos)
	client, err := net.Dial("tcp", proxyAddr)
	if err != nil {
		t.Fatalf("failed to connect to proxy: %v", err)
	}
	
	start := time.Now()
	client.Write([]byte("ping"))
	buf := make([]byte, 4)
	io.ReadFull(client, buf)
	if time.Since(start) > 50*time.Millisecond {
		t.Errorf("Normal traffic too slow, took %v", time.Since(start))
	}
	client.Close()

	// 4. Enable chaos via HTTP Control Plane
	reqBody := `{"enabled": true, "delay_ms": 100}`
	resp, err := http.Post("http://"+apiAddr+"/chaos/latency", "application/json", bytes.NewBufferString(reqBody))
	if err != nil {
		t.Fatalf("failed to call api: %v", err)
	}
	resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("API returned %d", resp.StatusCode)
	}

	// 5. Verify Latency behavior
	// Note: Our trigger is set to EveryNthConnection=2. 
	// The previous connection was #1. This next one is #2, so it will trigger the scenario/middleware!
	client2, err := net.Dial("tcp", proxyAddr)
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	
	start = time.Now()
	client2.Write([]byte("pong"))
	io.ReadFull(client2, buf)
	if time.Since(start) < 100*time.Millisecond {
		t.Errorf("Chaos not applied, took %v (expected > 100ms)", time.Since(start))
	}
	client2.Close()

	// Connection 3 should NOT have chaos (because Every 2nd connection triggers it, wait, trigger ShouldApply increments)
	// Actually ConnectionTrigger returns true when `count % N == 0`. So 1(false), 2(true), 3(false).
	client3, err := net.Dial("tcp", proxyAddr)
	if err == nil {
		start = time.Now()
		client3.Write([]byte("fast"))
		io.ReadFull(client3, buf)
		if time.Since(start) > 50*time.Millisecond {
			t.Errorf("Chaos applied incorrectly to 3rd conn, took %v", time.Since(start))
		}
		client3.Close()
	}

	// 6. Test Scenario execution
	eng := scenario.NewEngine(cfg)
	sched := scenario.NewScheduler(eng)
	
	// Create a dummy scenario
	scen := &scenario.Scenario{
		Steps: []scenario.Step{
			{
				After: "100ms",
				Reset: &scenario.ResetScenario{Enabled: true, AfterSeconds: 1},
			},
		},
	}
	
	sched.Run(scen)
	time.Sleep(150 * time.Millisecond) // Wait for step to apply

	enabled, after := cfg.GetReset()
	if !enabled || after != 1*time.Second {
		t.Errorf("Scenario step did not apply correctly: enabled=%v after=%v", enabled, after)
	}
}
