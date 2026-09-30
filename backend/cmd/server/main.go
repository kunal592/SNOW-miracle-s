package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/kunal/snow/config"
	"github.com/kunal/snow/internal/auth"
	"github.com/kunal/snow/internal/users"
	"github.com/kunal/snow/internal/workspace"
	"github.com/kunal/snow/pkg/logger"
	"github.com/pressly/goose/v3"
	"go.uber.org/zap"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Init logger
	logger.Init(cfg.App.Env)
	log := logger.Get()
	defer log.Sync()

	log.Info("Starting SNOW backend",
		zap.String("env", cfg.App.Env),
		zap.String("port", cfg.App.Port),
	)

	// Connect to PostgreSQL
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DB.URL)
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatal("database ping failed", zap.Error(err))
	}
	log.Info("Connected to PostgreSQL")

	// Run migrations with Goose
	if err := runMigrations(cfg.DB.URL); err != nil {
		log.Fatal("migration failed", zap.Error(err))
	}
	log.Info("Database migrations applied")

	// Set Gin mode
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create router
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger(log))

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.Frontend, "http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoints (no auth)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "snow-api"})
	})
	r.GET("/ready", func(c *gin.Context) {
		if err := pool.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "not_ready", "error": "database unavailable"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"status": "ready"})
	})

	// ---- Build services ------------------------------------------------
	authSvc := auth.NewService(pool, cfg.JWT.Secret, cfg.JWT.AccessExpiry, cfg.JWT.RefreshExpiry)
	usersSvc := users.NewService(pool)
	workspaceSvc := workspace.NewService(pool)

	// ---- Build handlers ------------------------------------------------
	authHandler := auth.NewHandler(authSvc, cfg.Google.ClientID, cfg.Google.ClientSecret, cfg.Google.RedirectURL, cfg.Frontend)
	usersHandler := users.NewHandler(usersSvc)
	workspaceHandler := workspace.NewHandler(workspaceSvc)

	// ---- API routes ----------------------------------------------------
	api := r.Group("/api/v1")

	// Public auth routes
	authHandler.RegisterRoutes(api)

	// Protected routes (require JWT)
	protected := api.Group("")
	protected.Use(authHandler.RequireAuth)
	{
		usersHandler.RegisterRoutes(protected)
		workspaceHandler.RegisterRoutes(protected)
		// TODO Phase 2: inbox, expenses, consumption, time, food, health, learning
		// TODO Phase 3: goals, milestones, journal
		// TODO Phase 4: cognitive
		// TODO Phase 5: ai, analytics, reports
	}

	// ---- Start server --------------------------------------------------
	srv := &http.Server{
		Addr:         ":" + cfg.App.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Info("SNOW API listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("server error", zap.Error(err))
		}
	}()

	<-quit
	log.Info("Shutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server forced to shutdown", zap.Error(err))
	}

	log.Info("SNOW API stopped")
}

// runMigrations applies pending Goose SQL migrations
func runMigrations(dbURL string) error {
	db, err := goose.OpenDBWithDriver("pgx", dbURL)
	if err != nil {
		return fmt.Errorf("open db for migrations: %w", err)
	}
	defer db.Close()

	goose.SetBaseFS(nil) // use disk
	if err := goose.Up(db, "./db/migrations"); err != nil {
		return fmt.Errorf("goose up: %w", err)
	}
	return nil
}

// requestLogger is a Gin middleware that logs requests with Zap
func requestLogger(log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		log.Info("request",
			zap.Int("status", c.Writer.Status()),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.Duration("latency", time.Since(start)),
			zap.String("ip", c.ClientIP()),
		)
	}
}
