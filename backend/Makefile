.PHONY: run build test test-verbose generate mock lint migrate seed

run:
	go run ./cmd/server

migrate:
	go run ./cmd/migrate

seed:
	go run ./cmd/seed

build:
	go build -o bin/server ./cmd/server

test:
	go test ./...

test-verbose:
	go test -v ./...

generate:
	go generate ./internal/...

mock:
	go install go.uber.org/mock/mockgen@latest
	go generate ./internal/...

lint:
	golangci-lint run

tidy:
	go mod tidy