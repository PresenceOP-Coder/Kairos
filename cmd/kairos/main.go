// Package main is the entry point for the kairos CLI.
package main

import (
	"fmt"
	"log"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
	"github.com/shreyasprajapti/kairos/internal/scenario"
	"github.com/spf13/cobra"
)

func main() {
	p, err := proxy.NewProxy(":9000", "localhost:9001")
	if err != nil {
		log.Fatal(err)
	}

	cfg := config.NewChaosConfig()

	apiServer := api.NewServer(
		p.Registry(),
		p.Metrics(),
		cfg,
	)

	engine := scenario.NewEngine(cfg)

	s, _ := scenario.Load("scenarios/mobile-3g.json")
	engine.Apply(s)

	enabled, delay := cfg.GetLatency()
	fmt.Println(enabled, delay)

	go func() {
		if err := apiServer.Start(":8080"); err != nil {
			log.Fatal(err)
		}
	}()

	log.Printf("Starting Kairos...\n")
	p.Use(middleware.NewLoggingMiddleware())
	p.Use(middleware.NewResetMiddleware(cfg))
	p.Use(middleware.NewLatencyMiddleware(cfg))
	p.Use(middleware.NewBandwidthMiddleware(cfg))
	p.Use(middleware.NewPacketLossMiddleware(20))
	p.Use(middleware.NewJitterMiddleware(cfg))
	if err := p.Start(); err != nil {
		log.Fatal(err)
	}

	rootCmd := &cobra.Command{
		Use:   "kairos",
		Short: "Kairos - An application-aware chaos engineering proxy",
	}

	runCmd := &cobra.Command{
		Use:   "run <scenario>",
		Short: "Run Kairos with a scenario file",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {

			cfg := config.NewChaosConfig()

			eng := scenario.NewEngine(cfg)

			s, err := scenario.Load(args[0])
			if err != nil {
				return err
			}

			eng.Apply(s)

			p, err := proxy.NewProxy(":9000", "localhost:9001")
			if err != nil {
				return err
			}

			p.Use(middleware.NewLoggingMiddleware())
			p.Use(middleware.NewLatencyMiddleware(cfg))
			p.Use(middleware.NewJitterMiddleware(cfg))
			p.Use(middleware.NewBandwidthMiddleware(cfg))
			p.Use(middleware.NewResetMiddleware(cfg))

			apiServer := api.NewServer(
				p.Registry(),
				p.Metrics(),
				cfg,
			)

			go apiServer.Start(":8080")

			log.Println("Starting Kairos...")

			return p.Start()
		},
	}

	rootCmd.AddCommand(runCmd)

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}

}
