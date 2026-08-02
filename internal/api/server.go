package api

import (
	"net/http"

	"github.com/shreyasprajapti/kairos/internal/proxy"
)

type Server struct {
	registry *proxy.Registry
	metrics  *proxy.Metrics
}

func NewServer(registry *proxy.Registry,metrics *proxy.Metrics) *Server {
	return &Server{
		registry: registry,
		metrics:  metrics,
	}
}

func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.routes())
}
