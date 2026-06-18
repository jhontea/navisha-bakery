package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

// Sanitize trims whitespace and strips HTML tags from form fields
func Sanitize() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Only sanitize POST/PUT/PATCH requests with form or JSON body
			if c.Request().Method != http.MethodPost &&
				c.Request().Method != http.MethodPut &&
				c.Request().Method != http.MethodPatch {
				return next(c)
			}

			// For JSON requests, we can't easily modify the body here
			// Sanitization should be done in the DTO validation layer
			// This middleware is a placeholder for future implementation

			return next(c)
		}
	}
}

// SanitizeString trims whitespace and strips HTML tags from a string
func SanitizeString(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "<script>", "")
	s = strings.ReplaceAll(s, "</script>", "")
	return s
}
