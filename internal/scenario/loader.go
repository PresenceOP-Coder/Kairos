package scenario

import (
	"encoding/json"
	"fmt"
	"os"
)

func Load(path string) (*Scenario, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var scenario Scenario

	if err := json.Unmarshal(data, &scenario); err != nil {
		return nil, err
	}

	if err := scenario.Validate(); err != nil {
		return nil, fmt.Errorf("scenario validation error: %w", err)
	}

	return &scenario, nil
}
