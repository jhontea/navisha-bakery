package admin

import "time"

// CreateAdminRequest represents a request to add a new admin
type CreateAdminRequest struct {
	Name  string `json:"name" validate:"required,max=255"`
	Email string `json:"email" validate:"required,email,max=255"`
}

// AdminResponse represents the admin data returned to the client
type AdminResponse struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Role      string `json:"role"`
	IsActive  bool   `json:"is_active"`
	CreatedAt string `json:"created_at"`
}

// AdminListResponse represents a list of admins
type AdminListResponse struct {
	Admins []AdminResponse `json:"admins"`
	Total  int             `json:"total"`
}

// ToResponse converts an Admin model to a response DTO
func ToResponse(a *Admin) AdminResponse {
	return AdminResponse{
		ID:        a.ID.String(),
		Email:     a.Email,
		Name:      a.Name,
		Role:      a.Role,
		IsActive:  a.IsActive,
		CreatedAt: a.CreatedAt.Format(time.RFC3339),
	}
}

// ToResponseList converts a slice of Admin models to response DTOs
func ToResponseList(admins []Admin) []AdminResponse {
	responses := make([]AdminResponse, len(admins))
	for i, a := range admins {
		responses[i] = ToResponse(&a)
	}
	return responses
}
