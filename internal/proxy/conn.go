package proxy

import (
	"fmt"
	"io"
	"net"
	"sync"
	"time"
	"sync/atomic"
)

type Connection struct {
	ID        uint64
	Target    net.Conn
	Client    net.Conn
	StartedAt time.Time
}

func (p *Proxy) acceptLoop() error {
	for {
		conn, err := p.listener.Accept()

		if err != nil {
			return err
		}

		go p.handleConn(conn)
	}

}

func (p *Proxy) handleConn(client net.Conn) {
	defer client.Close()

	target, err := p.connectTarget()

	if err != nil {
		return
	}

	defer target.Close()
	
	fmt.Printf("[Kairos] Client Addr %s\n", client.RemoteAddr())
	fmt.Printf("[Kairos] Targer Addr %s\n", target.RemoteAddr())

	id := atomic.AddUint64(&p.nextConnID, 1)

	connection := &Connection{
		ID: id,
		Target: target,
		Client: client,
		StartedAt: time.Now(),
	}

	p.registry.Add(connection)
	defer p.registry.Remove(connection.ID)
	
	var wg sync.WaitGroup

	wg.Add(2)

	go func() {
		defer wg.Done()

		_, err := io.Copy(target, client)

		if err == nil {
			if tcp, ok := target.(*net.TCPConn); ok {
				_ = tcp.CloseWrite()
			}
		}
	}()
	go func() {
		defer wg.Done()
		_, err := io.Copy(client, target)

		if err == nil {
			if tcp, ok := client.(*net.TCPConn); ok {
				_ = tcp.CloseWrite()
			}
		}
	}()

	wg.Wait()


}
