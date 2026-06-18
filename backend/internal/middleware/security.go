package middleware

import (
	"github.com/labstack/echo/v4"
)

// SecurityHeaders adds security headers to all responses
func SecurityHeaders() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Basic security headers
			c.Response().Header().Set("X-Content-Type-Options", "nosniff")
			c.Response().Header().Set("X-Frame-Options", "DENY")
			c.Response().Header().Set("X-XSS-Protection", "1; mode=block")
			c.Response().Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

			// Content Security Policy (adjust as needed)
			csp := "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.google.com https://*.googleapis.com; frame-ancestors 'none';"
			c.Response().Header().Set("Content-Security-Policy", csp)

			// HSTS for production (enable when using HTTPS)
			// c.Response().Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

			return next(c)
		}
	}
}
