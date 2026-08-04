package proxy

import (
	"fmt"
	"net"
	"sync"

	"github.com/shreyasprajapti/kairos/internal/middleware"
)

type Proxy struct {
	listenAddr string
	targetAddr string
	listener   net.Listener

	registry   *Registry
	metrics    *Metrics
	nextConnID uint64

	mu         sync.RWMutex
	middleware []middleware.Middleware
}

func NewProxy(listenAddr, targetAddr string) (*Proxy, error) {
	return &Proxy{
		listenAddr: listenAddr,
		targetAddr: targetAddr,
		registry:   NewRegistry(),
		metrics:    NewMetrics(),
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

// Stop cleanly closes the listener.
func (p *Proxy) Stop() error {
	if p.listener != nil {
		return p.listener.Close()
	}
	return nil
}

func (p *Proxy) Metrics() *Metrics {
	return p.metrics
}

func (p *Proxy) Use(m middleware.Middleware) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.middleware = append(p.middleware, m)
}
