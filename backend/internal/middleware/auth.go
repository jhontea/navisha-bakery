package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/navishabakery/backend/internal/pkg/jwt"
)

// AdminAuth returns a middleware that validates JWT tokens for admin access.
// It checks the "type" claim is "admin" in the JWT.
func AdminAuth(jwtSecret string) echo.MiddlewareFunc {
	return authMiddleware(jwtSecret, "admin")
}

// UserAuth returns a middleware that validates JWT tokens for user access.
// It checks the "type" claim is "user" in the JWT.
// For Phase 2 use.
func UserAuth(jwtSecret string) echo.MiddlewareFunc {
	return authMiddleware(jwtSecret, "user")
}

// SuperAdminOnly returns a middleware that checks the admin has the "super_admin" role.
// Must be used after AdminAuth middleware.
func SuperAdminOnly() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			claims, ok := c.Get("claims").(*jwt.Claims)
			if !ok {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"error":   "FORBIDDEN",
					"message": "Access denied: admin claims not found",
				})
			}

			if claims.Role != "super_admin" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"error":   "FORBIDDEN",
					"message": "Access denied: super admin role required",
				})
			}

			return next(c)
		}
	}
}

// authMiddleware creates a JWT auth middleware that validates tokens for the given type
func authMiddleware(jwtSecret string, tokenType string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			tokenString, err := extractToken(c)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "UNAUTHORIZED",
					"message": "Missing or malformed authorization token",
				})
			}

			claims, err := jwt.Validate(tokenString, jwtSecret)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"success": false,
					"error":   "UNAUTHORIZED",
					"message": "Invalid or expired token",
				})
			}

			// Check token type
			if claims.Type != tokenType {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"success": false,
					"error":   "FORBIDDEN",
					"message": "Access denied: insufficient permissions",
				})
			}

			// Verify admin/user still exists (call service layer)
			// This is done via the ValidateToken service method if needed.
			// For now, we trust the JWT and pass claims to context.
			c.Set("claims", claims)
			c.Set("user_id", claims.Sub)
			c.Set("user_email", claims.Email)
			c.Set("user_role", claims.Role)

			return next(c)
		}
	}
}

// extractToken extracts the JWT from the request
// Priority: Cookie > Authorization header
func extractToken(c echo.Context) (string, error) {
	// Try cookie first
	cookie, err := c.Cookie("token")
	if err == nil && cookie.Value != "" {
		return cookie.Value, nil
	}

	// Fallback to Authorization header
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			return parts[1], nil
		}
	}

	return "", context.DeadlineExceeded // Use a sentinel error
}
