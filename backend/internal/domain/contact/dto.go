package contact

import "time"

// ContactRequest represents a contact form submission request
type ContactRequest struct {
	Name    string `json:"name" validate:"required,max=255"`
	Email   string `json:"email" validate:"required,email,max=255"`
	Phone   string `json:"phone" validate:"max=50"`
	Message string `json:"message" validate:"required"`
}

// ContactResponse represents a contact submission returned to the client
type ContactResponse struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Message   string `json:"message"`
	IsRead    bool   `json:"is_read"`
	CreatedAt string `json:"created_at"`
}

// ContactListResponse represents a paginated list of contacts
type ContactListResponse struct {
	Contacts  []ContactResponse `json:"contacts"`
	Total     int               `json:"total"`
	Page      int               `json:"page"`
	Limit     int               `json:"limit"`
	TotalPage int               `json:"total_page"`
}

// ToResponse converts a Contact model to a response DTO
func ToResponse(c *Contact) ContactResponse {
	return ContactResponse{
		ID:        c.ID.String(),
		Name:      c.Name,
		Email:     c.Email,
		Phone:     c.Phone,
		Message:   c.Message,
		IsRead:    c.IsRead,
		CreatedAt: c.CreatedAt.Format(time.RFC3339),
	}
}

// ToResponseList converts a slice of Contact models to response DTOs
func ToResponseList(contacts []Contact) []ContactResponse {
	responses := make([]ContactResponse, len(contacts))
	for i, c := range contacts {
		responses[i] = ToResponse(&c)
	}
	return responses
}
