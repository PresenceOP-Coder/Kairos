// Package main is the entry point for the kairos CLI.
package main

import (
	"log"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/config"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
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

	// rootCmd := &cobra.Command{
	// 	Use:   "kairos",
	// 	Short: "Kairos - An application-aware chaos engineering proxy",
	// }

	// runCmd := &cobra.Command{
	// 	Use:   "run",
	// 	Short: "Run the proxy or scenario",
	// 	Run: func(cmd *cobra.Command, args []string) {
	// 		fmt.Println("not implemented")
	// 	},
	// }

	// rootCmd.AddCommand(runCmd)

	// if err := rootCmd.Execute(); err != nil {
	// 	fmt.Fprintln(os.Stderr, err)
	// 	os.Exit(1)
	// }

}
