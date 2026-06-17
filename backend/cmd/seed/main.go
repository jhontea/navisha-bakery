package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	databaseURL := os.Getenv("DATABASE_URL")
	superAdminEmail := os.Getenv("SUPER_ADMIN_EMAIL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}
	if superAdminEmail == "" {
		superAdminEmail = "owner@navishabakery.com"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	query := `
		INSERT INTO admins (email, name, role, is_active)
		VALUES ($1, 'Super Admin', 'super_admin', true)
		ON CONFLICT (email) DO NOTHING
	`

	result, err := pool.Exec(ctx, query, superAdminEmail)
	if err != nil {
		log.Fatalf("Failed to seed super admin: %v", err)
	}

	if result.RowsAffected() > 0 {
		fmt.Printf("✓ Super admin seeded: %s (role: super_admin)\n", superAdminEmail)
	} else {
		fmt.Printf("Super admin already exists: %s\n", superAdminEmail)
	}
}
