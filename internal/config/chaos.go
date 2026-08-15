package config

import (
	"sync"
	"time"
)

type ChaosConfig struct {
	mu sync.RWMutex

	// Latency
	LatencyEnabled bool
	LatencyDelay   time.Duration

	// Jitter
	JitterEnabled bool
	JitterMin     time.Duration
	JitterMax     time.Duration

	// Bandwidth (bytes/sec, 0 = unlimited)
	BandwidthEnabled bool
	BandwidthRate    int64

	// Reset (force-close connection after a duration)
	ResetEnabled bool
	ResetAfter   time.Duration
}

func NewChaosConfig() *ChaosConfig {
	return &ChaosConfig{
		LatencyDelay: 500 * time.Millisecond,
		JitterMin:    100 * time.Millisecond,
		JitterMax:    500 * time.Millisecond,
		BandwidthRate: 100 * 1024, // 100 KB/s default
		ResetAfter:   5 * time.Second,
	}
}

// --- Latency ---

func (c *ChaosConfig) GetLatency() (bool, time.Duration) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.LatencyEnabled, c.LatencyDelay
}

func (c *ChaosConfig) SetLatency(enabled bool, delay time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.LatencyEnabled = enabled
	c.LatencyDelay = delay
}

// --- Jitter ---

func (c *ChaosConfig) GetJitter() (bool, time.Duration, time.Duration) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.JitterEnabled, c.JitterMin, c.JitterMax
}

func (c *ChaosConfig) SetJitter(enabled bool, min, max time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.JitterEnabled = enabled
	c.JitterMin = min
	c.JitterMax = max
}

// --- Bandwidth ---

func (c *ChaosConfig) GetBandwidth() (bool, int64) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.BandwidthEnabled, c.BandwidthRate
}

func (c *ChaosConfig) SetBandwidth(enabled bool, rate int64) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.BandwidthEnabled = enabled
	c.BandwidthRate = rate
}

// --- Reset ---

func (c *ChaosConfig) GetReset() (bool, time.Duration) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	return c.ResetEnabled, c.ResetAfter
}

func (c *ChaosConfig) SetReset(enabled bool, after time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	c.ResetEnabled = enabled
	c.ResetAfter = after
}
