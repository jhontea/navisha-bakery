# Navisha Bakery — Backend AI Agent Instructions

> Read this file to understand the backend project patterns, conventions, and how-to guides.
> This reduces context window usage by providing a concise reference instead of parsing the entire codebase.

---

## 1. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Go | 1.25+ | Language |
| Echo | v4 | HTTP framework |
| pgx | v5 | PostgreSQL driver |
| go-redis | v9 | Redis client (Upstash) |
| godotenv | Latest | .env loading (secrets) |
| gopkg.in/yaml.v3 | Latest | config.yaml parsing (static config) |
| golang-jwt/jwt/v5 | Latest | JWT handling |
| resend/resend-go/v2 | Latest | Email sending |
| cloudflare/cloudflare-go | Latest | R2 image storage |
| stretchr/testify | Latest | Testing assertions |
| go.uber.org/mock | Latest | Mock generation from interfaces |

---

## 2. Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go                       # Entry point
│
├── internal/
│   ├── config/
│   │   ├── config.go                     # Config loading (godotenv + yaml)
│   │   └── types.go                      # Config struct definitions
│   │
│   ├── database/
│   │   ├── database.go                   # PostgreSQL connection (pgx pool)
│   │   └── migrations/                   # SQL migration files (numbered)
│   │       ├── 001_create_admins.sql
│   │       ├── 002_create_users.sql
│   │       ├── 003_create_menus.sql
│   │       ├── 004_create_contacts.sql
│   │       ├── 005_create_orders.sql
│   │       └── 006_create_order_items.sql
│   │
│   ├── cache/
│   │   ├── redis.go                      # Redis connection setup
│   │   └── interface.go                  # Cache interface for DI + mock generation
│   │
│   ├── middleware/
│   │   ├── auth.go                       # JWT auth (AdminAuth, UserAuth)
│   │   ├── cors.go                       # CORS from config
│   │   ├── ratelimit.go                  # Rate limiting (Redis-backed)
│   │   ├── idempotency.go                # Idempotency key checker (Redis-backed)
│   │   ├── logger.go                     # Request logging
│   │   ├── security.go                   # Security headers
│   │   └── sanitize.go                   # Input sanitization
│   │
│   ├── domain/                           # Business logic (per domain)
│   │   ├── menu/
│   │   │   ├── model.go                  # Menu struct
│   │   │   ├── dto.go                    # Request/Response DTOs
│   │   │   ├── repository.go             # Repository interface + implementation
│   │   │   ├── service.go                # Service interface + implementation
│   │   │   ├── handler.go                # Echo HTTP handlers
│   │   │   └── constants.go              # Category constants
│   │   │
│   │   ├── contact/
│   │   │   ├── model.go
│   │   │   ├── dto.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   └── handler.go
│   │   │
│   │   ├── admin/
│   │   │   ├── model.go
│   │   │   ├── dto.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   └── handler.go
│   │   │
│   │   ├── auth/
│   │   │   ├── model.go
│   │   │   ├── dto.go
│   │   │   ├── service.go
│   │   │   └── handler.go
│   │   │
│   │   ├── user/                         # Phase 2
│   │   │   ├── model.go
│   │   │   ├── dto.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   └── handler.go
│   │   │
│   │   └── order/                        # Phase 2
│   │       ├── model.go
│   │       ├── dto.go
│   │       ├── repository.go
│   │       ├── service.go
│   │       ├── handler.go
│   │       └── number.go
│   │
│   ├── services/                         # Cross-cutting services
│   │   ├── email/
│   │   │   ├── service.go                # Email service interface + implementation
│   │   │   └── resend.go
│   │   ├── image/
│   │   │   ├── service.go                # Image service interface + implementation
│   │   │   └── r2.go
│   │   └── telegram/                     # Phase 2
│   │       ├── bot.go
│   │       ├── handlers.go
│   │       └── messages.go
│   │
│   └── pkg/                              # Shared packages
│       ├── jwt/
│       │   └── jwt.go
│       ├── google/
│       │   └── oauth.go
│       ├── hash/
│       │   └── hash.go
│       └── validator/
│           └── validator.go
│
├── mocks/                                # Generated mock files (go generate)
│   ├── domain/
│   │   ├── menu/
│   │   │   ├── mock_repository.go
│   │   │   └── mock_service.go
│   │   ├── contact/
│   │   │   ├── mock_repository.go
│   │   │   └── mock_service.go
│   │   └── admin/
│   │       └── mock_repository.go
│   ├── cache/
│   │   └── mock_cache.go
│   └── services/
│       ├── email/
│       │   └── mock_service.go
│       └── image/
│           └── mock_service.go
│
├── config.yaml                           # Static config (committed)
├── .env                                  # Secrets (gitignored)
├── go.mod
├── go.sum
├── Makefile
├── Dockerfile
└── .gitignore
```

---

## 3. Interface-Driven Dependency Injection

> **Design Decision:** All repositories, services, and cache define interfaces.
> This enables:
> 1. Easy testing with mock implementations
> 2. Swappable implementations (e.g., different cache providers)
> 3. Clear contract between layers
> 4. `go generate` + `mockgen` for automatic mock generation

### Pattern: Interface + Unexported Implementation in Same File

```go
// internal/domain/menu/repository.go

