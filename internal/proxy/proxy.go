package proxy

import (
	"fmt"
	"net"

	"github.com/shreyasprajapti/kairos/internal/middleware"
)

type Proxy struct {
	listenAddr string
	targerAddr string
	listener   net.Listener

	registry   *Registry
	metrics *Metrics
	nextConnID uint64

	middleware []middleware.Middleware
}


func NewProxy(listnerAddr, targetAddr string) (*Proxy, error) {
	return &Proxy{
		listenAddr: listnerAddr,
		targerAddr: targetAddr,
		registry:   NewRegistry(),
		metrics: NewMetrics(),
	}, nil
}
func (p *Proxy) Registry() *Registry {
	return p.registry
}

func (p *Proxy) Start() error {
	listener, err := net.Listen("tcp", p.listenAddr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", p.listenAddr, err)
	}

	p.listener = listener

	fmt.Printf("[Kairos] Listening on %s\n", p.listenAddr)

	return p.acceptLoop()
}

func (p *Proxy) Metrics() *Metrics {
	return p.metrics
}

func(p *Proxy) Use(m middleware.Middleware){
	p.middleware = append(p.middleware,m)
}