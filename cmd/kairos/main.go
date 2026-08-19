// Package main is the entry point for the kairos CLI.
package main

import (
	"log"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
	"github.com/shreyasprajapti/kairos/internal/scenario"
	"github.com/spf13/cobra"
)

func main() {
	rootCmd := &cobra.Command{
		Use:   "kairos",
		Short: "Kairos — an application-aware chaos engineering proxy",
	}

	// kairos run <scenario-file>
	runCmd := &cobra.Command{
		Use:   "run <scenario>",
		Short: "Run Kairos with a scenario file",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {

			cfg := config.NewChaosConfig()
			eng := scenario.NewEngine(cfg)

			// Load the scenario file.
			s, err := scenario.Load(args[0])
			if err != nil {
				return err
			}

			// Apply the top-level (immediate) chaos settings.
			eng.Apply(s)

			// Schedule any timed steps.
			scheduler := scenario.NewScheduler(eng)
			scheduler.Run(s)

			// Wire up the proxy.
			p, err := proxy.NewProxy(":9000", "localhost:9001")
			if err != nil {
				return err
			}

			p.Use(middleware.NewLoggingMiddleware())
			p.Use(middleware.NewLatencyMiddleware(cfg))
			p.Use(middleware.NewJitterMiddleware(cfg))
			p.Use(middleware.NewBandwidthMiddleware(cfg))
			p.Use(middleware.NewResetMiddleware(cfg))
			p.Use(middleware.NewPacketLossMiddleware(20))

			// Start the control-plane API in the background.
			apiServer := api.NewServer(p.Registry(), p.Metrics(), cfg)
			go func() {
				if err := apiServer.Start(":8080"); err != nil {
					log.Printf("API server error: %v", err)
				}
			}()

			log.Println("Starting Kairos...")
			// p.Start() blocks until the listener is closed.
			return p.Start()
		},
	}

	rootCmd.AddCommand(runCmd)

	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}
