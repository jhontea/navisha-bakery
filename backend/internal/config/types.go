package config

import "time"

// Config holds all application configuration
type Config struct {
	Server      ServerConfig      `yaml:"server"`
	CORS        CORSConfig        `yaml:"cors"`
	RateLimit   RateLimitConfig   `yaml:"rate_limit"`
	Pagination  PaginationConfig  `yaml:"pagination"`
	Image       ImageConfig       `yaml:"image"`
	Menu        MenuConfig        `yaml:"menu"`
	Contact     ContactConfig     `yaml:"contact"`
	Idempotency IdempotencyConfig `yaml:"idempotency"`
	JWT         JWTConfig         `yaml:"jwt"`
	Order       OrderConfig       `yaml:"order"`
}

type ServerConfig struct {
	Port           int           `yaml:"port"`
	Mode           string        `yaml:"mode"`
	ReadTimeout    time.Duration `yaml:"read_timeout"`
	WriteTimeout   time.Duration `yaml:"write_timeout"`
	MaxHeaderBytes int           `yaml:"max_header_bytes"`
}

type CORSConfig struct {
	AllowedOrigins   []string `yaml:"allowed_origins"`
	AllowedMethods   []string `yaml:"allowed_methods"`
	AllowedHeaders   []string `yaml:"allowed_headers"`
	AllowCredentials bool     `yaml:"allow_credentials"`
	MaxAge           int      `yaml:"max_age"`
}

type RateLimitConfig struct {
	Global      RateLimitRule `yaml:"global"`
	ContactForm RateLimitRule `yaml:"contact_form"`
	Auth        RateLimitRule `yaml:"auth"`
}

type RateLimitRule struct {
	Requests int           `yaml:"requests"`
	Window   time.Duration `yaml:"window"`
}

type PaginationConfig struct {
	DefaultLimit int `yaml:"default_limit"`
	MaxLimit     int `yaml:"max_limit"`
}

type ImageConfig struct {
	MaxSizeBytes int64    `yaml:"max_size_bytes"`
	AllowedTypes []string `yaml:"allowed_types"`
	MaxWidth     int      `yaml:"max_width"`
	MaxHeight    int      `yaml:"max_height"`
}

type MenuConfig struct {
	Categories []string `yaml:"categories"`
}

type ContactConfig struct {
	DuplicateWindow time.Duration `yaml:"duplicate_window"`
}

type IdempotencyConfig struct {
	Expiry time.Duration `yaml:"expiry"`
}

type JWTConfig struct {
	ExpiryHours int `yaml:"expiry_hours"`
}

type OrderConfig struct {
	NumberPrefix string `yaml:"number_prefix"`
	NumberLength int    `yaml:"number_length"`
}
