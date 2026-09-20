package api

import (
	"encoding/json"
	"net/http"
	"time"
)

// scenariosHandler returns mock scenarios to demonstrate API integration with the React UI.
// In the future, this should fetch actual state from your scenario.Engine.
func (s *Server) scenariosHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Hardcoded mock data to match the UI's expectations
	mockScenarios := []ScenarioResponse{
		{
			ID:          "scen-1",
			Name:        "High Latency Spike",
			Description: "Simulates a sudden 500ms latency spike across all active proxies for 2 minutes.",
			Experiments: []ExperimentResponse{
				{
					ID:             "exp-1",
					Name:           "Latency Injection",
					Status:         "completed",
					TargetProxyIDs: []string{"proxy-1"},
					Faults:         []map[string]interface{}{},
					StartTime:      time.Now().Add(-2 * time.Hour).Format(time.RFC3339),
				},
			},
		},
		{
			ID:          "scen-2",
			Name:        "Database Failover",
			Description: "Injects 100% connection resets to the database proxy to trigger and test failover mechanisms.",
			Experiments: []ExperimentResponse{},
		},
	}

	json.NewEncoder(w).Encode(mockScenarios)
}

// experimentsHandler returns mock experiments to demonstrate API integration with the React UI.
func (s *Server) experimentsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	mockExperiments := []ExperimentResponse{
		{
			ID:             "exp-1",
			Name:           "DB Latency Spike (Peak Hours)",
			Status:         "scheduled",
			TargetProxyIDs: []string{"proxy-db"},
			Faults: []map[string]interface{}{
				{"type": "latency", "percentage": 100, "delayMs": 200},
			},
			StartTime: time.Now().Add(1 * time.Hour).Format(time.RFC3339),
		},
		{
			ID:             "exp-2",
			Name:           "Payment Gateway Resets",
			Status:         "running",
			TargetProxyIDs: []string{"proxy-payments"},
			Faults: []map[string]interface{}{
				{"type": "reset", "percentage": 5},
			},
			StartTime: time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
		},
	}

	json.NewEncoder(w).Encode(mockExperiments)
}
