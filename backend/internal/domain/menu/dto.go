package menu

import "time"

// CreateMenuRequest represents a request to create a new menu item
type CreateMenuRequest struct {
	Name          string  `json:"name" validate:"required,max=255"`
	Description   string  `json:"description"`
	Category      string  `json:"category" validate:"required"`
	Price         float64 `json:"price" validate:"required,gt=0"`
	Discount      float64 `json:"discount" validate:"min=0,max=100"`
	DiscountPrice float64 `json:"discount_price"`
	ImageURL      string  `json:"image_url"`
	ImageKey      string  `json:"image_key"`
	IsAvailable   bool    `json:"is_available"`
	IsFeatured    bool    `json:"is_featured"`
	SortOrder     int     `json:"sort_order"`
}

// UpdateMenuRequest represents a request to update a menu item
type UpdateMenuRequest struct {
	Name          string  `json:"name" validate:"required,max=255"`
	Description   string  `json:"description"`
	Category      string  `json:"category" validate:"required"`
	Price         float64 `json:"price" validate:"required,gt=0"`
	Discount      float64 `json:"discount" validate:"min=0,max=100"`
	DiscountPrice float64 `json:"discount_price"`
	ImageURL      string  `json:"image_url"`
	ImageKey      string  `json:"image_key"`
	IsAvailable   bool    `json:"is_available"`
	IsFeatured    bool    `json:"is_featured"`
	SortOrder     int     `json:"sort_order"`
}

// MenuResponse represents a menu item returned to the client
type MenuResponse struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Category      string  `json:"category"`
	Price         float64 `json:"price"`
	Discount      float64 `json:"discount"`
	DiscountPrice float64 `json:"discount_price"`
	ImageURL      string  `json:"image_url"`
	IsAvailable   bool    `json:"is_available"`
	IsFeatured    bool    `json:"is_featured"`
	SortOrder     int     `json:"sort_order"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
}

// MenuListResponse represents a paginated list of menu items
type MenuListResponse struct {
	Menus     []*MenuResponse `json:"menus"`
	Total     int             `json:"total"`
	Page      int             `json:"page"`
	Limit     int             `json:"limit"`
	TotalPage int             `json:"total_page"`
}

// ToResponse converts a Menu model to a response DTO
func ToResponse(m *Menu) *MenuResponse {
	resp := MenuResponse{
		ID:            m.ID.String(),
		Name:          m.Name,
		Description:   m.Description,
		Category:      m.Category,
		Price:         m.Price,
		Discount:      m.Discount,
		DiscountPrice: m.DiscountPrice,
		ImageURL:      m.ImageURL,
		IsAvailable:   m.IsAvailable,
		IsFeatured:    m.IsFeatured,
		SortOrder:     m.SortOrder,
		CreatedAt:     m.CreatedAt.Format(time.RFC3339),
		UpdatedAt:     m.UpdatedAt.Format(time.RFC3339),
	}
	return &resp
}

// ToResponseList converts a slice of Menu models to response DTOs
func ToResponseList(menus []Menu) []*MenuResponse {
	responses := make([]*MenuResponse, len(menus))
	for i, m := range menus {
		responses[i] = ToResponse(&m)
	}
	return responses
}
