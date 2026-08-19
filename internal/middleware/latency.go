package middleware

import (
	"net"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type LatencyMiddleware struct {
	config *config.ChaosConfig
}

type LatencyConn struct {
	net.Conn
	config *config.ChaosConfig
}

func NewLatencyMiddleware(cfg *config.ChaosConfig) *LatencyMiddleware {
	return &LatencyMiddleware{
		config: cfg,
	}
}

func (m *LatencyMiddleware) Wrap(conn net.Conn) net.Conn {
	return &LatencyConn{
		Conn:   conn,
		config: m.config,
	}
}

func (c *LatencyConn) Read(b []byte) (int, error) {
	enabled, delay := c.config.GetLatency()

	if enabled && delay > 0 {
		time.Sleep(delay)
	}

	return c.Conn.Read(b)
}

func (c *LatencyConn) Write(b []byte) (int, error) {
	return c.Conn.Write(b)
}
