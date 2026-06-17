package google

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Config holds the Google OAuth2 configuration
type Config struct {
	ClientID    string
	Secret      string
	RedirectURL string
}

// TokenInfo represents the verified Google token information
type TokenInfo struct {
	Email         string `json:"email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Sub           string `json:"sub"`
	EmailVerified bool   `json:"email_verified"`
	Exp           int64  `json:"exp"`
}

// NewOAuthConfig creates a new OAuth2 config for Google
func NewOAuthConfig(cfg Config) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.Secret,
		RedirectURL:  cfg.RedirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}
}

// GetAuthURL returns the Google OAuth consent page URL
func GetAuthURL(oauthCfg *oauth2.Config, state string) string {
	return oauthCfg.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// ExchangeCode exchanges an authorization code for tokens
func ExchangeCode(ctx context.Context, oauthCfg *oauth2.Config, code string) (*oauth2.Token, error) {
	token, err := oauthCfg.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange auth code: %w", err)
	}
	return token, nil
}

// VerifyIDToken verifies the Google ID token and extracts user info.
// Works with both: (1) ID token from exchange flow, (2) raw ID token from implicit flow.
func VerifyIDToken(ctx context.Context, idToken string) (*TokenInfo, error) {
	if idToken == "" {
		return nil, fmt.Errorf("id token is empty")
	}

	url := fmt.Sprintf("https://oauth2.googleapis.com/tokeninfo?id_token=%s", idToken)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to verify token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token verification failed (status %d): %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	var raw map[string]interface{}
	if err := json.Unmarshal(body, &raw); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	expFloat, ok := raw["exp"].(float64)
	if !ok {
		return nil, fmt.Errorf("token missing exp field")
	}
	expTime := time.Unix(int64(expFloat), 0)
	if time.Now().UTC().After(expTime) {
		return nil, fmt.Errorf("token has expired")
	}

	emailVerified, _ := raw["email_verified"].(string)
	if emailVerified != "true" {
		return nil, fmt.Errorf("email is not verified")
	}

	info := &TokenInfo{
		Email:         getString(raw, "email"),
		Name:          getString(raw, "name"),
		Picture:       getString(raw, "picture"),
		Sub:           getString(raw, "sub"),
		EmailVerified: true,
		Exp:           int64(expFloat),
	}

	if info.Email == "" {
		return nil, fmt.Errorf("email not found in token")
	}

	return info, nil
}

func getString(m map[string]interface{}, key string) string {
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}
