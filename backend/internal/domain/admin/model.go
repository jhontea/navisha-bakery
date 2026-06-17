package admin

import (
	"time"

	"github.com/google/uuid"
)

// Admin represents an admin user in the database
type Admin struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	GoogleID  *string   `json:"google_id,omitempty"`
	AvatarURL *string   `json:"avatar_url,omitempty"`
	Role      string    `json:"role"` // "super_admin" or "admin"
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
