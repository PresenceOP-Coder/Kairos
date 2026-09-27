package middleware

import (
	"net"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

type mockConn struct {
	net.Conn
}

func (m *mockConn) Write(b []byte) (int, error) {
	return len(b), nil
}

func TestBandwidthMiddleware_AddsDelay(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetBandwidth(true, 1000)

	middleware := NewBandwidthMiddleware(cfg)

	conn := &mockConn{}
	wrappedConn := middleware.Wrap(conn)

	message := make([]byte, 1000)

	start := time.Now()

	n, err := wrappedConn.Write(message)

	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("unexpected write error: %v", err)
	}

	if n != len(message) {
		t.Fatalf("expected to write %d bytes, got %d", len(message), n)
	}

	if elapsed < 1*time.Second {
		t.Errorf("expected at least 1s bandwidth delay, got %v", elapsed)
	}
}

func TestBandwidthMiddleware_Disabled(t *testing.T) {
    cfg := config.NewChaosConfig()
    cfg.SetBandwidth(false, 1000)

    middleware := NewBandwidthMiddleware(cfg)

    conn := &mockConn{}
    wrappedConn := middleware.Wrap(conn)

    message := make([]byte, 1000)

    start := time.Now()

    n, err := wrappedConn.Write(message)

    elapsed := time.Since(start)

    if err != nil {
        t.Fatalf("unexpected write error: %v", err)
    }

    if n != len(message) {
        t.Fatalf("expected to write %d bytes, got %d", len(message), n)
    }

    if elapsed >= 100*time.Millisecond {
        t.Errorf("expected bandwidth throttling to be disabled, got %v", elapsed)
    }
}