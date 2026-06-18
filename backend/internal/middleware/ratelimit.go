package middleware

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
)

// RateLimiter implements a simple in-memory rate limiter
type RateLimiter struct {
	requests map[string][]time.Time
	mu       sync.Mutex
	limit    int
	window   time.Duration
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(limit int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		requests: make(map[string][]time.Time),
		limit:    limit,
		window:   window,
	}
	go rl.cleanup()
	return rl
}

// Allow checks if a request from the given key is allowed
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-rl.window)

	// Filter old requests
	var valid []time.Time
	for _, t := range rl.requests[key] {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}
	rl.requests[key] = valid

	// Check limit
	if len(valid) >= rl.limit {
		return false
	}

	// Add new request
	rl.requests[key] = append(rl.requests[key], now)
	return true
}

// cleanup periodically removes old entries
func (rl *RateLimiter) cleanup() {
	for {
		time.Sleep(rl.window)
		rl.mu.Lock()
		now := time.Now()
		cutoff := now.Add(-rl.window)
		for key, times := range rl.requests {
			var valid []time.Time
			for _, t := range times {
				if t.After(cutoff) {
					valid = append(valid, t)
				}
			}
			if len(valid) == 0 {
				delete(rl.requests, key)
			} else {
				rl.requests[key] = valid
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimit returns a rate limiting middleware
func RateLimit(limiter *RateLimiter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Use IP address as key
			key := c.RealIP()

			if !limiter.Allow(key) {
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"success": false,
					"error":   "RATE_LIMIT_EXCEEDED",
					"message": "Too many requests. Please try again later.",
				})
			}

			return next(c)
		}
	}
}

// ContactRateLimit returns a rate limiting middleware specifically for contact form
func ContactRateLimit(limiter *RateLimiter) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			key := c.RealIP() + ":contact"

			if !limiter.Allow(key) {
				return c.JSON(http.StatusTooManyRequests, map[string]interface{}{
					"success": false,
					"error":   "RATE_LIMIT_EXCEEDED",
					"message": "Too many contact submissions. Please wait 5 minutes before trying again.",
				})
			}

			return next(c)
		}
	}
}

// ParseRateLimit parses rate limit from config
func ParseRateLimit(limitStr, windowStr string) (int, time.Duration, error) {
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		return 0, 0, err
	}

	window, err := time.ParseDuration(windowStr)
	if err != nil {
		return 0, 0, err
	}

	return limit, window, nil
}
