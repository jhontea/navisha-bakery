package menu

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/menu/mock_service.go -package=menu . Service

// Service defines the contract for menu business logic
type Service interface {
	List(ctx context.Context, category string, available *bool, page, limit int) (*MenuListResponse, error)
	FindByID(ctx context.Context, id string) (*MenuResponse, error)
	ListFeatured(ctx context.Context, limit int) ([]*MenuResponse, error)
	Create(ctx context.Context, req *CreateMenuRequest) (*MenuResponse, error)
	Update(ctx context.Context, id string, req *UpdateMenuRequest) (*MenuResponse, error)
	Delete(ctx context.Context, id string) error
	Count(ctx context.Context, category string, available *bool) (int, error)
}

type service struct {
	repo Repository
}

// NewService creates a new menu service
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) List(ctx context.Context, category string, available *bool, page, limit int) (*MenuListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	menus, total, err := s.repo.List(ctx, category, available, page, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to list menus: %w", err)
	}

	totalPage := (total + limit - 1) / limit
	if totalPage < 1 {
		totalPage = 1
	}

	return &MenuListResponse{
		Menus:     ToResponseList(menus),
		Total:     total,
		Page:      page,
		Limit:     limit,
		TotalPage: totalPage,
	}, nil
}

func (s *service) FindByID(ctx context.Context, id string) (*MenuResponse, error) {
	menuID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid menu ID: %w", err)
	}

	m, err := s.repo.FindByID(ctx, menuID)
	if err != nil {
		return nil, fmt.Errorf("failed to find menu: %w", err)
	}
	if m == nil {
		return nil, fmt.Errorf("menu not found")
	}

	return ToResponse(m), nil
}

func (s *service) ListFeatured(ctx context.Context, limit int) ([]*MenuResponse, error) {
	if limit < 1 || limit > 50 {
		limit = 10
	}

	menus, err := s.repo.ListFeatured(ctx, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to list featured menus: %w", err)
	}

	return ToResponseList(menus), nil
}

func (s *service) Create(ctx context.Context, req *CreateMenuRequest) (*MenuResponse, error) {
	// Validate category
	if !IsValidCategory(req.Category) {
		return nil, fmt.Errorf("invalid category: %s", req.Category)
	}

	// Auto-calculate discount_price if discount is set but discount_price is not
	discountPrice := req.DiscountPrice
	if req.Discount > 0 && discountPrice == 0 {
		discountPrice = req.Price * (1 - req.Discount/100)
	}

	m := &Menu{
		Name:          req.Name,
		Description:   req.Description,
		Category:      req.Category,
		Price:         req.Price,
		Discount:      req.Discount,
		DiscountPrice: discountPrice,
		ImageURL:      req.ImageURL,
		ImageKey:      req.ImageKey,
		IsAvailable:   req.IsAvailable,
		IsFeatured:    req.IsFeatured,
		SortOrder:     req.SortOrder,
	}

	created, err := s.repo.Create(ctx, m)
	if err != nil {
		return nil, fmt.Errorf("failed to create menu: %w", err)
	}

	return ToResponse(created), nil
}

func (s *service) Update(ctx context.Context, id string, req *UpdateMenuRequest) (*MenuResponse, error) {
	// Validate category
	if !IsValidCategory(req.Category) {
		return nil, fmt.Errorf("invalid category: %s", req.Category)
	}

	menuID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid menu ID: %w", err)
	}

	// Auto-calculate discount_price if discount is set but discount_price is not
	discountPrice := req.DiscountPrice
	if req.Discount > 0 && discountPrice == 0 {
		discountPrice = req.Price * (1 - req.Discount/100)
	}

	m := &Menu{
		ID:            menuID,
		Name:          req.Name,
		Description:   req.Description,
		Category:      req.Category,
		Price:         req.Price,
		Discount:      req.Discount,
		DiscountPrice: discountPrice,
		ImageURL:      req.ImageURL,
		ImageKey:      req.ImageKey,
		IsAvailable:   req.IsAvailable,
		IsFeatured:    req.IsFeatured,
		SortOrder:     req.SortOrder,
	}

	updated, err := s.repo.Update(ctx, m)
	if err != nil {
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}

	return ToResponse(updated), nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	menuID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid menu ID: %w", err)
	}

	if err := s.repo.Delete(ctx, menuID); err != nil {
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	return nil
}

func (s *service) Count(ctx context.Context, category string, available *bool) (int, error) {
	count, err := s.repo.Count(ctx, category, available)
	if err != nil {
		return 0, fmt.Errorf("failed to count menus: %w", err)
	}
	return count, nil
}
