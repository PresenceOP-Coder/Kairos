package api

import (
	"encoding/json"
	"net/http"
	"time"
)

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	}); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}
func (s *Server) connectionsHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	connections := s.registry.List()

	resp := make([]ConnectionResponse, 0, len(connections))

	for _, conn := range connections {

		resp = append(resp, ConnectionResponse{
			ID:     conn.ID,
			Client: conn.Client.RemoteAddr().String(),
			Target: conn.Target.RemoteAddr().String(),
			Uptime: time.Since(conn.StartedAt).String(),
		})
	}

	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server) statsHandler(w http.ResponseWriter, r *http.Request) {

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(s.metrics.Snapshot()); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func (s *Server)latencyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusBadRequest)
		return
	}

	var req LatencyRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "json error", http.StatusBadRequest)
		return
	}

	s.config.SetLatency(
		req.Enabled,
		time.Duration(req.DelayMS)*time.Microsecond,
	)

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(
		map[string]string{
			"status":"updated",
		},
	)
}
