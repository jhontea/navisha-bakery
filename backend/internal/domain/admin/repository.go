package admin

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/admin/mock_repository.go -package=admin . Repository

// Repository defines the contract for admin data access
type Repository interface {
	FindByEmail(ctx context.Context, email string) (*Admin, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Admin, error)
	Create(ctx context.Context, admin *Admin) (*Admin, error)
	Delete(ctx context.Context, id uuid.UUID) error
	ListAll(ctx context.Context) ([]Admin, error)
	UpdateGoogleID(ctx context.Context, id uuid.UUID, googleID string, avatarURL string) error
}

type repository struct {
	db *pgxpool.Pool
}

// NewRepository creates a new admin repository
func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) FindByEmail(ctx context.Context, email string) (*Admin, error) {
	query := `
		SELECT id, email, name, google_id, avatar_url, role, is_active, created_at, updated_at
		FROM admins
		WHERE email = $1 AND is_active = true
	`

	var a Admin
	err := r.db.QueryRow(ctx, query, email).Scan(
		&a.ID, &a.Email, &a.Name, &a.GoogleID, &a.AvatarURL,
		&a.Role, &a.IsActive, &a.CreatedAt, &a.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *repository) FindByID(ctx context.Context, id uuid.UUID) (*Admin, error) {
	query := `
		SELECT id, email, name, google_id, avatar_url, role, is_active, created_at, updated_at
		FROM admins
		WHERE id = $1 AND is_active = true
	`

	var a Admin
	err := r.db.QueryRow(ctx, query, id).Scan(
		&a.ID, &a.Email, &a.Name, &a.GoogleID, &a.AvatarURL,
		&a.Role, &a.IsActive, &a.CreatedAt, &a.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *repository) Create(ctx context.Context, admin *Admin) (*Admin, error) {
	query := `
		INSERT INTO admins (email, name, role, is_active)
		VALUES ($1, $2, $3, $4)
		RETURNING id, email, name, google_id, avatar_url, role, is_active, created_at, updated_at
	`

	var a Admin
	err := r.db.QueryRow(ctx, query,
		admin.Email, admin.Name, admin.Role, admin.IsActive,
	).Scan(
		&a.ID, &a.Email, &a.Name, &a.GoogleID, &a.AvatarURL,
		&a.Role, &a.IsActive, &a.CreatedAt, &a.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM admins WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repository) ListAll(ctx context.Context) ([]Admin, error) {
	query := `
		SELECT id, email, name, google_id, avatar_url, role, is_active, created_at, updated_at
		FROM admins
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var admins []Admin
	for rows.Next() {
		var a Admin
		err := rows.Scan(
			&a.ID, &a.Email, &a.Name, &a.GoogleID, &a.AvatarURL,
			&a.Role, &a.IsActive, &a.CreatedAt, &a.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		admins = append(admins, a)
	}
	return admins, nil
}

func (r *repository) UpdateGoogleID(ctx context.Context, id uuid.UUID, googleID string, avatarURL string) error {
	query := `UPDATE admins SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.db.Exec(ctx, query, googleID, avatarURL, id)
	return err
}
