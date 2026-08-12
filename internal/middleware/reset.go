package middleware

import (
	"net"
	"time"
)

type ResetMiddleware struct {
	after time.Duration
}

type ResetConn struct{
	net.Conn
	after time.Duration
	timer *time.Timer
}

func NewResetMiddleware(after time.Duration) *ResetMiddleware {
	return &ResetMiddleware{
		after: after,
	}
}

func (m *ResetMiddleware) Wrap(conn net.Conn) net.Conn {
	resetConn := &ResetConn{
		Conn: conn,
		after: m.after,
	}

	resetConn.timer = time.AfterFunc(m.after, func() {
		conn.Close()
	})
	return resetConn
}

func (c *ResetConn) Close() error {
	c.timer.Stop()

	return c.Conn.Close()
}