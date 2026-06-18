package middleware

import (
	"log"
	"time"

	"github.com/labstack/echo/v4"
)

// RequestLogger logs HTTP requests with structured format
func RequestLogger() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			// Execute handler
			err := next(c)

			// Calculate latency
			latency := time.Since(start)

			// Get request details
			method := c.Request().Method
			path := c.Request().URL.Path
			status := c.Response().Status
			requestID := c.Response().Header().Get(echo.HeaderXRequestID)
			if requestID == "" {
				requestID = "-"
			}

			// Log request (structured JSON-like format)
			log.Printf(
				"request_id=%s method=%s path=%s status=%d latency=%s error=%v",
				requestID,
				method,
				path,
				status,
				latency,
				err,
			)

			return err
		}
	}
}
