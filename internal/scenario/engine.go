package scenario

import (
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type Engine struct {
	config *config.ChaosConfig
}

func NewEngine(cfg *config.ChaosConfig) *Engine {
	return &Engine{config: cfg}
}

func (e *Engine) Apply(s *Scenario) {
	e.config.SetLatency(
		s.Latency.Enabled,
		time.Duration(s.Latency.DelayMS)*time.Millisecond,
	)

	e.config.SetJitter(
		s.Jitter.Enabled,
		time.Duration(s.Jitter.MinMS)*time.Millisecond,
		time.Duration(s.Jitter.MaxMS)*time.Millisecond,
	)

	e.config.SetBandwidth(
		s.Bandwidth.Enabled,
		int64(s.Bandwidth.RateKBPS),
	)

	e.config.SetReset(
		s.Reset.Enabled,
		time.Duration(s.Reset.AfterSeconds)*time.Second,
	)
}

func parseAfter(after string) (time.Duration, error) {
	return time.ParseDuration(after)
}