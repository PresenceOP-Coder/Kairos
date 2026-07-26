package proxy

import (
	"fmt"
	"io"
	"net"
	"sync"
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

	var wg sync.WaitGroup

	wg.Add(2)

	go func(){
		defer wg.Done()
		io.Copy(target, client)
	}()
	go func(){
		defer wg.Done()
		io.Copy(client,target)
	}()

	wg.Wait()


}
