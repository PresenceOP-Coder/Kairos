package middleware

import (
	"math/rand"
	"net"
	"time"
)

type JitterMiddleware struct {
	minDelay time.Duration
	maxDelay time.Duration
}
type JitterConn struct {
	net.Conn
	minDelay time.Duration
	maxDelay time.Duration
}

func NewJitterMiddleware(minDelay, maxDelay time.Duration) *JitterMiddleware {
	return &JitterMiddleware{
		minDelay: minDelay,
		maxDelay: maxDelay,
	}
}

func (m *JitterMiddleware) Wrap(conn net.Conn) net.Conn {
	return &JitterConn{
		Conn:     conn,
		minDelay: m.minDelay,
		maxDelay: m.maxDelay,
	}
}

func (c *JitterConn) randomDelay() time.Duration {
	if c.maxDelay <= c.minDelay {
		return c.minDelay
	}

	diff := c.maxDelay - c.minDelay

	return c.minDelay + time.Duration(rand.Int63n(int64(diff)))

}

func (c *JitterConn) Read(b []byte) (int, error) {
	time.Sleep(c.randomDelay())

	return c.Conn.Read(b)
}
func (c *JitterConn) Write(b []byte) (int, error) {
	time.Sleep(c.randomDelay())

	return c.Conn.Write(b)
}
