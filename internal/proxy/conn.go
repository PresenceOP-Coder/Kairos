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

func (p *Proxy) handleConn(client net.Conn) {
	defer client.Close()

	target, err := p.connectTarget()

	if err != nil{
		 return 
	}

	defer target.Close()

	fmt.Printf("[Kairos] Client Addr %s\n", client.RemoteAddr())
	fmt.Printf("[Kairos] Targer Addr %s\n", target.RemoteAddr())

}
