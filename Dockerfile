FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download 

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o kairos ./cmd/kairos

FROM alpine:3.22

WORKDIR /app

COPY --from=builder /app/kairos /app/kairos

COPY scenarios /app/scenarios

EXPOSE 9000
EXPOSE 8080

ENTRYPOINT ["/app/kairos"]