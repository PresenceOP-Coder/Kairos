package middleware

import (
	"net"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type ResetMiddleware struct {
	config *config.ChaosConfig
}

type ResetConn struct {
	net.Conn
	timer *time.Timer
}

func NewResetMiddleware(cfg *config.ChaosConfig) *ResetMiddleware {
	return &ResetMiddleware{config: cfg}
}

func (m *ResetMiddleware) Wrap(conn net.Conn) net.Conn {
	rc := &ResetConn{Conn: conn}

	enabled, after := m.config.GetReset()
	if enabled && after > 0 {
		rc.timer = time.AfterFunc(after, func() {
			conn.Close()
		})
	}

	return rc
}

func (c *ResetConn) Close() error {
	if c.timer != nil {
		c.timer.Stop()
	}

	return c.Conn.Close()
}