PHONY: build test lint run clean

build:
	go build ./...

test:
	go test ./... -race -cover

lint:
	golangci-lint run

run:
	go run ./cmd/kairos

clean:
	rm -rf bin/
