package scenario

import (
	"os"
	"testing"
)

func TestLoad_ValidScenario(t *testing.T) {
	data := `{
		"latency": {
			"enabled": true,
			"delay_ms": 500
		},
		"jitter": {
			"enabled": true,
			"min_ms": 100,
			"max_ms": 300
		},
		"bandwidth": {
			"enabled": true,
			"rate_kbps": 100
		},
		"reset": {
			"enabled": false,
			"after_seconds": 10
		},
		"packet_loss": {
			"enabled": true,
			"percent": 20
		},
		"blackhole": {
			"enabled": false
		}
	}`

	file, err := os.CreateTemp("", "kairos-scenario-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer os.Remove(file.Name())

	if _, err := file.WriteString(data); err != nil {
		t.Fatalf("failed to write scenario: %v", err)
	}

	if err := file.Close(); err != nil {
		t.Fatalf("failed to close scenario file: %v", err)
	}

	sc, err := Load(file.Name())
	if err != nil {
		t.Fatalf("unexpected load error: %v", err)
	}

	if !sc.Latency.Enabled {
		t.Error("expected latency to be enabled")
	}

	if sc.Latency.DelayMS != 500 {
		t.Errorf("expected latency delay 500ms, got %dms", sc.Latency.DelayMS)
	}

	if sc.Jitter.MinMS != 100 {
		t.Errorf("expected jitter min 100ms, got %dms", sc.Jitter.MinMS)
	}

	if sc.Jitter.MaxMS != 300 {
		t.Errorf("expected jitter max 300ms, got %dms", sc.Jitter.MaxMS)
	}

	if sc.Bandwidth.RateKBPS != 100 {
		t.Errorf("expected bandwidth 100kbps, got %d", sc.Bandwidth.RateKBPS)
	}

	if sc.PacketLoss.Percent != 20 {
		t.Errorf("expected packet loss 20%%, got %d%%", sc.PacketLoss.Percent)
	}

	if sc.Blackhole.Enabled {
		t.Error("expected blackhole to be disabled")
	}
}

func TestLoad_InvalidJSON(t *testing.T) {
	data := `{
		"latency": {
			"enabled": true,
			"delay_ms": 500
		},
		"jitter": {
			"enabled": true,
			"min_ms": 100,
			"max_ms": 300
		}` // Missing closing brace

	file, err := os.CreateTemp("", "kairos-invalid-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer os.Remove(file.Name())

	if _, err := file.WriteString(data); err != nil {
		t.Fatalf("failed to write scenario: %v", err)
	}

	if err := file.Close(); err != nil {
		t.Fatalf("failed to close scenario file: %v", err)
	}

	_, err = Load(file.Name())

	if err == nil {
		t.Fatal("expected Load to return an error for invalid JSON")
	}
}

func TestLoad_Trigger(t *testing.T) {
	data := `{
		"trigger": {
			"every_nth_connection": 5
		}
	}`

	file, err := os.CreateTemp("", "kairos-trigger-*.json")
	if err != nil {
		t.Fatalf("failed to create temp file: %v", err)
	}
	defer os.Remove(file.Name())

	if _, err := file.WriteString(data); err != nil {
		t.Fatalf("failed to write scenario: %v", err)
	}

	if err := file.Close(); err != nil {
		t.Fatalf("failed to close scenario file: %v", err)
	}

	sc, err := Load(file.Name())
	if err != nil {
		t.Fatalf("unexpected load error: %v", err)
	}

	if sc.Trigger.EveryNthConnection != 5 {
		t.Errorf(
			"expected every_nth_connection to be 5, got %d",
			sc.Trigger.EveryNthConnection,
		)
	}
}