package api

import (
	"net/http"

	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/proxy"
	"github.com/shreyasprajapti/kairos/internal/scenario"
)

type Server struct {
	registry *proxy.Registry
	metrics  *proxy.Metrics
	config   *config.ChaosConfig
	scenario *scenario.Scenario
}

func NewServer(registry *proxy.Registry, metrics *proxy.Metrics, config *config.ChaosConfig, sc *scenario.Scenario) *Server {
	return &Server{
		registry: registry,
		metrics:  metrics,
		config:   config,
		scenario: sc,
	}
}

func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.routes())
}
