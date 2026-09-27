package api

import (
	"bytes"
	"encoding/json"
	"net"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/proxy"
)

func setupTestServer() *Server {
	reg := proxy.NewRegistry()
	metrics := proxy.NewMetrics()
	cfg := config.NewChaosConfig()
	return NewServer(reg, metrics, cfg)
}

func TestHealthHandler(t *testing.T) {
	server := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if resp["status"] != "ok" {
		t.Errorf("Expected status 'ok', got '%s'", resp["status"])
	}
}

func TestConnectionsHandler_Empty(t *testing.T) {
	server := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/connections", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp []ConnectionResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(resp) != 0 {
		t.Errorf("Expected 0 connections, got %d", len(resp))
	}
}

func TestConnectionsHandler_WithConnections(t *testing.T) {
	server := setupTestServer()
	
	c1, c2 := net.Pipe()
	defer c1.Close()
	defer c2.Close()

	conn := &proxy.Connection{
		ID:        1,
		Client:    c1,
		Target:    c2,
		StartedAt: time.Now().Add(-5 * time.Minute),
	}
	server.registry.Add(conn)

	req := httptest.NewRequest(http.MethodGet, "/connections", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp []ConnectionResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if len(resp) != 1 {
		t.Fatalf("Expected 1 connection, got %d", len(resp))
	}

	if resp[0].ID != 1 {
		t.Errorf("Expected connection ID 1, got %d", resp[0].ID)
	}
	if resp[0].Client != "pipe" {
		t.Errorf("Expected Client to be pipe, got %s", resp[0].Client)
	}
	if resp[0].Target != "pipe" {
		t.Errorf("Expected Target to be pipe, got %s", resp[0].Target)
	}
}

func TestStatsHandler(t *testing.T) {
	server := setupTestServer()
	server.metrics.IncTotalConnections()
	server.metrics.IncActiveConnections()
	server.metrics.IncFailedConnections()
	server.metrics.AddBytesSent(1024)
	server.metrics.AddBytesReceived(2048)

	req := httptest.NewRequest(http.MethodGet, "/stats", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp proxy.MetricsSnapshot
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if resp.TotalConnections != 1 {
		t.Errorf("Expected 1 total connection, got %d", resp.TotalConnections)
	}
	if resp.ActiveConnections != 1 {
		t.Errorf("Expected 1 active connection, got %d", resp.ActiveConnections)
	}
	if resp.FailedConnections != 1 {
		t.Errorf("Expected 1 failed connection, got %d", resp.FailedConnections)
	}
	if resp.BytesSent != 1024 {
		t.Errorf("Expected 1024 bytes sent, got %d", resp.BytesSent)
	}
	if resp.BytesReceived != 2048 {
		t.Errorf("Expected 2048 bytes received, got %d", resp.BytesReceived)
	}
}

func TestLatencyHandler(t *testing.T) {
	server := setupTestServer()

	t.Run("Valid POST", func(t *testing.T) {
		reqBody := `{"enabled": true, "delay_ms": 150}`
		req := httptest.NewRequest(http.MethodPost, "/chaos/latency", bytes.NewBufferString(reqBody))
		rr := httptest.NewRecorder()
		server.routes().ServeHTTP(rr, req)

		if rr.Code != http.StatusOK {
			t.Errorf("Expected status OK, got %v", rr.Code)
		}

		enabled, delay := server.config.GetLatency()
		if !enabled || delay != 150*time.Millisecond {
			t.Errorf("Config not updated correctly: enabled=%v, delay=%v", enabled, delay)
		}
	})

	t.Run("Invalid Method", func(t *testing.T) {
		req := httptest.NewRequest(http.MethodGet, "/chaos/latency", nil)
		rr := httptest.NewRecorder()
		server.routes().ServeHTTP(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected Bad Request for GET, got %v", rr.Code)
		}
	})

	t.Run("Invalid JSON", func(t *testing.T) {
		reqBody := `{"enabled": true, "delay_ms": "not_a_number"}`
		req := httptest.NewRequest(http.MethodPost, "/chaos/latency", bytes.NewBufferString(reqBody))
		rr := httptest.NewRecorder()
		server.routes().ServeHTTP(rr, req)

		if rr.Code != http.StatusBadRequest {
			t.Errorf("Expected Bad Request for invalid JSON, got %v", rr.Code)
		}
	})
}

func TestChaosHandler(t *testing.T) {
	server := setupTestServer()
	server.config.SetLatency(true, 500*time.Millisecond)

	req := httptest.NewRequest(http.MethodGet, "/chaos", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp ChaosResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if !resp.LatencyEnabled {
		t.Errorf("Expected latency to be enabled")
	}
	if resp.LatencyDelayMS != 500 {
		t.Errorf("Expected delay 500, got %d", resp.LatencyDelayMS)
	}
}

func TestScenariosHandler(t *testing.T) {
	server := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/scenarios", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp []ScenarioResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(resp) == 0 {
		t.Errorf("Expected mock scenarios, got empty array")
	}
}

func TestExperimentsHandler(t *testing.T) {
	server := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/experiments", nil)
	rr := httptest.NewRecorder()

	server.routes().ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("Expected status OK, got %v", rr.Code)
	}

	var resp []ExperimentResponse
	if err := json.NewDecoder(rr.Body).Decode(&resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}
	if len(resp) == 0 {
		t.Errorf("Expected mock experiments, got empty array")
	}
}
