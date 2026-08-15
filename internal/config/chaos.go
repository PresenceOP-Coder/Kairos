package config

import (
	"sync"
	"time"
)

type ChaosConfig struct {
	mu             sync.RWMutex
	LatencyEnabled bool
	LatencyDelay   time.Duration
}

func NewChaosConfig () *ChaosConfig{
	return &ChaosConfig{
		LatencyDelay: 500*time.Millisecond,
	}
}

func (c *ChaosConfig) GetLatency() (bool , time.Duration){
	c.mu.Lock(); 
	defer c.mu.RUnlock()

	return c.LatencyEnabled, c.LatencyDelay
}

func (c *ChaosConfig) SetLatency(enabled bool, delay time.Duration){
	c.mu.Lock()
	defer c.mu.Unlock()

	c.LatencyEnabled = enabled
	c.LatencyDelay = delay
}

