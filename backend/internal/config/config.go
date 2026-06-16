package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

// Load loads configuration from .env (secrets) + config.yaml (static)
func Load() (*Config, error) {
	godotenv.Load()

	data, err := os.ReadFile("config.yaml")
	if err != nil {
		return nil, fmt.Errorf("failed to read config.yaml: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config.yaml: %w", err)
	}

	return &cfg, nil
}

func GetDatabaseURL() string         { return os.Getenv("DATABASE_URL") }
func GetJWTSecret() string           { return os.Getenv("JWT_SECRET") }
func GetGoogleClientID() string      { return os.Getenv("GOOGLE_CLIENT_ID") }
func GetGoogleClientSecret() string  { return os.Getenv("GOOGLE_CLIENT_SECRET") }
func GetRedisURL() string            { return os.Getenv("REDIS_URL") }
func GetR2AccountID() string         { return os.Getenv("R2_ACCOUNT_ID") }
func GetR2AccessKey() string         { return os.Getenv("R2_ACCESS_KEY_ID") }
func GetR2SecretKey() string         { return os.Getenv("R2_SECRET_ACCESS_KEY") }
func GetResendAPIKey() string        { return os.Getenv("RESEND_API_KEY") }
func GetResendFromEmail() string     { return os.Getenv("RESEND_FROM_EMAIL") }
func GetTelegramBotToken() string    { return os.Getenv("TELEGRAM_BOT_TOKEN") }
func GetTelegramAdminChatID() string { return os.Getenv("TELEGRAM_ADMIN_CHAT_ID") }
func GetSuperAdminEmail() string     { return os.Getenv("SUPER_ADMIN_EMAIL") }
