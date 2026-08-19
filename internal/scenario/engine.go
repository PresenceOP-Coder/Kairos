package scenario

import (
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type Scheduler struct {
	engine *Engine
}

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

	e.config.SetPacketLoss(
		s.PacketLoss.Enabled,
		s.PacketLoss.Percent,
	)
}

func parseAfter(after string) (time.Duration, error) {
	return time.ParseDuration(after)
}

func NewScheduler(engine *Engine) *Scheduler {
	return &Scheduler{
		engine: engine,
	}
}

func (e *Engine) ApplyStep(step Step) {
	if step.Latency != nil {
		e.config.SetLatency(
			step.Latency.Enabled,
			time.Duration(step.Latency.DelayMS)*time.Millisecond,
		)
	}

	if step.Jitter != nil {
		e.config.SetJitter(
			step.Jitter.Enabled,
			time.Duration(step.Jitter.MinMS)*time.Millisecond,
			time.Duration(step.Jitter.MaxMS)*time.Millisecond,
		)
	}

	if step.Bandwidth != nil {
		e.config.SetBandwidth(
			step.Bandwidth.Enabled,
			int64(step.Bandwidth.RateKBPS),
		)
	}

	if step.Reset != nil {
		e.config.SetReset(
			step.Reset.Enabled,
			time.Duration(step.Reset.AfterSeconds)*time.Second,
		)
	}

	if step.PacketLoss != nil {
		e.config.SetPacketLoss(
			step.PacketLoss.Enabled,
			step.PacketLoss.Percent,
		)
	}
}

func (s *Scheduler) Run(sc *Scenario) error {

	go func() {

		for _, step := range sc.Steps {

			d, err := parseAfter(step.After)
			if err != nil {
				return
			}

			time.Sleep(d)

			s.engine.ApplyStep(step)
		}

	}()

	return nil
}
