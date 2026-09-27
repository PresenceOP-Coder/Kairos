package scenario

import (
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

func TestEngineApply_UpdatesConfig(t *testing.T) {
	cfg := config.NewChaosConfig()
	engine := NewEngine(cfg)

	sc := &Scenario{
		Latency: LatencyScenario{
			Enabled: true,
			DelayMS: 500,
		},
		Jitter: JitterScenario{
			Enabled: true,
			MinMS:   100,
			MaxMS:   300,
		},
		Bandwidth: BandwidthScenario{
			Enabled:  true,
			RateKBPS: 200,
		},
		Reset: ResetScenario{
			Enabled:      true,
			AfterSeconds: 10,
		},
		PacketLoss: PacketLossScenario{
			Enabled: true,
			Percent: 25,
		},
		Blackhole: BlackholeScenario{
			Enabled: true,
		},
	}

	engine.Apply(sc)

	latencyEnabled, latencyDelay := cfg.GetLatency()
	if !latencyEnabled {
		t.Error("expected latency to be enabled")
	}
	if latencyDelay != 500*time.Millisecond {
		t.Errorf("expected latency delay 500ms, got %v", latencyDelay)
	}

	jitterEnabled, jitterMin, jitterMax := cfg.GetJitter()
	if !jitterEnabled {
		t.Error("expected jitter to be enabled")
	}
	if jitterMin != 100*time.Millisecond {
		t.Errorf("expected jitter min 100ms, got %v", jitterMin)
	}
	if jitterMax != 300*time.Millisecond {
		t.Errorf("expected jitter max 300ms, got %v", jitterMax)
	}

	bandwidthEnabled, bandwidthRate := cfg.GetBandwidth()
	if !bandwidthEnabled {
		t.Error("expected bandwidth to be enabled")
	}
	if bandwidthRate != 200 {
		t.Errorf("expected bandwidth rate 200, got %d", bandwidthRate)
	}

	resetEnabled, resetAfter := cfg.GetReset()
	if !resetEnabled {
		t.Error("expected reset to be enabled")
	}
	if resetAfter != 10*time.Second {
		t.Errorf("expected reset after 10s, got %v", resetAfter)
	}

	packetLossEnabled, packetLossPercent := cfg.GetPacketLoss()
	if !packetLossEnabled {
		t.Error("expected packet loss to be enabled")
	}
	if packetLossPercent != 25 {
		t.Errorf("expected packet loss 25%%, got %d%%", packetLossPercent)
	}

	if !cfg.GetBlackhole() {
		t.Error("expected blackhole to be enabled")
	}
}

func TestEngineApplyStep_UpdatesOnlySpecifiedFields(t *testing.T) {
	cfg := config.NewChaosConfig()
	engine := NewEngine(cfg)

	// Establish existing state.
	cfg.SetLatency(false, 100*time.Millisecond)
	cfg.SetJitter(true, 50*time.Millisecond, 100*time.Millisecond)
	cfg.SetBandwidth(true, 200)
	cfg.SetPacketLoss(true, 20)

	step := Step{
		After: "5s",
		Latency: &LatencyScenario{
			Enabled: true,
			DelayMS: 500,
		},
	}

	engine.ApplyStep(step)

	// Latency should change.
	latencyEnabled, latencyDelay := cfg.GetLatency()

	if !latencyEnabled {
		t.Error("expected latency to be enabled")
	}

	if latencyDelay != 500*time.Millisecond {
		t.Errorf("expected latency delay 500ms, got %v", latencyDelay)
	}

	// Jitter should remain unchanged.
	jitterEnabled, jitterMin, jitterMax := cfg.GetJitter()

	if !jitterEnabled {
		t.Error("expected jitter to remain enabled")
	}

	if jitterMin != 50*time.Millisecond {
		t.Errorf("expected jitter min to remain 50ms, got %v", jitterMin)
	}

	if jitterMax != 100*time.Millisecond {
		t.Errorf("expected jitter max to remain 100ms, got %v", jitterMax)
	}

	// Bandwidth should remain unchanged.
	bandwidthEnabled, bandwidthRate := cfg.GetBandwidth()

	if !bandwidthEnabled {
		t.Error("expected bandwidth to remain enabled")
	}

	if bandwidthRate != 200 {
		t.Errorf("expected bandwidth rate to remain 200, got %d", bandwidthRate)
	}

	// Packet loss should remain unchanged.
	packetLossEnabled, packetLossPercent := cfg.GetPacketLoss()

	if !packetLossEnabled {
		t.Error("expected packet loss to remain enabled")
	}

	if packetLossPercent != 20 {
		t.Errorf("expected packet loss to remain 20%%, got %d%%", packetLossPercent)
	}
}

func TestParseAfter(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected time.Duration
		wantErr  bool
	}{
		{
			name:     "seconds",
			input:    "5s",
			expected: 5 * time.Second,
		},
		{
			name:     "milliseconds",
			input:    "500ms",
			expected: 500 * time.Millisecond,
		},
		{
			name:     "minutes",
			input:    "2m",
			expected: 2 * time.Minute,
		},
		{
			name:    "invalid duration",
			input:   "invalid",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := parseAfter(tt.input)

			if tt.wantErr {
				if err == nil {
					t.Fatal("expected error, got nil")
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if got != tt.expected {
				t.Errorf("expected %v, got %v", tt.expected, got)
			}
		})
	}
}

func TestSchedulerRun_AppliesStep(t *testing.T) {
	cfg := config.NewChaosConfig()
	engine := NewEngine(cfg)
	scheduler := NewScheduler(engine)

	// Start with latency disabled.
	cfg.SetLatency(false, 0)

	sc := &Scenario{
		Steps: []Step{
			{
				After: "20ms",
				Latency: &LatencyScenario{
					Enabled: true,
					DelayMS: 500,
				},
			},
		},
	}

	err := scheduler.Run(sc)
	if err != nil {
		t.Fatalf("unexpected scheduler error: %v", err)
	}

	// Before the scheduled delay, latency should still be disabled.
	enabled, _ := cfg.GetLatency()

	if enabled {
		t.Fatal("expected latency to remain disabled before scheduled step")
	}

	// Wait for the scheduler to execute.
	time.Sleep(50 * time.Millisecond)

	enabled, delay := cfg.GetLatency()

	if !enabled {
		t.Fatal("expected latency to be enabled after scheduled step")
	}

	if delay != 500*time.Millisecond {
		t.Errorf("expected latency delay 500ms, got %v", delay)
	}
}