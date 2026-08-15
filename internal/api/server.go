package api

import (
	"net/http"

	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/proxy"
)

type Server struct {
	registry *proxy.Registry
	metrics  *proxy.Metrics
	config   *config.ChaosConfig
}

func NewServer(registry *proxy.Registry, metrics *proxy.Metrics, config *config.ChaosConfig) *Server {
	return &Server{
		registry: registry,
		metrics:  metrics,
		config : config,
	}
}

func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.routes())
}
