package scenario

import (
	"encoding/json"
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

	return &scenario, nil
}
