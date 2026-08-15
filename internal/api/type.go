package api
type LatencyRequest struct {
	Enabled bool `json:"enabled"`
	DelayMS int  `json:"delay_ms"`
}

type ChaosResponse struct {
	LatencyEnabled bool  `json:"latency_enabled"`
	LatencyDelayMS int64 `json:"latency_delay_ms"`
}