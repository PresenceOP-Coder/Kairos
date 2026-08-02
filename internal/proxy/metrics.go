package proxy

import (
	"sync/atomic"
	"time"
)

type Metrics struct {
	startedAt         time.Time
	totalConnections  uint64
	activeConnections uint64
	failedConnections uint64
	byteSent          uint64
	byteReceived      uint64
}

type MetricsSnapshot struct {
	Uptime            time.Duration `json:"uptime"`
	TotalConnections  uint64        `json:"total_connections"`
	ActiveConnections uint64        `json:"active_connections"`
	FailedConnections uint64        `json:"failed_connections"`
	BytesSent         uint64        `json:"bytes_sent"`
	BytesReceived     uint64        `json:"bytes_received"`
}

func NewMetrics() *Metrics {
	return &Metrics{
		startedAt: time.Now(),
	}
}

func (m *Metrics) IncTotalConnections() {
	atomic.AddUint64(&m.totalConnections, 1)
}

func (m *Metrics) IncActiveConnections() {
	atomic.AddUint64(&m.activeConnections, 1)
}

func (m *Metrics) DecActiveConnections(){
	atomic.AddUint64(&m.activeConnections, ^uint64(0))
}


func (m *Metrics) IncFailedConnections(){
	atomic.AddUint64(&m.failedConnections,1)
}

func (m *Metrics) AddBytesSent(n uint64){
	atomic.AddUint64(&m.byteSent,n)
}

func (m *Metrics) AddBytesReceived(n uint64){
	atomic.AddUint64(&m.byteReceived,n)

}

func (m *Metrics) Snapshot() MetricsSnapshot{
	return MetricsSnapshot{
		Uptime: time.Since(m.startedAt),
		TotalConnections: atomic.LoadUint64(&m.totalConnections),
		ActiveConnections: atomic.LoadUint64(&m.activeConnections),
		FailedConnections: atomic.LoadUint64(&m.failedConnections),
		BytesSent: atomic.LoadUint64(&m.byteSent),
		BytesReceived: atomic.LoadUint64(&m.byteReceived),
	}
}
