package scenario

import (
	"log"
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
		log.Printf("[Scheduler] Applied Latency: enabled=%v, delay=%dms", step.Latency.Enabled, step.Latency.DelayMS)
	}

	if step.Jitter != nil {
		e.config.SetJitter(
			step.Jitter.Enabled,
			time.Duration(step.Jitter.MinMS)*time.Millisecond,
			time.Duration(step.Jitter.MaxMS)*time.Millisecond,
		)
		log.Printf("[Scheduler] Applied Jitter: enabled=%v, min=%dms, max=%dms", step.Jitter.Enabled, step.Jitter.MinMS, step.Jitter.MaxMS)
	}

	if step.Bandwidth != nil {
		e.config.SetBandwidth(
			step.Bandwidth.Enabled,
			int64(step.Bandwidth.RateKBPS),
		)
		log.Printf("[Scheduler] Applied Bandwidth: enabled=%v, rate=%dkbps", step.Bandwidth.Enabled, step.Bandwidth.RateKBPS)
	}

	if step.Reset != nil {
		e.config.SetReset(
			step.Reset.Enabled,
			time.Duration(step.Reset.AfterSeconds)*time.Second,
		)
		log.Printf("[Scheduler] Applied Reset: enabled=%v, after=%ds", step.Reset.Enabled, step.Reset.AfterSeconds)
	}

	if step.PacketLoss != nil {
		e.config.SetPacketLoss(
			step.PacketLoss.Enabled,
			step.PacketLoss.Percent,
		)
		log.Printf("[Scheduler] Applied PacketLoss: enabled=%v, percent=%d%%", step.PacketLoss.Enabled, step.PacketLoss.Percent)
	}
}

func (s *Scheduler) Run(sc *Scenario) error {

	go func() {

		for i, step := range sc.Steps {

			d, err := parseAfter(step.After)
			if err != nil {
				log.Printf("[Scheduler] Failed to parse duration %q: %v", step.After, err)
				return
			}

			log.Printf("[Scheduler] Step %d will execute after %v...", i+1, d)
			time.Sleep(d)

			log.Printf("[Scheduler] Triggering Step %d (offset %v)", i+1, d)
			s.engine.ApplyStep(step)
		}

	}()

	return nil
}
