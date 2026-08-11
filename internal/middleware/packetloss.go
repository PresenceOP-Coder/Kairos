package middleware

import (
	"math/rand/v2"
	"net"
)

type PacketLossMiddleware struct {
	lossPercent int
}
type PacketLossConn struct {
	net.Conn
	lossPercent int
}

func NewPacketLossMiddleware(percent int) *PacketLossMiddleware {
	return &PacketLossMiddleware{
		lossPercent: percent,
	}
}

func (m *PacketLossMiddleware) Wrap(conn net.Conn) net.Conn {
	return &PacketLossConn{
		Conn:        conn,
		lossPercent: m.lossPercent,
	}
}

func (c *PacketLossConn) Write(data []byte) (int, error) {
	if rand.IntN(100) < c.lossPercent {
		return len(data), nil
	}

	return c.Conn.Write(data)
}
