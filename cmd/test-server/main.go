package main

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
)

func main() {
	// 1. Start Target Server on 9001
	targetAddr := "127.0.0.1:9001"
	tl, err := net.Listen("tcp", targetAddr)
	if err != nil {
		log.Fatalf("Target server failed to listen: %v", err)
	}
	defer tl.Close()
	log.Printf("Target Server listening on %s", targetAddr)

	go func() {
		for {
			conn, err := tl.Accept()
			if err != nil {
				return
			}
			go func(c net.Conn) {
				defer c.Close()
				io.Copy(c, c) // echo server
			}(conn)
		}
	}()

	// 2. Start Proxy Server on 9000
	cfg := config.NewChaosConfig()
	p, err := proxy.NewProxy("127.0.0.1:9000", targetAddr)
	if err != nil {
		log.Fatalf("Proxy failed to initialize: %v", err)
	}
	
	// Ensure we register middlewares
	p.Use(middleware.NewLatencyMiddleware(cfg))
	p.Use(middleware.NewResetMiddleware(cfg))
	p.Use(middleware.NewBandwidthMiddleware(cfg))
	p.Use(middleware.NewJitterMiddleware(cfg))
	p.Use(middleware.NewBlackholeMiddleware(cfg))
	p.Use(middleware.NewPacketLossMiddleware(cfg))
	
	go p.Start()
	defer p.Stop()
	log.Printf("Proxy Server listening on 127.0.0.1:9000")

	// 3. Start API Server on 8080
	apiServer := api.NewServer(p.Registry(), p.Metrics(), cfg)
	
	go func() {
		log.Printf("API Server listening on 127.0.0.1:8080")
		if err := apiServer.Start("127.0.0.1:8080"); err != nil && err != http.ErrServerClosed {
			log.Fatalf("API server failed: %v", err)
		}
	}()

	// Wait for interrupt
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c
	fmt.Println("Shutting down test servers...")
}
