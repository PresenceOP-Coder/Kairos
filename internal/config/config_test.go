package config

import (
	"sync"
	"testing"
	"time"
)

func TestChaosConfig_SetAndGetLatency(t *testing.T) {
	config := NewChaosConfig()

	expectedEnabled := true
	expectedDelay := 2 * time.Second

	config.SetLatency(expectedEnabled, expectedDelay)

	enabled, delay := config.GetLatency()

	if enabled != expectedEnabled {
		t.Errorf("expected latency enabled=%v, got %v", expectedEnabled, enabled)
	}

	if delay != expectedDelay {
		t.Errorf("expected latency delay=%v, got %v", expectedDelay, delay)
	}
}

func TestChaosConfig_SetAndGetJitter(t *testing.T) {
	config := NewChaosConfig()

	expectedEnabled := true
	expectedMin := 100 * time.Millisecond
	expectedMax := 500 * time.Millisecond

	config.SetJitter(expectedEnabled, expectedMin, expectedMax)

	enabled, min, max := config.GetJitter()

	if enabled != expectedEnabled {
		t.Errorf("expected jitter enabled=%v, got %v", expectedEnabled, enabled)
	}

	if min != expectedMin {
		t.Errorf("expected jitter min=%v, got %v", expectedMin, min)
	}

	if max != expectedMax {
		t.Errorf("expected jitter max=%v, got %v", expectedMax, max)
	}
}

func TestChaosConfig_SetAndGetBandwidth(t *testing.T) {
	config := NewChaosConfig()

	expectedEnabled := true
	expectedRate := int64(100 * 1024)

	config.SetBandwidth(expectedEnabled, expectedRate)

	enabled, rate := config.GetBandwidth()

	if enabled != expectedEnabled {
		t.Errorf("expected bandwidth enabled=%v, got %v", expectedEnabled, enabled)
	}

	if rate != expectedRate {
		t.Errorf("expected bandwidth rate=%d, got %d", expectedRate, rate)
	}
}

func TestChaosConfig_SetAndGetReset(t *testing.T) {
	config := NewChaosConfig()

	expectedEnabled := true
	expectedAfter := 5 * time.Second

	config.SetReset(expectedEnabled, expectedAfter)

	enabled, after := config.GetReset()

	if enabled != expectedEnabled {
		t.Errorf("expected reset enabled=%v, got %v", expectedEnabled, enabled)
	}

	if after != expectedAfter {
		t.Errorf("expected reset after=%v, got %v", expectedAfter, after)
	}
}

func TestChaosConfig_SetAndGetPacketLoss(t *testing.T) {
	config := NewChaosConfig()

	expectedEnabled := true
	expectedPercent := 20

	config.SetPacketLoss(expectedEnabled, expectedPercent)

	enabled, percent := config.GetPacketLoss()

	if enabled != expectedEnabled {
		t.Errorf("expected packet loss enabled=%v, got %v", expectedEnabled, enabled)
	}

	if percent != expectedPercent {
		t.Errorf("expected packet loss percent=%d, got %d", expectedPercent, percent)
	}
}

func TestChaosConfig_SetAndGetBlackhole(t *testing.T) {
	config := NewChaosConfig()

	expected := true

	config.SetBlackhole(expected)

	actual := config.GetBlackhole()

	if actual != expected {
		t.Errorf("expected blackhole enabled=%v, got %v", expected, actual)
	}
}

func TestNewChaosConfig_Defaults(t *testing.T) {
	config := NewChaosConfig()

	if config.LatencyEnabled {
		t.Error("expected latency to be disabled by default")
	}

	if config.LatencyDelay != 500*time.Millisecond {
		t.Errorf(
			"expected latency delay=500ms, got %v",
			config.LatencyDelay,
		)
	}

	if config.JitterEnabled {
		t.Error("expected jitter to be disabled by default")
	}

	if config.JitterMin != 100*time.Millisecond {
		t.Errorf(
			"expected jitter min=100ms, got %v",
			config.JitterMin,
		)
	}

	if config.JitterMax != 500*time.Millisecond {
		t.Errorf(
			"expected jitter max=500ms, got %v",
			config.JitterMax,
		)
	}

	if config.BandwidthEnabled {
		t.Error("expected bandwidth to be disabled by default")
	}

	if config.BandwidthRate != 100*1024 {
		t.Errorf(
			"expected bandwidth rate=100KB/s, got %d",
			config.BandwidthRate,
		)
	}

	if config.ResetEnabled {
		t.Error("expected reset to be disabled by default")
	}

	if config.ResetAfter != 5*time.Second {
		t.Errorf(
			"expected reset after=5s, got %v",
			config.ResetAfter,
		)
	}

	if config.PacketLossEnabled {
		t.Error("expected packet loss to be disabled by default")
	}

	if config.PacketLossPercent != 20 {
		t.Errorf(
			"expected packet loss percent=20, got %d",
			config.PacketLossPercent,
		)
	}

	if config.GetBlackhole() {
		t.Error("expected blackhole to be disabled by default")
	}
}

func TestChaosConfig_ConcurrentAccess(t *testing.T) {
	config := NewChaosConfig()

	var wg sync.WaitGroup

	for i := 0; i < 100; i++ {
		wg.Add(2)

		go func() {
			defer wg.Done()
			config.SetLatency(true, 500*time.Millisecond)
		}()

		go func() {
			defer wg.Done()
			config.GetLatency()
		}()
	}

	wg.Wait()
}
