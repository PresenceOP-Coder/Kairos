package api
type LatencyRequest struct {
	Enabled bool `json:"enabled"`
	DelayMS int  `json:"delay_ms"`
}

type ChaosResponse struct {
	LatencyEnabled bool  `json:"latency_enabled"`
	LatencyDelayMS int64 `json:"latency_delay_ms"`
}

// Structs for the Frontend UI (Milestone 21.6 & 21.7)
type ExperimentResponse struct {
	ID             string                   `json:"id"`
	Name           string                   `json:"name"`
	Status         string                   `json:"status"`
	TargetProxyIDs []string                 `json:"targetProxyIds"`
	Faults         []map[string]interface{} `json:"faults"`
	StartTime      string                   `json:"startTime"`
	EndTime        string                   `json:"endTime,omitempty"`
}

type ScenarioResponse struct {
	ID          string               `json:"id"`
	Name        string               `json:"name"`
	Description string               `json:"description"`
	Experiments []ExperimentResponse `json:"experiments"`
}
