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