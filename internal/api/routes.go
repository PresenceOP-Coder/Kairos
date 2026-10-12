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
	mux.HandleFunc("/scenarios", s.scenariosHandler)
	mux.HandleFunc("/experiments", s.experimentsHandler)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		mux.ServeHTTP(w, r)
	})
}
