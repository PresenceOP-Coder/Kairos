package trigger

import "sync/atomic"

type EveryNthConnection struct {
	n       uint64
	counter uint64
}

func NewEveryNthConnection(n uint64) *EveryNthConnection {
	return &EveryNthConnection{
		n: n,
	}
}

func (t *EveryNthConnection) ShouldApply() bool {
	if t.n == 0 {
		return false
	}

	count := atomic.AddUint64(&t.counter, 1)

	return count%t.n == 0
}