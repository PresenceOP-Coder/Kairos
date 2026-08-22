package scenario

type Step struct {
	After string `json:"after"`

	Latency    *LatencyScenario    `json:"latency,omitempty"`
	Jitter     *JitterScenario     `json:"jitter,omitempty"`
	Bandwidth  *BandwidthScenario  `json:"bandwidth,omitempty"`
	Reset      *ResetScenario      `json:"reset,omitempty"`
	PacketLoss *PacketLossScenario `json:"packet_loss,omitempty"`
}

type Scenario struct {
    Trigger Trigger `json:"trigger"`

    Latency   LatencyScenario
    Jitter    JitterScenario
    Bandwidth BandwidthScenario
    Reset     ResetScenario

    Steps []Step
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

