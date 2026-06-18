package contact

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/contact/mock_repository.go -package=contact . Repository

// Repository defines the contract for contact data access
type Repository interface {
	Create(ctx context.Context, c *Contact) (*Contact, error)
	FindByHashWithinTime(ctx context.Context, hash string, window time.Duration) (*Contact, error)
	List(ctx context.Context, page, limit int) ([]Contact, int, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Contact, error)
	MarkAsRead(ctx context.Context, id uuid.UUID) error
	MarkAsUnread(ctx context.Context, id uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type repository struct {
	db *pgxpool.Pool
}

// NewRepository creates a new contact repository
func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, c *Contact) (*Contact, error) {
	query := `
		INSERT INTO contacts (name, email, phone, message, is_read, submission_hash)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, name, email, phone, message, is_read, submission_hash, created_at
	`

	var created Contact
	err := r.db.QueryRow(ctx, query,
		c.Name, c.Email, c.Phone, c.Message, c.IsRead, c.SubmissionHash,
	).Scan(
		&created.ID, &created.Name, &created.Email, &created.Phone, &created.Message,
		&created.IsRead, &created.SubmissionHash, &created.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &created, nil
}

func (r *repository) FindByHashWithinTime(ctx context.Context, hash string, window time.Duration) (*Contact, error) {
	query := `
		SELECT id, name, email, phone, message, is_read, submission_hash, created_at
		FROM contacts
		WHERE submission_hash = $1 AND created_at > NOW() - $2::interval
		ORDER BY created_at DESC
		LIMIT 1
	`

	var c Contact
	err := r.db.QueryRow(ctx, query, hash, window.String()).Scan(
		&c.ID, &c.Name, &c.Email, &c.Phone, &c.Message,
		&c.IsRead, &c.SubmissionHash, &c.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) List(ctx context.Context, page, limit int) ([]Contact, int, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	// Count total
	var total int
	if err := r.db.QueryRow(ctx, "SELECT COUNT(*) FROM contacts").Scan(&total); err != nil {
		return nil, 0, err
	}

	// Paginated query
	offset := (page - 1) * limit
	query := `
		SELECT id, name, email, phone, message, is_read, submission_hash, created_at
		FROM contacts
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var contacts []Contact
	for rows.Next() {
		var c Contact
		err := rows.Scan(
			&c.ID, &c.Name, &c.Email, &c.Phone, &c.Message,
			&c.IsRead, &c.SubmissionHash, &c.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		contacts = append(contacts, c)
	}

	return contacts, total, nil
}

func (r *repository) FindByID(ctx context.Context, id uuid.UUID) (*Contact, error) {
	query := `
		SELECT id, name, email, phone, message, is_read, submission_hash, created_at
		FROM contacts
		WHERE id = $1
	`

	var c Contact
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.Name, &c.Email, &c.Phone, &c.Message,
		&c.IsRead, &c.SubmissionHash, &c.CreatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *repository) MarkAsRead(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE contacts SET is_read = true WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repository) MarkAsUnread(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE contacts SET is_read = false WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM contacts WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}
