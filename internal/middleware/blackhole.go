package middleware

import (
	"net"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type BlackholeMiddleware struct {
	config *config.ChaosConfig
}

type BlackholeConn struct {
	net.Conn
	config *config.ChaosConfig
}

func NewBlackholeMiddleware(cfg *config.ChaosConfig) *BlackholeMiddleware {
	return &BlackholeMiddleware{
		config: cfg,
	}
}

func (m *BlackholeMiddleware) Wrap(conn net.Conn) net.Conn {
	return &BlackholeConn{
		Conn:   conn,
		config: m.config,
	}
}

func (c *BlackholeConn) Write(b []byte) (int, error) {

	if enabled, _ := c.config.GetBandwidth(); enabled {
		select {}
	}
	return c.Conn.Write(b)
}
