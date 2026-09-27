package proxy

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"sync"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
)

// startTestTarget starts a local TCP server that echoes data back.
func startTestTarget(t *testing.T) (net.Listener, string, func()) {
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("failed to start test target: %v", err)
	}

	go func() {
		for {
			conn, err := l.Accept()
			if err != nil {
				return // Closed
			}
			go func(c net.Conn) {
				defer c.Close()
				io.Copy(c, c) // Echo back
			}(conn)
		}
	}()

	return l, l.Addr().String(), func() { l.Close() }
}

func startProxy(t *testing.T, p *Proxy) {
	go func() {
		if err := p.Start(); err != nil {
			// Expected when stopped
		}
	}()
	for i := 0; i < 50; i++ {
		if p.listener != nil {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("proxy listener failed to start")
}

func TestProxy_BasicForwardingAndMetrics(t *testing.T) {
	_, targetAddr, closeTarget := startTestTarget(t)
	defer closeTarget()

	p, err := NewProxy("127.0.0.1:0", targetAddr)
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	
	startProxy(t, p)
	defer p.Stop()

	// Connect to proxy
	client, err := net.Dial("tcp", p.listener.Addr().String())
	if err != nil {
		t.Fatalf("failed to connect to proxy: %v", err)
	}

	time.Sleep(50 * time.Millisecond) // Give acceptLoop time to register
	if len(p.registry.List()) != 1 {
		t.Errorf("Expected 1 connection in registry, got %d", len(p.registry.List()))
	}

	msg := []byte("hello kairos")
	client.Write(msg)

	buf := make([]byte, len(msg))
	_, err = io.ReadFull(client, buf)
	if err != nil {
		t.Fatalf("failed to read from proxy: %v", err)
	}

	if !bytes.Equal(buf, msg) {
		t.Errorf("Expected %q, got %q", string(msg), string(buf))
	}

	client.Close()
	time.Sleep(50 * time.Millisecond) // Give handleConn time to cleanup

	if len(p.registry.List()) != 0 {
		t.Errorf("Expected 0 connections in registry after close, got %d", len(p.registry.List()))
	}

	snap := p.metrics.Snapshot()
	if snap.TotalConnections != 1 {
		t.Errorf("Expected TotalConnections=1, got %d", snap.TotalConnections)
	}
	if snap.ActiveConnections != 0 {
		t.Errorf("Expected ActiveConnections=0, got %d", snap.ActiveConnections)
	}
	if snap.FailedConnections != 0 {
		t.Errorf("Expected FailedConnections=0, got %d", snap.FailedConnections)
	}
	if snap.BytesSent == 0 || snap.BytesReceived == 0 {
		t.Errorf("Expected bytes sent/received > 0, got sent=%d, recv=%d", snap.BytesSent, snap.BytesReceived)
	}
}

func TestProxy_FailedTarget(t *testing.T) {
	p, err := NewProxy("127.0.0.1:0", "127.0.0.1:99999")
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	
	startProxy(t, p)
	defer p.Stop()

	client, err := net.Dial("tcp", p.listener.Addr().String())
	if err != nil {
		t.Fatalf("failed to connect to proxy: %v", err)
	}
	
	client.Write([]byte("test"))
	
	buf := make([]byte, 10)
	_, err = client.Read(buf)
	if err == nil {
		t.Errorf("Expected read error/EOF, got none")
	}

	time.Sleep(50 * time.Millisecond)

	snap := p.metrics.Snapshot()
	if snap.FailedConnections != 1 {
		t.Errorf("Expected FailedConnections=1, got %d", snap.FailedConnections)
	}
	if len(p.registry.List()) != 0 {
		t.Errorf("Expected registry to be empty, got %d", len(p.registry.List()))
	}
}

func TestProxy_MultipleSimultaneousConnections(t *testing.T) {
	_, targetAddr, closeTarget := startTestTarget(t)
	defer closeTarget()

	p, err := NewProxy("127.0.0.1:0", targetAddr)
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	
	startProxy(t, p)
	defer p.Stop()

	numClients := 10
	var wg sync.WaitGroup
	wg.Add(numClients)

	for i := 0; i < numClients; i++ {
		go func(id int) {
			defer wg.Done()
			client, err := net.Dial("tcp", p.listener.Addr().String())
			if err != nil {
				t.Errorf("failed to connect: %v", err)
				return
			}
			defer client.Close()

			msg := []byte(fmt.Sprintf("client-%d", id))
			client.Write(msg)

			buf := make([]byte, len(msg))
			io.ReadFull(client, buf)

			if !bytes.Equal(buf, msg) {
				t.Errorf("Expected %q, got %q", string(msg), string(buf))
			}
		}(i)
	}

	wg.Wait()
	time.Sleep(50 * time.Millisecond)

	snap := p.metrics.Snapshot()
	if snap.TotalConnections != uint64(numClients) {
		t.Errorf("Expected TotalConnections=%d, got %d", numClients, snap.TotalConnections)
	}
}

func TestProxy_MiddlewareIntegration(t *testing.T) {
	_, targetAddr, closeTarget := startTestTarget(t)
	defer closeTarget()

	cfg := config.NewChaosConfig()
	cfg.SetLatency(true, 50*time.Millisecond)

	p, err := NewProxy("127.0.0.1:0", targetAddr)
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	
	p.Use(middleware.NewLatencyMiddleware(cfg))
	startProxy(t, p)
	defer p.Stop()

	client, err := net.Dial("tcp", p.listener.Addr().String())
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}
	defer client.Close()

	start := time.Now()
	client.Write([]byte("ping"))
	buf := make([]byte, 4)
	io.ReadFull(client, buf)
	duration := time.Since(start)

	if duration < 100*time.Millisecond {
		t.Errorf("Expected duration >= 100ms, got %v", duration)
	}
}

func TestProxy_HalfClose(t *testing.T) {
	_, targetAddr, closeTarget := startTestTarget(t)
	defer closeTarget()

	p, err := NewProxy("127.0.0.1:0", targetAddr)
	if err != nil {
		t.Fatalf("failed to create proxy: %v", err)
	}
	startProxy(t, p)
	defer p.Stop()

	client, err := net.Dial("tcp", p.listener.Addr().String())
	if err != nil {
		t.Fatalf("failed to connect: %v", err)
	}

	client.Write([]byte("half"))
	
	if tcp, ok := client.(*net.TCPConn); ok {
		tcp.CloseWrite()
	}

	buf := make([]byte, 4)
	_, err = io.ReadFull(client, buf)
	if err != nil {
		t.Errorf("Expected to read echo after half-close, got err: %v", err)
	}

	_, err = client.Read(make([]byte, 10))
	if err != io.EOF {
		t.Errorf("Expected EOF, got %v", err)
	}
	
	client.Close()
}