package menu

import (
    "context"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5/pgxpool"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/menu/mock_repository.go -package=menu . Repository

// Repository defines the contract for menu data access
type Repository interface {
    List(ctx context.Context, category string, available bool, page, limit int) ([]Menu, int, error)
    FindByID(ctx context.Context, id uuid.UUID) (*Menu, error)
    ListFeatured(ctx context.Context, limit int) ([]Menu, error)
    Create(ctx context.Context, menu *Menu) (*Menu, error)
    Update(ctx context.Context, menu *Menu) (*Menu, error)
    Delete(ctx context.Context, id uuid.UUID) error
    Count(ctx context.Context, category string, available bool) (int, error)
}

// repository is the concrete implementation (unexported — hidden behind interface)
type repository struct {
    db *pgxpool.Pool
}

// NewRepository creates a new menu repository
// Returns the INTERFACE, not the concrete type
func NewRepository(db *pgxpool.Pool) Repository {
    return &repository{db: db}
}

func (r *repository) List(ctx context.Context, category string, available bool, page, limit int) ([]Menu, int, error) {
    offset := (page - 1) * limit
    query := `
        SELECT id, name, description, category, price, discount, discount_price,
               image_url, is_available, is_featured, sort_order, created_at, updated_at
        FROM menus
        WHERE ($1::text = '' OR category = $1)
          AND ($2::bool = false OR is_available = $2)
        ORDER BY sort_order ASC, created_at DESC
        LIMIT $3 OFFSET $4
    `
    // ... execute query, scan rows, return results
}
```

### Pattern: Cache Interface (Redis)

```go
// internal/cache/interface.go

package cache

import "time"

//go:generate go run go.uber.org/mock/mockgen -destination=../../mocks/cache/mock_cache.go -package=cache . Cache

// Cache defines the contract for key-value caching
type Cache interface {
    Get(key string) (string, error)
    Set(key string, value string, ttl time.Duration) error
    Del(keys ...string) error
    Exists(key string) (bool, error)
    Incr(key string) (int64, error)
    SetNX(key string, value string, ttl time.Duration) (bool, error)
    Ping() error
}

// cache is the concrete Redis implementation (unexported)
type cache struct {
    client *redis.Client
}

// NewCache creates a new Redis-backed cache
func NewCache(redisURL string) (Cache, error) {
    opts, err := redis.ParseURL(redisURL)
    if err != nil {
        return nil, err
    }

    client := redis.NewClient(opts)
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if err := client.Ping(ctx).Err(); err != nil {
        return nil, err
    }

    return &cache{client: client}, nil
}

func (c *cache) Get(key string) (string, error) {
    return c.client.Get(context.Background(), key).Result()
}

func (c *cache) Set(key string, value string, ttl time.Duration) error {
    return c.client.Set(context.Background(), key, value, ttl).Err()
}

func (c *cache) Del(keys ...string) error {
    return c.client.Del(context.Background(), keys...).Err()
}

func (c *cache) Exists(key string) (bool, error) {
    val, err := c.client.Exists(context.Background(), key).Result()
    return val > 0, err
}

func (c *cache) Incr(key string) (int64, error) {
    return c.client.Incr(context.Background(), key).Result()
}

func (c *cache) SetNX(key string, value string, ttl time.Duration) (bool, error) {
    return c.client.SetNX(context.Background(), key, value, ttl).Result()
}

func (c *cache) Ping() error {
    return c.client.Ping(context.Background()).Err()
}
```

### Pattern: Service Interface

```go
// internal/domain/menu/service.go

package menu

import (
    "context"
    imageService "github.com/navishabakery/backend/internal/services/image"
)

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/domain/menu/mock_service.go -package=menu . Service

// Service defines the contract for menu business logic
type Service interface {
    List(ctx context.Context, category string, available bool, page, limit int) (*MenuListResponse, error)
    FindByID(ctx context.Context, id string) (*MenuResponse, error)
    ListFeatured(ctx context.Context, limit int) (*MenuListResponse, error)
    Create(ctx context.Context, req CreateMenuRequest, imageData []byte, imageContentType string) (*MenuResponse, error)
    Update(ctx context.Context, id string, req UpdateMenuRequest, imageData []byte, imageContentType string) (*MenuResponse, error)
    Delete(ctx context.Context, id string) error
}

// service is the concrete implementation (unexported)
type service struct {
    repo    Repository              // Depends on Repository INTERFACE
    image   imageService.Service    // Depends on image Service INTERFACE
}

// NewService creates a new menu service
func NewService(repo Repository, image imageService.Service) Service {
    return &service{repo: repo, image: image}
}
```

### Pattern: Email Service Interface

```go
// internal/services/email/service.go

package email

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/services/email/mock_service.go -package=email . Service

// Service defines the contract for sending emails
type Service interface {
    SendWelcomeEmail(toEmail string, toName string, adminName string) error
}

// service is the concrete Resend implementation
type service struct {
    apiKey    string
    fromEmail string
}

func NewService(apiKey, fromEmail string) Service {
    return &service{apiKey: apiKey, fromEmail: fromEmail}
}
```

### Pattern: Image Service Interface

```go
// internal/services/image/service.go

package image

import "context"

//go:generate go run go.uber.org/mock/mockgen -destination=../../../mocks/services/image/mock_service.go -package=image . Service

// Service defines the contract for image storage operations
type Service interface {
    Upload(ctx context.Context, filename string, data []byte, contentType string) (url string, key string, err error)
    Delete(ctx context.Context, key string) error
}

// service is the concrete R2 implementation
type service struct {
    bucketName string
    publicURL  string
}

func NewService(bucketName, publicURL, accountID, accessKey, secretKey string) Service {
    // Initialize R2 client...
    return &service{bucketName: bucketName, publicURL: publicURL}
}
```

---

## 4. Mock Generation with `go generate`

### Setup

1. **Install mockgen:**
```bash
go install go.uber.org/mock/mockgen@latest
```

2. **`//go:generate` directives** are placed at the top of each interface file (shown above)

### Generate All Mocks

```bash
# Generate all mocks at once
go generate ./internal/...

# Or generate for specific domain
go generate ./internal/domain/menu/...
go generate ./internal/cache/...
go generate ./internal/services/email/...
```

### Mock File Location

```
mocks/
├── domain/
│   ├── menu/
│   │   ├── mock_repository.go    # From menu.Repository interface
│   │   └── mock_service.go       # From menu.Service interface
│   ├── contact/
│   │   ├── mock_repository.go
│   │   └── mock_service.go
│   └── admin/
│       └── mock_repository.go
├── cache/
│   └── mock_cache.go             # From cache.Cache interface
└── services/
    ├── email/
    │   └── mock_service.go       # From email.Service interface
    └── image/
        └── mock_service.go       # From image.Service interface
```

### Makefile

```makefile
.PHONY: generate mock run build test test-verbose

generate:
	go generate ./internal/...

mock:
	go install go.uber.org/mock/mockgen@latest
	go generate ./internal/...

run:
	go run ./cmd/server

build:
	go build -o bin/server ./cmd/server

test:
	go test ./...

test-verbose:
	go test -v ./...
```

---

## 5. Testing with Mocks

### Service Unit Test

```go
// internal/domain/menu/service_test.go

package menu

import (
    "context"
    "testing"
    "github.com/google/uuid"
    "github.com/stretchr/testify/assert"
    "go.uber.org/mock/gomock"
)

func TestServiceList(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    // Create mocks
    mockRepo := NewMockRepository(ctrl)
    mockImage := imageMock.NewMockService(ctrl)

    // Create service with mock dependencies (all interfaces)
    svc := NewService(mockRepo, mockImage)

    // Set expectations
    expectedMenus := []Menu{
        {ID: uuid.New(), Name: "Chocolate Cake", Category: "cake", Price: 250000},
    }
    mockRepo.EXPECT().
        List(gomock.Any(), "cake", false, 1, 20).
        Return(expectedMenus, 1, nil)

    // Execute
    result, err := svc.List(context.Background(), "cake", false, 1, 20)

    // Assert
    assert.NoError(t, err)
    assert.Len(t, result.Items, 1)
    assert.Equal(t, "Chocolate Cake", result.Items[0].Name)
}

func TestServiceCreateInvalidCategory(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    mockRepo := NewMockRepository(ctrl)
    mockImage := imageMock.NewMockService(ctrl)
    svc := NewService(mockRepo, mockImage)

    req := CreateMenuRequest{Name: "Bad Item", Category: "invalid", Price: 10000}

    result, err := svc.Create(context.Background(), req, nil, "")

    assert.Error(t, err)
    assert.Nil(t, result)
    assert.Equal(t, ErrInvalidCategory, err)
}
```

### Cache Mock in Tests

```go
func TestContactDuplicateDetection(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    mockRepo := NewMockRepository(ctrl)
    mockCache := cacheMock.NewMockCache(ctrl)

    svc := NewService(mockRepo, mockCache)

    hash := "abc123hash"

    // Expect cache check for duplicate
    mockCache.EXPECT().
        Get("contact:dedup:" + hash).
        Return("1", nil)  // Found in cache = duplicate

    _, err := svc.Create(context.Background(), CreateContactRequest{
        Name: "Test", Email: "test@test.com", Message: "Hello",
    })

    assert.ErrorIs(t, err, ErrDuplicateSubmission)
}
```

---

## 6. Idempotency Middleware (Redis)

```go
// internal/middleware/idempotency.go

package middleware

import (
    "encoding/json"
    "net/http"
    "time"
    "github.com/labstack/echo/v4"
    "github.com/navishabakery/backend/internal/cache"
)

func Idempotency(c cache.Cache, expiry time.Duration) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(ctx echo.Context) error {
            // Only for write methods
            method := ctx.Request().Method
            if method != "POST" && method != "PUT" && method != "PATCH" && method != "DELETE" {
                return next(ctx)
            }

            // If Redis is unavailable, skip (fail open)
            if err := c.Ping(); err != nil {
                // Log warning but don't block the request
                return next(ctx)
            }

            // Extract key
            key := ctx.Request().Header.Get("Idempotency-Key")
            if key == "" {
                return ctx.JSON(http.StatusBadRequest, map[string]interface{}{
                    "success": false,
                    "error":   "VALIDATION_ERROR",
                    "message": "Idempotency-Key header required for write operations",
                })
            }

            redisKey := "idempotency:" + key + ":" + ctx.Path()

            // Check if key exists
            cached, err := c.Get(redisKey)
            if err == nil && cached != "" {
                var response map[string]interface{}
                json.Unmarshal([]byte(cached), &response)
                return ctx.JSON(http.StatusConflict, map[string]interface{}{
                    "success": false,
                    "error":   "IDEMPOTENCY_CONFLICT",
                    "message": "A request with this Idempotency-Key has already been processed",
                })
            }

            // Process request
            rec := echo.NewResponseRecorder(ctx.Response())
            ctx.Response().Writer = rec

            if err := next(ctx); err != nil {
                return err
            }

            // Store result in Redis with TTL
            body, _ := json.Marshal(map[string]interface{}{
                "status_code": rec.Status,
                "response":    rec.Body().String(),
            })
            c.Set(redisKey, string(body), expiry)

            return nil
        }
    }
}
```

---

## 7. Rate Limiting Middleware (Redis)

```go
// internal/middleware/ratelimit.go

package middleware

import (
    "fmt"
    "net/http"
    "strconv"
    "time"
    "github.com/labstack/echo/v4"
    "github.com/navishabakery/backend/internal/cache"
)

func RateLimit(c cache.Cache, maxRequests int, window time.Duration) echo.MiddlewareFunc {
    return func(next echo.HandlerFunc) echo.HandlerFunc {
        return func(ctx echo.Context) error {
            // If Redis is unavailable, skip (fail open)
            if err := c.Ping(); err != nil {
                return next(ctx)
            }

            ip := ctx.RealIP()
            key := fmt.Sprintf("ratelimit:%s:%s", ip, ctx.Path())

            // Increment counter
            count, err := c.Incr(key)
            if err != nil {
                return next(ctx)
            }

            // Set expiry on first request
            if count == 1 {
                c.Set(key, strconv.FormatInt(count, 10), window)
            }

            // Set rate limit headers
            ctx.Response().Header().Set("X-RateLimit-Limit", strconv.Itoa(maxRequests))
            ctx.Response().Header().Set("X-RateLimit-Remaining", strconv.Itoa(maxRequests-int(count)))

            if count > int64(maxRequests) {
                return ctx.JSON(http.StatusTooManyRequests, map[string]interface{}{
                    "success": false,
                    "error":   "RATE_LIMITED",
                    "message": "Too many requests. Please try again later.",
                })
            }

            return next(ctx)
        }
    }
}
```

---

## 8. Configuration Loading

```go
// internal/config/config.go

package config

import (
    "os"
    "github.com/joho/godotenv"
    "gopkg.in/yaml.v3"
)

type Config struct {
    Server    ServerConfig    `yaml:"server"`
    CORS      CORSConfig      `yaml:"cors"`
    RateLimit RateLimitConfig `yaml:"rate_limit"`
    Menu      MenuConfig      `yaml:"menu"`
    Idempotency IdempotencyConfig `yaml:"idempotency"`
}

func Load() (*Config, error) {
    godotenv.Load()
    data, err := os.ReadFile("config.yaml")
    if err != nil {
        return nil, err
    }
    var cfg Config
    if err := yaml.Unmarshal(data, &cfg); err != nil {
        return nil, err
    }
    return &cfg, nil
}

// Secrets (from .env via godotenv)
func GetDatabaseURL() string       { return os.Getenv("DATABASE_URL") }
func GetJWTSecret() string         { return os.Getenv("JWT_SECRET") }
func GetGoogleClientID() string    { return os.Getenv("GOOGLE_CLIENT_ID") }
func GetGoogleClientSecret() string { return os.Getenv("GOOGLE_CLIENT_SECRET") }
func GetRedisURL() string          { return os.Getenv("REDIS_URL") }
func GetR2AccountID() string       { return os.Getenv("R2_ACCOUNT_ID") }
func GetR2AccessKey() string       { return os.Getenv("R2_ACCESS_KEY_ID") }
func GetR2SecretKey() string       { return os.Getenv("R2_SECRET_ACCESS_KEY") }
func GetResendAPIKey() string      { return os.Getenv("RESEND_API_KEY") }
func GetSuperAdminEmail() string   { return os.Getenv("SUPER_ADMIN_EMAIL") }
```

---

## 9. Route Registration (main.go)

```go
func main() {
    cfg, err := config.Load()
    if err != nil {
        log.Fatal(err)
    }

    // Connect to PostgreSQL
    db, err := database.Connect(context.Background())
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Connect to Redis (optional — app works without it)
    cacheStore, err := cache.NewCache(config.GetRedisURL())
    if err != nil {
        log.Warn("Redis unavailable, idempotency and rate limiting disabled: ", err)
        cacheStore = cache.NewNoOpCache() // Fallback no-op cache
    }

    // Initialize Echo
    e := echo.New()
    e.Validator = &CustomValidator{validator: validator.New()}

    // Global middleware
    e.Use(middleware.Logger())
    e.Use(middleware.Recover())
    e.Use(security.SecurityHeaders())
    e.Use(sanitize.InputSanitizer())

    // Initialize cross-cutting services (all interfaces)
    emailSvc := email.NewService(config.GetResendAPIKey(), "notifications@navishabakery.com")
    imageSvc := image.NewService(cfg.R2.BucketName, cfg.R2.PublicURL,
        config.GetR2AccountID(), config.GetR2AccessKey(), config.GetR2SecretKey())

    // Initialize domains (dependency injection via interfaces)
    menuRepo := menu.NewRepository(db)                             // Returns menu.Repository
    menuService := menu.NewService(menuRepo, imageSvc)             // Accepts interfaces
    menuHandler := menu.NewHandler(menuService)                    // Accepts interface

    adminRepo := admin.NewRepository(db)
    adminService := admin.NewService(adminRepo, emailSvc)
    adminHandler := admin.NewHandler(adminService)

    contactRepo := contact.NewRepository(db)
    contactService := contact.NewService(contactRepo, cacheStore)
    contactHandler := contact.NewHandler(contactService)

    authHandler := auth.NewHandler(auth.NewService(adminRepo))

    // Routes — Public
    api := e.Group("/api")
    api.GET("/health", healthCheck)
    api.GET("/menus", menuHandler.List)
    api.GET("/menus/featured", menuHandler.ListFeatured)
    api.GET("/menus/:id", menuHandler.GetByID)
    api.POST("/contacts", contactHandler.Create,
        middleware.RateLimit(cacheStore, 5, 5*time.Minute))

    // Routes — Admin
    admin := api.Group("/admin")
    adminAuth := middleware.AdminAuth(config.GetJWTSecret())

    admin.POST("/auth/google", authHandler.LoginWithGoogle)
    admin.GET("/auth/me", authHandler.Me, adminAuth)
    admin.POST("/auth/logout", authHandler.Logout, adminAuth)

    admin.POST("/menus", menuHandler.Create, adminAuth,
        middleware.Idempotency(cacheStore, 24*time.Hour))
    admin.PUT("/menus/:id", menuHandler.Update, adminAuth,
        middleware.Idempotency(cacheStore, 24*time.Hour))
    admin.DELETE("/menus/:id", menuHandler.Delete, adminAuth,
        middleware.Idempotency(cacheStore, 24*time.Hour))

    admin.GET("/contacts", contactHandler.List, adminAuth)
    admin.GET("/contacts/:id", contactHandler.GetByID, adminAuth)
    admin.PATCH("/contacts/:id/read", contactHandler.ToggleRead, adminAuth,
        middleware.Idempotency(cacheStore, 24*time.Hour))
    admin.DELETE("/contacts/:id", contactHandler.Delete, adminAuth,
        middleware.Idempotency(cacheStore, 24*time.Hour))

    admin.GET("/admins", adminHandler.List, adminAuth, middleware.SuperAdminOnly())
    admin.POST("/admins", adminHandler.Create, adminAuth, middleware.SuperAdminOnly(),
        middleware.Idempotency(cacheStore, 24*time.Hour))
    admin.DELETE("/admins/:id", adminHandler.Delete, adminAuth, middleware.SuperAdminOnly(),
        middleware.Idempotency(cacheStore, 24*time.Hour))

    e.Logger.Fatal(e.Start(fmt.Sprintf(":%d", cfg.Server.Port)))
}
```

---

## 10. No-Op Cache (Fail-Open Fallback)

```go
// internal/cache/noop.go

package cache

import "time"

// NoOpCache is a fallback when Redis is unavailable
// All operations succeed but do nothing (fail-open)
type NoOpCache struct{}

func NewNoOpCache() Cache {
    return &NoOpCache{}
}

func (c *NoOpCache) Get(key string) (string, error)                       { return "", ErrCacheUnavailable }
func (c *NoOpCache) Set(key string, value string, ttl time.Duration) error { return nil }
func (c *NoOpCache) Del(keys ...string) error                             { return nil }
func (c *NoOpCache) Exists(key string) (bool, error)                      { return false, nil }
func (c *NoOpCache) Incr(key string) (int64, error)                       { return 1, nil }
func (c *NoOpCache) SetNX(key string, value string, ttl time.Duration) (bool, error) { return true, nil }
func (c *NoOpCache) Ping() error                                          { return ErrCacheUnavailable }
```

---

## 11. API Response Format

```go
// Success
c.JSON(http.StatusOK, map[string]interface{}{
    "success": true,
    "data":    result,
    "message": "Optional success message",
})

// Error
c.JSON(http.StatusBadRequest, map[string]interface{}{
    "success": false,
    "error":   "VALIDATION_ERROR",
    "message": "Human-readable error description",
})
```

---

## 12. Security Checklist for Handlers

- [ ] **Input validation** — Echo binding + custom validation tags
- [ ] **SQL injection** — Parameterized queries only (pgx `$1`, `$2`)
- [ ] **Auth check** — `adminAuth` or `userAuth` middleware
- [ ] **Idempotency** — `Idempotency-Key` header + Redis check
- [ ] **Rate limit** — Redis-backed rate limiting on public endpoints
- [ ] **Input sanitization** — Trim, strip HTML, max length
- [ ] **Error handling** — Never expose internal errors to client

---

## 13. Interface Summary

| Package | Interface | Key Methods |
|---|---|---|
| `cache` | `Cache` | Get, Set, Del, Exists, Incr, SetNX, Ping |
| `domain/menu` | `Repository` | List, FindByID, Create, Update, Delete |
| `domain/menu` | `Service` | List, FindByID, Create, Update, Delete |
| `domain/contact` | `Repository` | Create, FindByHashWithinTime, List, MarkAsRead, Delete |
| `domain/contact` | `Service` | Create, List, ToggleRead, Delete |
| `domain/admin` | `Repository` | FindByEmail, FindByID, Create, Delete, ListAll |
| `services/email` | `Service` | SendWelcomeEmail |
| `services/image` | `Service` | Upload, Delete |

---

## 14. Adding a New Domain (Step-by-Step)

1. **Create directory**: `internal/domain/{name}/`
2. **model.go**: Define struct matching DB schema
3. **dto.go**: Define request/response DTOs with validation tags
4. **repository.go**: Define `Repository` interface + concrete implementation
   - Add `//go:generate` directive for mock generation
5. **service.go**: Define `Service` interface + concrete implementation (depends on interfaces)
   - Add `//go:generate` directive for mock generation
6. **handler.go**: Implement Echo HTTP handlers (depends on Service interface)
7. **constants.go**: Add domain constants (if needed)
8. **Migration**: Add SQL file in `internal/database/migrations/`
9. **Generate mocks**: `go generate ./internal/domain/{name}/...`
10. **Register routes**: Add to route groups in `cmd/server/main.go`
11. **Wire dependencies**: Create repo → service → handler (all via interfaces)
12. **Test**: Write unit tests using generated mocks

---

## 15. Category Constants

```go
// internal/domain/menu/constants.go
package menu

const (
    CategoryFood     = "food"
    CategoryBeverage = "beverage"
    CategoryCake     = "cake"
    CategoryPastry   = "pastry"
    CategoryBread    = "bread"
)

var validCategories = map[string]bool{
    CategoryFood: true, CategoryBeverage: true, CategoryCake: true,
    CategoryPastry: true, CategoryBread: true,
}

func IsValidCategory(category string) bool { return validCategories[category] }
func AllCategories() []string { return []string{CategoryFood, CategoryBeverage, CategoryCake, CategoryPastry, CategoryBread} }
```

---

## 16. Common Commands

```bash
# Development
make run                        # Run dev server
go run ./cmd/server             # Alternative

# Build
make build                      # Build binary

# Generate mocks
make generate                   # go generate ./internal/...
go generate ./internal/...      # Alternative

# Test
make test                       # go test ./...
go test ./...                   # Alternative
go test -v ./internal/domain/menu/...   # Specific package
go test -run TestServiceCreate ./...    # Specific test

# Lint
golangci-lint run               # Run linter