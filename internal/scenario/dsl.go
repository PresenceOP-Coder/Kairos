package scenario

import (
	"fmt"
	"time"
)

type Step struct {
	After string `json:"after"`

	Latency    *LatencyScenario    `json:"latency,omitempty"`
	Jitter     *JitterScenario     `json:"jitter,omitempty"`
	Bandwidth  *BandwidthScenario  `json:"bandwidth,omitempty"`
	Reset      *ResetScenario      `json:"reset,omitempty"`
	PacketLoss *PacketLossScenario `json:"packet_loss,omitempty"`
	Blackhole  *BlackholeScenario  `json:"blackhole,omitempty"`
}

type Scenario struct {
	Trigger Trigger `json:"trigger"`

	Latency    LatencyScenario    `json:"latency"`
	Jitter     JitterScenario     `json:"jitter"`
	Bandwidth  BandwidthScenario  `json:"bandwidth"`
	Reset      ResetScenario      `json:"reset"`
	PacketLoss PacketLossScenario `json:"packet_loss"`
	Blackhole  BlackholeScenario  `json:"blackhole"`
	Steps      []Step             `json:"steps"`
}

type LatencyScenario struct {
	Enabled bool `json:"enabled"`
	DelayMS int  `json:"delay_ms"`
}

type JitterScenario struct {
	Enabled bool `json:"enabled"`
	MinMS   int  `json:"min_ms"`
	MaxMS   int  `json:"max_ms"`
}

type BandwidthScenario struct {
	Enabled  bool `json:"enabled"`
	RateKBPS int  `json:"rate_kbps"`
}

type ResetScenario struct {
	Enabled      bool `json:"enabled"`
	AfterSeconds int  `json:"after_seconds"`
}

type PacketLossScenario struct {
	Enabled bool `json:"enabled"`
	Percent int  `json:"percent"`
}

type Trigger struct {
	EveryNthConnection int `json:"every_nth_connection,omitempty"`
	AfterRequests      int `json:"after_requests,omitempty"`
}

type BlackholeScenario struct {
	Enabled bool `json:"enabled"`
}

// Validate ensures the scenario configuration contains logically valid settings.
func (s *Scenario) Validate() error {
	if s.Trigger.EveryNthConnection < 0 {
		return fmt.Errorf("trigger every_nth_connection cannot be negative")
	}
	if s.Latency.DelayMS < 0 {
		return fmt.Errorf("latency delay_ms cannot be negative")
	}
	if s.Jitter.MinMS < 0 || s.Jitter.MaxMS < 0 {
		return fmt.Errorf("jitter min_ms and max_ms cannot be negative")
	}
	if s.Jitter.Enabled && s.Jitter.MinMS > s.Jitter.MaxMS {
		return fmt.Errorf("jitter min_ms cannot be greater than max_ms")
	}
	if s.Bandwidth.RateKBPS < 0 {
		return fmt.Errorf("bandwidth rate_kbps cannot be negative")
	}
	if s.Reset.AfterSeconds < 0 {
		return fmt.Errorf("reset after_seconds cannot be negative")
	}
	if s.PacketLoss.Percent < 0 || s.PacketLoss.Percent > 100 {
		return fmt.Errorf("packet_loss percent must be between 0 and 100")
	}

	for i, step := range s.Steps {
		if step.After == "" {
			return fmt.Errorf("step %d: after duration string cannot be empty", i)
		}
		d, err := time.ParseDuration(step.After)
		if err != nil {
			return fmt.Errorf("step %d: invalid after duration %q: %w", i, step.After, err)
		}
		if d < 0 {
			return fmt.Errorf("step %d: after duration %q cannot be negative", i, step.After)
		}
		if step.Latency != nil && step.Latency.DelayMS < 0 {
			return fmt.Errorf("step %d: latency delay_ms cannot be negative", i)
		}
		if step.Jitter != nil {
			if step.Jitter.MinMS < 0 || step.Jitter.MaxMS < 0 {
				return fmt.Errorf("step %d: jitter min_ms and max_ms cannot be negative", i)
			}
			if step.Jitter.Enabled && step.Jitter.MinMS > step.Jitter.MaxMS {
				return fmt.Errorf("step %d: jitter min_ms cannot be greater than max_ms", i)
			}
		}
		if step.Bandwidth != nil && step.Bandwidth.RateKBPS < 0 {
			return fmt.Errorf("step %d: bandwidth rate_kbps cannot be negative", i)
		}
		if step.Reset != nil && step.Reset.AfterSeconds < 0 {
			return fmt.Errorf("step %d: reset after_seconds cannot be negative", i)
		}
		if step.PacketLoss != nil && (step.PacketLoss.Percent < 0 || step.PacketLoss.Percent > 100) {
			return fmt.Errorf("step %d: packet_loss percent must be between 0 and 100", i)
		}
	}

	return nil
}
