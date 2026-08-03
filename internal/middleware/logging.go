package middleware

import (
	"log"
	"net"
)

type LoggingMiddleware struct {
}

type LoggingConn struct {
	net.Conn
}
func NewLoggingMiddleware() *LoggingMiddleware {
	return &LoggingMiddleware{}
}

func (m *LoggingMiddleware) Wrap(conn net.Conn)net.Conn{
	return &LoggingConn{
		Conn : conn,
	}
}

func (c *LoggingConn) Read(b []byte)(int, error){

	n,err := c.Conn.Read(b)

	log.Printf("[READ] %d bytes", n)
	return n,err
}

func (c *LoggingConn) Write(b []byte)(int, error){
	n,err := c.Conn.Write(b)
	log.Printf("[WRITE] %d byte", n)
	return n,err
}