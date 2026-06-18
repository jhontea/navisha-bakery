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
	"github.com/navishabakery/backend/internal/domain/admin"
	"github.com/navishabakery/backend/internal/domain/auth"
	menuDomain "github.com/navishabakery/backend/internal/domain/menu"
	appMiddleware "github.com/navishabakery/backend/internal/middleware"
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
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     cfg.CORS.AllowedOrigins,
		AllowMethods:     cfg.CORS.AllowedMethods,
		AllowHeaders:     cfg.CORS.AllowedHeaders,
		AllowCredentials: cfg.CORS.AllowCredentials,
	}))

	// Initialize repositories
	adminRepo := admin.NewRepository(db)
	menuRepo := menuDomain.NewRepository(db)

	// Initialize services
	authService := auth.NewService(adminRepo, cfg)
	menuService := menuDomain.NewService(menuRepo)

	// Initialize handlers
	authHandler := auth.NewHandler(authService)
	menuHandler := menuDomain.NewHandler(menuService)

	// Health check
	e.GET("/api/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"success": true,
			"message": "Navisha Bakery API is running",
			"time":    time.Now().UTC(),
		})
	})

	// Auth routes — Admin
	adminAuth := appMiddleware.AdminAuth(config.GetJWTSecret())

	authGroup := e.Group("/api/admin/auth")
	authGroup.GET("/google", authHandler.AdminLoginRedirect)
	authGroup.GET("/google/callback", authHandler.AdminLoginCallback)
	authGroup.GET("/me", authHandler.AdminMe, adminAuth)
	authGroup.POST("/logout", authHandler.AdminLogout, adminAuth)

	// Public menu routes
	e.GET("/api/menus", menuHandler.List)
	e.GET("/api/menus/:id", menuHandler.FindByID)
	e.GET("/api/menus/featured", menuHandler.ListFeatured)

	// Admin menu routes (protected)
	adminMenuGroup := e.Group("/api/admin/menus")
	adminMenuGroup.Use(adminAuth)
	adminMenuGroup.POST("", menuHandler.Create)
	adminMenuGroup.PUT("/:id", menuHandler.Update)
	adminMenuGroup.DELETE("/:id", menuHandler.Delete)
	adminMenuGroup.GET("/count", menuHandler.Count)

	_ = cacheStore

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
