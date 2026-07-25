package proxy

import "net"

func (p *Proxy) connectTarget() (net.Conn, error) {
	
	conn, err := net.Dial("tcp", p.targerAddr)

	if err != nil{
		return nil,err
	}
	return conn, err;
}
