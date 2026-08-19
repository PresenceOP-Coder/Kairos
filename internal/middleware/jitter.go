package middleware

import (
	"math/rand"
	"net"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type JitterMiddleware struct {
	config *config.ChaosConfig
}

type JitterConn struct {
	net.Conn
	config *config.ChaosConfig
}

func NewJitterMiddleware(cfg *config.ChaosConfig) *JitterMiddleware {
	return &JitterMiddleware{config: cfg}
}

func (m *JitterMiddleware) Wrap(conn net.Conn) net.Conn {
	return &JitterConn{
		Conn:   conn,
		config: m.config,
	}
}

func (c *JitterConn) randomDelay() time.Duration {
	enabled, min, max := c.config.GetJitter()
	if !enabled {
		return 0
	}

	if max <= min {
		return min
	}

	diff := max - min
	return min + time.Duration(rand.Int63n(int64(diff)))
}

func (c *JitterConn) Read(b []byte) (int, error) {
	if d := c.randomDelay(); d > 0 {
		time.Sleep(d)
	}

	return c.Conn.Read(b)
}

func (c *JitterConn) Write(b []byte) (int, error) {
	return c.Conn.Write(b)
}
