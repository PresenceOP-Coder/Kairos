package trigger

import (
	"testing"

	"github.com/shreyasprajapti/kairos/internal/scenario"
)

func TestEveryNthConnection_ShouldApply(t *testing.T) {
	trigger := NewEveryNthConnection(3)

	expected := []bool{
		false,
		false,
		true,
		false,
		false,
		true,
	}

	for i, want := range expected {
		got := trigger.ShouldApply()

		if got != want {
			t.Errorf(
				"call %d: expected %v, got %v",
				i+1,
				want,
				got,
			)
		}
	}
}

func TestEveryNthConnection_ZeroN(t *testing.T) {
	trigger := NewEveryNthConnection(0)

	for i := 0; i < 5; i++ {
		if trigger.ShouldApply() {
			t.Fatalf("expected false when n=0 on call %d", i+1)
		}
	}
}

func TestEveryNthConnection_Concurrent(t *testing.T) {
	trigger := NewEveryNthConnection(10)

	const calls = 1000

	results := make(chan bool, calls)

	for i := 0; i < calls; i++ {
		go func() {
			results <- trigger.ShouldApply()
		}()
	}

	trueCount := 0

	for i := 0; i < calls; i++ {
		if <-results {
			trueCount++
		}
	}

	if trueCount != calls/10 {
		t.Errorf(
			"expected %d successful triggers, got %d",
			calls/10,
			trueCount,
		)
	}
}

func TestFromScenario(t *testing.T) {
	sc := &scenario.Scenario{
		Trigger: scenario.Trigger{
			EveryNthConnection: 3,
		},
	}

	trigger := FromScenario(sc)

	if trigger == nil {
		t.Fatal("expected trigger, got nil")
	}

	if trigger.ShouldApply() {
		t.Fatal("expected first call to not trigger")
	}

	if trigger.ShouldApply() {
		t.Fatal("expected second call to not trigger")
	}

	if !trigger.ShouldApply() {
		t.Fatal("expected third call to trigger")
	}
}