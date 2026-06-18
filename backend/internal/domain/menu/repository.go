package menu

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/menu/mock_repository.go -package=menu . Repository

// Repository defines the contract for menu data access
type Repository interface {
	List(ctx context.Context, category string, available *bool, page, limit int) ([]Menu, int, error)
	FindByID(ctx context.Context, id uuid.UUID) (*Menu, error)
	ListFeatured(ctx context.Context, limit int) ([]Menu, error)
	Create(ctx context.Context, m *Menu) (*Menu, error)
	Update(ctx context.Context, m *Menu) (*Menu, error)
	Delete(ctx context.Context, id uuid.UUID) error
	Count(ctx context.Context, category string, available *bool) (int, error)
}

type repository struct {
	db *pgxpool.Pool
}

// NewRepository creates a new menu repository
func NewRepository(db *pgxpool.Pool) Repository {
	return &repository{db: db}
}

func (r *repository) List(ctx context.Context, category string, available *bool, page, limit int) ([]Menu, int, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if category != "" {
		whereClause += fmt.Sprintf(" AND category = $%d", argCount)
		args = append(args, category)
		argCount++
	}
	if available != nil {
		whereClause += fmt.Sprintf(" AND is_available = $%d", argCount)
		args = append(args, *available)
		argCount++
	}

	// Count total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM menus %s", whereClause)
	var total int
	if err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	// Paginated query
	offset := (page - 1) * limit
	query := fmt.Sprintf(`
		SELECT id, name, description, category, price, discount, discount_price,
		       image_url, image_key, is_available, is_featured, sort_order, created_at, updated_at
		FROM menus
		%s
		ORDER BY sort_order ASC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argCount, argCount+1)

	args = append(args, limit, offset)
	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var menus []Menu
	for rows.Next() {
		var m Menu
		err := rows.Scan(
			&m.ID, &m.Name, &m.Description, &m.Category, &m.Price, &m.Discount, &m.DiscountPrice,
			&m.ImageURL, &m.ImageKey, &m.IsAvailable, &m.IsFeatured, &m.SortOrder,
			&m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		menus = append(menus, m)
	}

	return menus, total, nil
}

func (r *repository) FindByID(ctx context.Context, id uuid.UUID) (*Menu, error) {
	query := `
		SELECT id, name, description, category, price, discount, discount_price,
		       image_url, image_key, is_available, is_featured, sort_order, created_at, updated_at
		FROM menus
		WHERE id = $1
	`

	var m Menu
	err := r.db.QueryRow(ctx, query, id).Scan(
		&m.ID, &m.Name, &m.Description, &m.Category, &m.Price, &m.Discount, &m.DiscountPrice,
		&m.ImageURL, &m.ImageKey, &m.IsAvailable, &m.IsFeatured, &m.SortOrder,
		&m.CreatedAt, &m.UpdatedAt,
	)
	if err == pgx.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) ListFeatured(ctx context.Context, limit int) ([]Menu, error) {
	query := `
		SELECT id, name, description, category, price, discount, discount_price,
		       image_url, image_key, is_available, is_featured, sort_order, created_at, updated_at
		FROM menus
		WHERE is_featured = true AND is_available = true
		ORDER BY sort_order ASC, created_at DESC
		LIMIT $1
	`

	rows, err := r.db.Query(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var menus []Menu
	for rows.Next() {
		var m Menu
		err := rows.Scan(
			&m.ID, &m.Name, &m.Description, &m.Category, &m.Price, &m.Discount, &m.DiscountPrice,
			&m.ImageURL, &m.ImageKey, &m.IsAvailable, &m.IsFeatured, &m.SortOrder,
			&m.CreatedAt, &m.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		menus = append(menus, m)
	}
	return menus, nil
}

func (r *repository) Create(ctx context.Context, m *Menu) (*Menu, error) {
	query := `
		INSERT INTO menus (name, description, category, price, discount, discount_price,
		                   image_url, image_key, is_available, is_featured, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, name, description, category, price, discount, discount_price,
		          image_url, image_key, is_available, is_featured, sort_order, created_at, updated_at
	`

	var created Menu
	err := r.db.QueryRow(ctx, query,
		m.Name, m.Description, m.Category, m.Price, m.Discount, m.DiscountPrice,
		m.ImageURL, m.ImageKey, m.IsAvailable, m.IsFeatured, m.SortOrder,
	).Scan(
		&created.ID, &created.Name, &created.Description, &created.Category, &created.Price, &created.Discount, &created.DiscountPrice,
		&created.ImageURL, &created.ImageKey, &created.IsAvailable, &created.IsFeatured, &created.SortOrder,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &created, nil
}

func (r *repository) Update(ctx context.Context, m *Menu) (*Menu, error) {
	query := `
		UPDATE menus
		SET name = $1, description = $2, category = $3, price = $4, discount = $5,
		    discount_price = $6, image_url = $7, image_key = $8, is_available = $9,
		    is_featured = $10, sort_order = $11, updated_at = NOW()
		WHERE id = $12
		RETURNING id, name, description, category, price, discount, discount_price,
		          image_url, image_key, is_available, is_featured, sort_order, created_at, updated_at
	`

	var updated Menu
	err := r.db.QueryRow(ctx, query,
		m.Name, m.Description, m.Category, m.Price, m.Discount, m.DiscountPrice,
		m.ImageURL, m.ImageKey, m.IsAvailable, m.IsFeatured, m.SortOrder, m.ID,
	).Scan(
		&updated.ID, &updated.Name, &updated.Description, &updated.Category, &updated.Price, &updated.Discount, &updated.DiscountPrice,
		&updated.ImageURL, &updated.ImageKey, &updated.IsAvailable, &updated.IsFeatured, &updated.SortOrder,
		&updated.CreatedAt, &updated.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

func (r *repository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM menus WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

func (r *repository) Count(ctx context.Context, category string, available *bool) (int, error) {
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argCount := 1

	if category != "" {
		whereClause += fmt.Sprintf(" AND category = $%d", argCount)
		args = append(args, category)
		argCount++
	}
	if available != nil {
		whereClause += fmt.Sprintf(" AND is_available = $%d", argCount)
		args = append(args, *available)
		argCount++
	}

	query := fmt.Sprintf("SELECT COUNT(*) FROM menus %s", whereClause)
	var count int
	if err := r.db.QueryRow(ctx, query, args...).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}
