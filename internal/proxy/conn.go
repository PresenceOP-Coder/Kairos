package proxy

import (
	"fmt"
	"io"
	"net"
	"sync"
	"sync/atomic"
	"time"
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
		p.metrics.IncFailedConnections() // <-- here
		return
	}

	p.metrics.IncTotalConnections()
	p.metrics.IncActiveConnections()
	defer p.metrics.DecActiveConnections()
	defer target.Close()

	fmt.Printf("[Kairos] Client Addr %s\n", client.RemoteAddr())
	fmt.Printf("[Kairos] Targer Addr %s\n", target.RemoteAddr())

	id := atomic.AddUint64(&p.nextConnID, 1)

	connection := &Connection{
		ID:        id,
		Target:    target,
		Client:    client,
		StartedAt: time.Now(),
	}

	p.registry.Add(connection)
	defer p.registry.Remove(connection.ID)

	wrappedClient := client
	wrappedTarget := target

	applyChaos := p.trigger == nil || p.trigger.ShouldApply()

	if applyChaos {
		p.mu.RLock()
		for _, m := range p.middleware {
			wrappedClient = m.Wrap(wrappedClient)
			wrappedTarget = m.Wrap(wrappedTarget)
		}
		p.mu.RUnlock()
	}

	var wg sync.WaitGroup

	wg.Add(2)

	go func() {
		defer wg.Done()

		n, _ := io.Copy(wrappedTarget, wrappedClient)

		p.metrics.AddBytesSent(uint64(n))

		// Always half-close the target write side when done, regardless of error.
		// This signals EOF to the target so the other goroutine isn't blocked forever.
		if tcp, ok := target.(*net.TCPConn); ok {
			_ = tcp.CloseWrite()
		} else {
			target.Close()
		}
	}()
	go func() {
		defer wg.Done()

		n, _ := io.Copy(wrappedClient, wrappedTarget)

		p.metrics.AddBytesReceived(uint64(n))

		// Always half-close the client write side when done, regardless of error.
		// This signals EOF to the client so the other goroutine isn't blocked forever.
		if tcp, ok := client.(*net.TCPConn); ok {
			_ = tcp.CloseWrite()
		} else {
			client.Close()
		}
	}()

	wg.Wait()

}
