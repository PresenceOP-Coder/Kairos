package proxy

import (
	"fmt"
	"net"
)

func (p *Proxy) acceptLoop() error {
	for {
		conn, err := p.listener.Accept()

		if err != nil {
			return err
		}

		p.handleConn(conn)
	}

}

func (p *Proxy) handleConn(conn net.Conn) {
	defer conn.Close()

	fmt.Printf("[Kairos] New connection from %s\n", conn.RemoteAddr())
}
