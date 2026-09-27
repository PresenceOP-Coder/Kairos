package middleware

import (
	"net"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

func TestResetMiddleware_ClosesConnection(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetReset(true, 100*time.Millisecond)

	client, server := net.Pipe()
	defer server.Close()

	middleware := NewResetMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	time.Sleep(150 * time.Millisecond)

	_, err := wrappedClient.Write([]byte("hello"))

	if err == nil {
		t.Fatal("expected connection to be closed after reset delay")
	}
}

func TestResetMiddleware_Disabled(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetReset(false, 100*time.Millisecond)

	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()

	middleware := NewResetMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	time.Sleep(150 * time.Millisecond)

	go func() {
		_, _ = server.Write([]byte("hello"))
	}()

	buffer := make([]byte, 5)

	n, err := wrappedClient.Read(buffer)

	if err != nil {
		t.Fatalf("expected connection to remain open, got error: %v", err)
	}

	if n != 5 {
		t.Fatalf("expected to read 5 bytes, got %d", n)
	}
}