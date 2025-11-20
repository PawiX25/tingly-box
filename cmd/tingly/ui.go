package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/spf13/cobra"
	"tingly-box/internal/config"
	"tingly-box/internal/memory"
	"tingly-box/internal/web"
)

// uiCmd represents the ui command
var uiCmd = &cobra.Command{
	Use:   "ui",
	Short: "Launch the web UI dashboard",
	Long: `Launch the web UI dashboard for managing Tingly Box.
This provides a user-friendly web interface for configuring providers,
managing the server, and monitoring activity.`,
	Run: func(cmd *cobra.Command, args []string) {
		// Get port from flag or use default
		port, _ := cmd.Flags().GetInt("port")
		if port == 0 {
			port = 8081
		}

		// Load configuration
		appConfig, err := config.NewAppConfig()
		if err != nil {
			fmt.Printf("Failed to load configuration: %v\n", err)
			os.Exit(1)
		}

		// Create memory logger for activity tracking
		logger, err := memory.NewMemoryLogger()
		if err != nil {
			fmt.Printf("Failed to create memory logger: %v\n", err)
			os.Exit(1)
		}

		// Create web server
		webServer := web.NewWebServer(appConfig, logger)

		// Setup graceful shutdown
		go func() {
			sigChan := make(chan os.Signal, 1)
			signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
			<-sigChan

			fmt.Println("\nShutting down web UI...")
			os.Exit(0)
		}()

		// Start the server
		addr := fmt.Sprintf(":%d", port)
		fmt.Printf("🎯 Tingly Box Web UI\n")
		fmt.Printf("========================\n")
		fmt.Printf("🌐 Server running at: http://localhost:%d\n", port)
		fmt.Printf("📊 Dashboard: http://localhost:%d/\n", port)
		fmt.Printf("📊 Dashboard (UI): http://localhost:%d/ui/\n", port)
		fmt.Printf("👥 Providers: http://localhost:%d/ui/providers\n", port)
		fmt.Printf("⚙️  Server: http://localhost:%d/ui/server\n", port)
		fmt.Printf("📜 History: http://localhost:%d/ui/history\n", port)
		fmt.Printf("========================\n")
		fmt.Printf("Press Ctrl+C to stop\n\n")

		// Start HTTP server
		server := &http.Server{
			Addr:         addr,
			Handler:      webServer.GetRouter(),
			ReadTimeout:  30 * time.Second,
			WriteTimeout: 30 * time.Second,
		}

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("Failed to start web server: %v\n", err)
			os.Exit(1)
		}
	},
}

func init() {
	rootCmd.AddCommand(uiCmd)
	uiCmd.Flags().IntP("port", "p", 8081, "Port for the web UI")
}