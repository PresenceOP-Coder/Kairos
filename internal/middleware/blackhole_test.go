package middleware

import (
	"net"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

func TestBlackholeMiddleware_BlocksWrite(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetBlackhole(true)

	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()

	middleware := NewBlackholeMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	done := make(chan struct{})

	go func() {
		_, _ = wrappedClient.Write([]byte("hello"))
		close(done)
	}()

	select {
	case <-done:
		t.Fatal("expected blackhole Write to remain blocked")
	case <-time.After(100 * time.Millisecond):
	}
}