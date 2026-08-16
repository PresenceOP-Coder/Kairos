package scenario

type Scenario struct {
	Latency  LatencyScenario  `json:"latency"`
	Jitter   JitterScenario   `json:"jitter"`
	Bandwidth BandwidthScenario `json:"bandwidth"`
	Reset    ResetScenario    `json:"reset"`
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
	Enabled bool `json:"enabled"`
	RateKBPS int `json:"rate_kbps"`
}

type ResetScenario struct {
	Enabled      bool `json:"enabled"`
	AfterSeconds int  `json:"after_seconds"`
}