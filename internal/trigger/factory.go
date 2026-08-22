package trigger

import "github.com/shreyasprajapti/kairos/internal/scenario"

func FromScenario(s *scenario.Scenario) Trigger {
	if s.Trigger.EveryNthConnection > 0 {
		return NewEveryNthConnection(uint64(s.Trigger.EveryNthConnection))
	}

	return nil
}