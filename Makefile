PHONY: build test lint run clean

build:
	go build ./...

test:
	go test ./... -race -cover

lint:
	go vet ./...

run:
	go run ./cmd/kairos

test-server:
	go run ./cmd/test-server

clean:
	rm -rf bin/
