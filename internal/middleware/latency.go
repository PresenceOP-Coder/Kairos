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

// Read reads data first, then sleeps to simulate network latency.
// Sleeping AFTER the read (not before) ensures:
//   - The delay is only applied when real data is present
//   - No pre-emptive idle sleeping that causes inconsistent RTTs
//   - Consistent one-way delay = configured delay_ms
//
// Since middleware wraps both client and target connections, the full
// round-trip latency observed by the caller is 2 × delay_ms.
func (c *LatencyConn) Read(b []byte) (int, error) {
	n, err := c.Conn.Read(b)

	if n > 0 {
		if enabled, delay := c.config.GetLatency(); enabled && delay > 0 {
			time.Sleep(delay)
		}
	}

	return n, err
}

func (c *LatencyConn) Write(b []byte) (int, error) {
	return c.Conn.Write(b)
}
