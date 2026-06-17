package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	googlePkg "github.com/navishabakery/backend/internal/pkg/google"
	"github.com/navishabakery/backend/internal/pkg/jwt"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// AdminLoginRedirect handles GET /api/admin/auth/google
// Redirects the admin to Google's OAuth consent page
func (h *Handler) AdminLoginRedirect(c echo.Context) error {
	state := generateStateToken()
	// Store state in cookie for CSRF protection
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		MaxAge:   600, // 10 minutes
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})

	oauthCfg := h.service.GetOAuthConfig()
	authURL := googlePkg.GetAuthURL(oauthCfg, state)

	return c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// AdminLoginCallback handles GET /api/admin/auth/google/callback
// Google redirects here after user consents
func (h *Handler) AdminLoginCallback(c echo.Context) error {
	// Verify state token (CSRF protection)
	stateCookie, err := c.Cookie("oauth_state")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": "Missing state cookie. Please try logging in again.",
		})
	}

	if c.QueryParam("state") != stateCookie.Value {
		return c.JSON(http.StatusForbidden, map[string]interface{}{
			"success": false,
			"error":   "FORBIDDEN",
			"message": "Invalid state parameter. Possible CSRF attack detected.",
		})
	}

	// Check for error from Google
	if errorParam := c.QueryParam("error"); errorParam != "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "OAUTH_ERROR",
			"message": fmt.Sprintf("Google OAuth error: %s", errorParam),
		})
	}

	authCode := c.QueryParam("code")
	if authCode == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"error":   "VALIDATION_ERROR",
			"message": "Missing authorization code",
		})
	}

	// Exchange auth code for tokens
	oauthCfg := h.service.GetOAuthConfig()
	token, err := googlePkg.ExchangeCode(c.Request().Context(), oauthCfg, authCode)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "TOKEN_EXCHANGE_FAILED",
			"message": fmt.Sprintf("Failed to exchange auth code: %v", err),
		})
	}

	// Extract ID token from the exchanged token
	idToken, ok := token.Extra("id_token").(string)
	if !ok || idToken == "" {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"error":   "INTERNAL_ERROR",
			"message": "No ID token received from Google",
		})
	}

	// Login the admin
	result, err := h.service.AdminLoginWithGoogle(c.Request().Context(), idToken)
	if err != nil {
		return c.JSON(http.StatusForbidden, map[string]interface{}{
			"success": false,
			"error":   "UNAUTHORIZED",
			"message": err.Error(),
		})
	}

	// Set JWT as httpOnly cookie
	c.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    result.Token,
		Path:     "/",
		MaxAge:   86400, // 24 hours (matches JWT expiry roughly)
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	// Clear the state cookie
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
	})

	// Redirect to frontend dashboard
	return c.Redirect(http.StatusTemporaryRedirect, "/dashboard")
}

// AdminMe handles GET /api/admin/auth/me
func (h *Handler) AdminMe(c echo.Context) error {
	claims := c.Get("claims").(*jwt.Claims)

	result, err := h.service.AdminGetMe(c.Request().Context(), claims.Sub)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"error":   "NOT_FOUND",
			"message": "Admin not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

// AdminLogout handles POST /api/admin/auth/logout
func (h *Handler) AdminLogout(c echo.Context) error {
	c.SetCookie(&http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
	})

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Logged out successfully",
	})
}

// generateStateToken creates a random state string for CSRF protection
func generateStateToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func prettyJSON(v interface{}) string {
	b, _ := json.MarshalIndent(v, "", "  ")
	return string(b)
}
