package middleware

import (
	"math/rand/v2"
	"net"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type PacketLossMiddleware struct {
	config *config.ChaosConfig
}

type PacketLossConn struct {
	net.Conn
	config *config.ChaosConfig
}

func NewPacketLossMiddleware(cfg *config.ChaosConfig) *PacketLossMiddleware {
	return &PacketLossMiddleware{
		config: cfg,
	}
}

func (m *PacketLossMiddleware) Wrap(conn net.Conn) net.Conn {
	return &PacketLossConn{
		Conn:   conn,
		config: m.config,
	}
}

func (c *PacketLossConn) Write(data []byte) (int, error) {
	enabled, percent := c.config.GetPacketLoss()
	if enabled && percent > 0 {
		if rand.IntN(100) < percent {
			// Silently drop the packet
			return len(data), nil
		}
	}

	return c.Conn.Write(data)
}
