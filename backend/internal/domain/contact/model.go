package contact

import (
	"time"

	"github.com/google/uuid"
)

// Contact represents a contact form submission
type Contact struct {
	ID             uuid.UUID `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	Phone          string    `json:"phone"`
	Message        string    `json:"message"`
	IsRead         bool      `json:"is_read"`
	SubmissionHash string    `json:"submission_hash"`
	CreatedAt      time.Time `json:"created_at"`
}
