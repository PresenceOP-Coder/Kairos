// Package main is the entry point for the kairos CLI.
package main

import (
	"log"
	"time"

	"github.com/shreyasprajapti/kairos/internal/api"
	"github.com/shreyasprajapti/kairos/internal/middleware"
	"github.com/shreyasprajapti/kairos/internal/proxy"
)

func main() {
	p, err := proxy.NewProxy(":9000", "localhost:9001")
	if err != nil {
		log.Fatal(err)
	}

	apiServer := api.NewServer(
		p.Registry(),
		p.Metrics(),
	)
	go func() {
		if err := apiServer.Start(":8080"); err != nil {
			log.Fatal(err)
		}
	}()

	log.Printf("Starting Kairos...\n")
	p.Use(middleware.NewLoggingMiddleware())
	p.Use(middleware.NewLatencyMiddleware(500 * time.Millisecond))
	p.Use(middleware.NewBandwidthMiddleware(100 * 1024))
	p.Use(
		middleware.NewPacketLossMiddleware(20),
	)
	p.Use(middleware.NewJitterMiddleware(
		100*time.Millisecond,
		500*time.Millisecond,
	))
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
