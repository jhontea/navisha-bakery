package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Connected to Supabase PostgreSQL")

	// Read migration files
	migrationsDir := filepath.Join("internal", "database", "migrations")
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Fatalf("Failed to read migrations directory: %v", err)
	}

	var sqlFiles []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			sqlFiles = append(sqlFiles, entry.Name())
		}
	}
	sort.Strings(sqlFiles)

	// Execute migrations in order
	for _, file := range sqlFiles {
		filePath := filepath.Join(migrationsDir, file)
		content, err := os.ReadFile(filePath)
		if err != nil {
			log.Fatalf("Failed to read migration file %s: %v", file, err)
		}

		sql := string(content)
		if strings.TrimSpace(sql) == "" {
			log.Printf("Skipping empty migration: %s", file)
			continue
		}

		log.Printf("Running migration: %s", file)
		_, err = pool.Exec(ctx, sql)
		if err != nil {
			log.Fatalf("Failed to run migration %s: %v", file, err)
		}
		log.Printf("✓ Migration %s completed successfully", file)
	}

	fmt.Println("\nAll migrations completed successfully!")
}
