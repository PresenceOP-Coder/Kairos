package middleware

import (
	"net"
	"time"
)

const chunkSize = 8 * 1024

type BandwidthMiddleware struct {
	bandwidth int64
}

type BandwidthConn struct {
	net.Conn
	bandwidth int64
}

func NewBandwidthMiddleware(bandwidth int64) *BandwidthMiddleware {
	return &BandwidthMiddleware{
		bandwidth: bandwidth,
	}
}

func (m *BandwidthMiddleware) Wrap(conn net.Conn) net.Conn {
	return &BandwidthConn{
		Conn:      conn,
		bandwidth: m.bandwidth,
	}
}

func (c *BandwidthConn) Write(data []byte) (int, error) {

	totalWritten := 0
	remaining := data

	if c.bandwidth <= 0 {
		return c.Conn.Write(data)
	}
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

		sleepDuration := time.Second *
			time.Duration(written) /
			time.Duration(c.bandwidth)

		time.Sleep(sleepDuration)
	}

	return totalWritten, nil
}
