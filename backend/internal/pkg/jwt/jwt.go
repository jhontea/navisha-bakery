package jwt

import (
	"fmt"
	"time"

	golangJwt "github.com/golang-jwt/jwt/v5"
)

// Claims represents the JWT claims for an authenticated user
type Claims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
	Type  string `json:"type"` // "admin" or "user"
	golangJwt.RegisteredClaims
}

// Generate creates a new JWT token for the given user
func Generate(secret string, claims Claims, expiryHours int) (string, time.Time, error) {
	expiresAt := time.Now().Add(time.Duration(expiryHours) * time.Hour)

	claims.RegisteredClaims = golangJwt.RegisteredClaims{
		ExpiresAt: golangJwt.NewNumericDate(expiresAt),
		IssuedAt:  golangJwt.NewNumericDate(time.Now()),
		Subject:   claims.Sub,
	}

	token := golangJwt.NewWithClaims(golangJwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", time.Time{}, fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, expiresAt, nil
}

// Validate parses and validates a JWT token, returning the claims
func Validate(tokenString string, secret string) (*Claims, error) {
	token, err := golangJwt.ParseWithClaims(tokenString, &Claims{}, func(token *golangJwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*golangJwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	if claims.Type == "" {
		return nil, fmt.Errorf("token missing type claim")
	}

	return claims, nil
}

// GenerateAdminToken creates an admin JWT token
func GenerateAdminToken(secret string, adminID string, email string, name string, role string, expiryHours int) (string, time.Time, error) {
	claims := Claims{
		Sub:   adminID,
		Email: email,
		Name:  name,
		Role:  role,
		Type:  "admin",
	}
	return Generate(secret, claims, expiryHours)
}

// GenerateUserToken creates a user JWT token (for Phase 2)
func GenerateUserToken(secret string, userID string, email string, name string, expiryHours int) (string, time.Time, error) {
	claims := Claims{
		Sub:   userID,
		Email: email,
		Name:  name,
		Type:  "user",
	}
	return Generate(secret, claims, expiryHours)
}
