package menu

import (
	"time"

	"github.com/google/uuid"
)

// Menu represents a menu item in the database
type Menu struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Category      string    `json:"category"`
	Price         float64   `json:"price"`
	Discount      float64   `json:"discount"`
	DiscountPrice float64   `json:"discount_price"`
	ImageURL      string    `json:"image_url"`
	ImageKey      string    `json:"image_key"`
	IsAvailable   bool      `json:"is_available"`
	IsFeatured    bool      `json:"is_featured"`
	SortOrder     int       `json:"sort_order"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
