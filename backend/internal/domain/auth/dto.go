package auth

// LoginRequest represents the Google OAuth login request
type LoginRequest struct {
	Token string `json:"token" validate:"required"`
}

// LoginResponse represents the login response
type LoginResponse struct {
	Admin     AdminResponse `json:"admin"`
	Token     string        `json:"token"`
	ExpiresAt string        `json:"expires_at"`
}

// AdminResponse represents the admin data returned to the client (subset)
type AdminResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Role      string `json:"role"`
}
