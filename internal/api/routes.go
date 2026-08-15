package api

import (
	"net/http"
)

type ConnectionResponse struct {
	ID     uint64 `json:"id"`
	Client string `json:"client"`
	Target string `json:"target"`
	Uptime string `json:"uptime"`
}

func (s *Server) routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", s.healthHandler)
	mux.HandleFunc("/connections", s.connectionsHandler)
	mux.HandleFunc("/stats", s.statsHandler)
	mux.HandleFunc("/chaos/latency", s.latencyHandler)
	mux.HandleFunc("/chaos", s.chaosHandler)
	return mux
}
