package middleware

import (
	"net"
	"time"
)

type LatencyMiddleware struct {
	delay time.Duration
}
type LatencyConn struct{
	net.Conn
	delay time.Duration
}
func NewLatencyMiddleware(delay time.Duration) *LatencyMiddleware {
	return &LatencyMiddleware{
		delay: delay,
	}
}

func (m *LatencyMiddleware) Wrap(conn net.Conn) net.Conn{
	return &LatencyConn {
		Conn: conn,
		delay: m.delay,
	}
}


func (c *LatencyConn) Read(b []byte) (int , error){
	time.Sleep(c.delay)

	return c.Conn.Read(b)
}

func ( c* LatencyConn) Write(b []byte)(int , error){
	time.Sleep(c.delay)

	return c.Conn.Write(b)
}
