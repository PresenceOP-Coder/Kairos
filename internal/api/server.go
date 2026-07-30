package api

import (
	"net/http"

	"github.com/shreyasprajapti/kairos/internal/proxy"
)

type Server struct {
	registry *proxy.Registry
}


func NewServer(registry *proxy.Registry) *Server {
	return &Server{
		registry: registry,
	}
}

func (s *Server) Start(addr string) error {
	return http.ListenAndServe(addr, s.routes())
}




