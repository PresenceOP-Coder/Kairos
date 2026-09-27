package middleware

import (
	"net"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

func TestLatencyMiddleware_AddsDelay(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetLatency(true, 100*time.Millisecond)

	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()

	middleware := NewLatencyMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	message := []byte("hello")

	go func() {
		server.Write(message)
	}()

	buffer := make([]byte, 5)

	start := time.Now()

	n, err := wrappedClient.Read(buffer)

	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("unexpected read error: %v", err)
	}

	if n != len(message) {
		t.Fatalf("expected to read %d bytes, got %d", len(message), n)
	}

	if elapsed < 100*time.Millisecond {
		t.Errorf(
			"expected at least 100ms latency, got %v",
			elapsed,
		)
	}
}

func TestLatencyMiddleware_Disabled(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetLatency(false, 100*time.Millisecond)

	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()

	middleware := NewLatencyMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	message := []byte("hello")

	go func() {
		server.Write(message)
	}()

	buffer := make([]byte, 5)

	start := time.Now()

	n, err := wrappedClient.Read(buffer)

	elapsed := time.Since(start)

	if err != nil {
		t.Fatalf("unexpected read error: %v", err)
	}

	if n != len(message) {
		t.Fatalf("expected to read %d bytes, got %d", len(message), n)
	}

	if elapsed >= 100*time.Millisecond {
		t.Errorf(
			"expected no artificial latency, but read took %v",
			elapsed,
		)
	}
}