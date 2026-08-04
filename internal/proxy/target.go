package proxy

import "net"

func (p *Proxy) connectTarget() (net.Conn, error) {
	return net.Dial("tcp", p.targetAddr)
}
