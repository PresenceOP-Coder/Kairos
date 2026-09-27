package middleware

import (
	"net"
	"testing"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type packetLossMockConn struct {
	net.Conn
	written bool
}

func (c *packetLossMockConn) Write(b []byte) (int, error) {
	c.written = true
	return len(b), nil
}
func TestPacketLossMiddleware_DropsPacket(t *testing.T) {

	cfg := config.NewChaosConfig()

	cfg.SetPacketLoss(true, 100)

	conn := &packetLossMockConn{}

	middleware := NewPacketLossMiddleware(cfg)
	wrappedClient := middleware.Wrap(conn)

	message := []byte("hello")

	n, err := wrappedClient.Write(message)

	if err != nil {
		t.Fatalf("unexpected write error: %v", err)
	}

	if n != len(message) {
		t.Fatalf("expected Write to report %d bytes, got %d", len(message), n)
	}

	if conn.written {
		t.Error("expected packet to be dropped, but underlying connection received it")
	}

}

func TestPacketLossMiddleware_Disabled(t *testing.T) {
    cfg := config.NewChaosConfig()
    cfg.SetPacketLoss(false, 100)

    conn := &packetLossMockConn{}

    middleware := NewPacketLossMiddleware(cfg)
    wrappedConn := middleware.Wrap(conn)

    message := []byte("hello")

    n, err := wrappedConn.Write(message)

    if err != nil {
        t.Fatalf("unexpected write error: %v", err)
    }

    if n != len(message) {
        t.Fatalf("expected Write to report %d bytes, got %d", len(message), n)
    }

    if !conn.written {
        t.Error("expected packet to be written, but underlying connection was not called")
    }
}