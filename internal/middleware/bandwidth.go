package middleware

import (
	"net"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

const chunkSize = 8 * 1024

type BandwidthMiddleware struct {
	config *config.ChaosConfig
}

type BandwidthConn struct {
	net.Conn
	config *config.ChaosConfig
}

func NewBandwidthMiddleware(cfg *config.ChaosConfig) *BandwidthMiddleware {
	return &BandwidthMiddleware{config: cfg}
}

func (m *BandwidthMiddleware) Wrap(conn net.Conn) net.Conn {
	return &BandwidthConn{
		Conn:   conn,
		config: m.config,
	}
}

func (c *BandwidthConn) Write(data []byte) (int, error) {
	enabled, rate := c.config.GetBandwidth()

	// Bypass throttle if disabled or rate is zero (unlimited).
	if !enabled || rate <= 0 {
		return c.Conn.Write(data)
	}

	totalWritten := 0
	remaining := data

	for len(remaining) > 0 {
		n := chunkSize
		if len(remaining) < chunkSize {
			n = len(remaining)
		}

		written, err := c.Conn.Write(remaining[:n])
		totalWritten += written

		if err != nil {
			return totalWritten, err
		}

		remaining = remaining[written:]

		// Throttle: sleep long enough to honour the configured rate.
		sleepDuration := time.Second *
			time.Duration(written) /
			time.Duration(rate)

		time.Sleep(sleepDuration)
	}

	return totalWritten, nil
}
