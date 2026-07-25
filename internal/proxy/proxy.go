package proxy

import (
	"fmt"
	"net"
)

type Proxy struct {
	listenAddr string
	targerAddr     string
	listener net.Listener
}

func New( listnerAddr,targetAddr string) *Proxy {
	return &Proxy{
		listenAddr: listnerAddr,
		targerAddr:targetAddr ,
	}
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

