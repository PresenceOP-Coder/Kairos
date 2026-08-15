package api
type LatencyRequest struct {
	Enabled bool `json:"enabled"`
	DelayMS int  `json:"delay_ms"`
}