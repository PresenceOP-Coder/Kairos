package middleware

import (
	"net"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
)

func TestJitterMiddleware_AddsDelayWithinRange(t *testing.T) {
	cfg := config.NewChaosConfig()
	cfg.SetJitter(true, 100*time.Millisecond, 200*time.Millisecond)

	client, server := net.Pipe()

	defer client.Close()
	defer server.Close()

	middleware := NewJitterMiddleware(cfg)
	wrappedClient := middleware.Wrap(client)

	message := []byte("hello")

	go func() {
		_, _ = server.Write(message)
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
			"expected at least 100ms jitter, got %v",
			elapsed,
		)
	}

	if elapsed >= 200*time.Millisecond {
		t.Errorf(
			"expected jitter below 200ms, got %v",
			elapsed,
		)
	}
}


func TestJitterMiddleware_Disabled(t *testing.T) {
    cfg := config.NewChaosConfig()
    cfg.SetJitter(false, 100*time.Millisecond, 200*time.Millisecond)

    client, server := net.Pipe()
    defer client.Close()
    defer server.Close()

    middleware := NewJitterMiddleware(cfg)
    wrappedClient := middleware.Wrap(client)

    message := []byte("hello")

    go func() {
        _, _ = server.Write(message)
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
        t.Errorf("expected no jitter delay, got %v", elapsed)
    }
}