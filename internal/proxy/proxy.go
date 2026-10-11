package proxy

import (
	"fmt"
	"net"
	"sync"

	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/trigger"
)

type Proxy struct {
	listenAddr string
	targetAddr string
	listener   net.Listener
	ready      chan struct{}

	registry   *Registry
	metrics    *Metrics
	nextConnID uint64

	mu         sync.RWMutex
	middleware []middleware.Middleware

	trigger trigger.Trigger
}

func NewProxy(listenAddr, targetAddr string) (*Proxy, error) {
	return &Proxy{
		listenAddr: listenAddr,
		targetAddr: targetAddr,
		registry:   NewRegistry(),
		metrics:    NewMetrics(),
		ready:      make(chan struct{}),
	}, nil
}

func (p *Proxy) Registry() *Registry {
	return p.registry
}

func (p *Proxy) Ready() <-chan struct{} {
	return p.ready
}

func (p *Proxy) Addr() string {
	<-p.ready
	p.mu.RLock()
	defer p.mu.RUnlock()
	if p.listener != nil {
		return p.listener.Addr().String()
	}
	return ""
}

func (p *Proxy) Start() error {
	listener, err := net.Listen("tcp", p.listenAddr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", p.listenAddr, err)
	}

	p.mu.Lock()
	p.listener = listener
	p.mu.Unlock()

	close(p.ready)

	fmt.Printf("[Kairos] Listening on %s\n", listener.Addr().String())

	return p.acceptLoop()
}

func (p *Proxy) Stop() error {
	p.mu.Lock()
	defer p.mu.Unlock()
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

func (p *Proxy) SetTrigger(t trigger.Trigger) {
	p.mu.Lock()
	defer p.mu.Unlock()
	p.trigger = t
}
