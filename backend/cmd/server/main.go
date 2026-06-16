package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/navishabakery/backend/internal/cache"
	"github.com/navishabakery/backend/internal/config"
	"github.com/navishabakery/backend/internal/database"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Connect to PostgreSQL
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := database.Connect(ctx, config.GetDatabaseURL())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to PostgreSQL")

	// Connect to Redis (optional — app works without it)
	cacheStore, err := cache.NewCache(config.GetRedisURL())
	if err != nil {
		log.Printf("Redis unavailable, idempotency and rate limiting will be skipped: %v", err)
		cacheStore = cache.NewNoOpCache()
	} else {
		log.Println("Connected to Redis")
	}

	// Initialize Echo
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true

	// Global middleware
	e.Use(middleware.Recover())
	e.Use(middleware.Logger())

	// Health check
	e.GET("/api/health", func(c echo.Context) error {
		return c.JSON(200, map[string]interface{}{
			"success": true,
			"message": "Navisha Bakery API is running",
			"time":    time.Now().UTC(),
		})
	})

	// TODO: Register domain routes here
	_ = cacheStore
	_ = cfg

	// Start server with graceful shutdown
	go func() {
		addr := fmt.Sprintf(":%d", cfg.Server.Port)
		log.Printf("Server starting on %s (mode: %s)", addr, cfg.Server.Mode)
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := e.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited gracefully")
}
