package contact

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/navishabakery/backend/internal/pkg/hash"
)

// Ensure Service interface is satisfied at compile time
var _ Service = (*service)(nil)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/contact/mock_service.go -package=contact . Service

// Service defines the contract for contact business logic
type Service interface {
	Create(ctx context.Context, req *ContactRequest) (*ContactResponse, error)
	List(ctx context.Context, page, limit int) (*ContactListResponse, error)
	FindByID(ctx context.Context, id string) (*ContactResponse, error)
	MarkAsRead(ctx context.Context, id string) error
	MarkAsUnread(ctx context.Context, id string) error
	Delete(ctx context.Context, id string) error
}

type service struct {
	repo Repository
}

// NewService creates a new contact service
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) Create(ctx context.Context, req *ContactRequest) (*ContactResponse, error) {
	// Generate submission hash for duplicate detection
	submissionHash := hash.HashContact(req.Email, req.Phone, req.Message)

	// Check for duplicate submission within the duplicate window
	duplicateWindow := 5 * time.Minute // From config.yaml in production
	existing, err := s.repo.FindByHashWithinTime(ctx, submissionHash, duplicateWindow)
	if err != nil {
		return nil, fmt.Errorf("failed to check duplicate: %w", err)
	}
	if existing != nil {
		return nil, fmt.Errorf("DUPLICATE_SUBMISSION: you have already submitted a message recently. Please wait before submitting again.")
	}

	// Create new contact
	contact := &Contact{
		Name:           req.Name,
		Email:          req.Email,
		Phone:          req.Phone,
		Message:        req.Message,
		IsRead:         false,
		SubmissionHash: submissionHash,
	}

	created, err := s.repo.Create(ctx, contact)
	if err != nil {
		return nil, fmt.Errorf("failed to create contact: %w", err)
	}

	resp := ToResponse(created)
	return &resp, nil
}

func (s *service) List(ctx context.Context, page, limit int) (*ContactListResponse, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	contacts, total, err := s.repo.List(ctx, page, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to list contacts: %w", err)
	}

	totalPage := (total + limit - 1) / limit
	if totalPage < 1 {
		totalPage = 1
	}

	return &ContactListResponse{
		Contacts:  ToResponseList(contacts),
		Total:     total,
		Page:      page,
		Limit:     limit,
		TotalPage: totalPage,
	}, nil
}

func (s *service) FindByID(ctx context.Context, id string) (*ContactResponse, error) {
	contactID, err := uuid.Parse(id)
	if err != nil {
		return nil, fmt.Errorf("invalid contact ID: %w", err)
	}

	c, err := s.repo.FindByID(ctx, contactID)
	if err != nil {
		return nil, fmt.Errorf("failed to find contact: %w", err)
	}
	if c == nil {
		return nil, fmt.Errorf("contact not found")
	}

	resp := ToResponse(c)
	return &resp, nil
}

func (s *service) MarkAsRead(ctx context.Context, id string) error {
	contactID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid contact ID: %w", err)
	}

	if err := s.repo.MarkAsRead(ctx, contactID); err != nil {
		return fmt.Errorf("failed to mark as read: %w", err)
	}
	return nil
}

func (s *service) MarkAsUnread(ctx context.Context, id string) error {
	contactID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid contact ID: %w", err)
	}

	if err := s.repo.MarkAsUnread(ctx, contactID); err != nil {
		return fmt.Errorf("failed to mark as unread: %w", err)
	}
	return nil
}

func (s *service) Delete(ctx context.Context, id string) error {
	contactID, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("invalid contact ID: %w", err)
	}

	if err := s.repo.Delete(ctx, contactID); err != nil {
		return fmt.Errorf("failed to delete contact: %w", err)
	}
	return nil
}
