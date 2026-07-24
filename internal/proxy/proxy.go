package proxy

import (
	"fmt"
	"net"
)

type Proxy struct {
	addr     string
	listener net.Listener
}

func New(addr string) *Proxy {
	return &Proxy{
		addr: addr,
	}
}

func (p *Proxy) Start() error {
	listener, err := net.Listen("tcp", p.addr)
	if err != nil {
		return fmt.Errorf("failed to listen on %s: %w", p.addr, err)
	}

	p.listener = listener

	fmt.Printf("[Kairos] Listening on %s\n", p.addr)

	return p.acceptLoop()
}

