# Technical Requirement Document (TRD)
## Navisha Bakery

---

## 1. Tech Stack Overview

| Layer | Technology | Version | Purpose | Environment |
|---|---|---|---|---|
| **Frontend** | Next.js (App Router) | 14+ | Landing page, Menu page, Contact Us, Admin Dashboard | Local dev → VPS |
| **Backend** | Go + Echo | 1.25+ / v4 | REST API server, Telegram bot, email service | Local dev → VPS |
| **Database** | PostgreSQL | 15+ | All persistent data storage | Supabase (Free Tier) |
| **Authentication** | Google OAuth 2.0 + JWT | — | Admin & User authentication (separate) | — |
| **Email Service** | Resend | — | Admin registration notifications | Resend (Free Tier: 100 emails/day) |
| **Bot** | Telegram Bot API | — | Order management via Telegram (Phase 2) | — (runs in Go backend) |
| **Image Storage** | Cloudflare R2 | — | Menu item image uploads | R2 Free Tier (10GB storage, 10M reads/mo) |
| **Cache / Idempotency** | Redis | — | Idempotency keys, rate limiting, caching | Upstash Redis (Free Tier: 10K cmds/day) |
| **Config (Secrets)** | godotenv | — | Environment variables for secrets | `.env` file |
| **Config (Static)** | config.yaml | — | Non-sensitive configuration | `config.yaml` file |

---

## 2. Configuration Management

### Secrets (.env — godotenv)

> Loaded via `godotenv`. NEVER committed to Git.

```bash
# Database
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRY_HOURS=1

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=navishabakery-images
R2_PUBLIC_URL=https://images.navishabakery.com

# Redis (Upstash)
REDIS_URL=redis://default:your_password@your-endpoint.upstash.io:6379

# Resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=notifications@navishabakery.com

# Telegram (Phase 2)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id

# Super Admin
SUPER_ADMIN_EMAIL=owner@navishabakery.com
```

### Static Config (config.yaml)

> Committed to Git. No secrets here.

```yaml
server:
  port: 8080
  mode: development          # development | production
  read_timeout: 10s
  write_timeout: 10s
  max_header_bytes: 1048576  # 1MB

cors:
  allowed_origins:
    - "http://localhost:3000"
    - "http://localhost:3001"
    - "https://navishabakery.com"
  allowed_methods:
    - "GET"
    - "POST"
    - "PUT"
    - "PATCH"
    - "DELETE"
    - "OPTIONS"
  allowed_headers:
    - "Authorization"
    - "Content-Type"
    - "Idempotency-Key"
  allow_credentials: true
  max_age: 3600

rate_limit:
  global:
    requests: 100
    window: 1m
  contact_form:
    requests: 5
    window: 5m
  auth:
    requests: 10
    window: 15m

pagination:
  default_limit: 20
  max_limit: 100

image:
  max_size_bytes: 5242880    # 5MB
  allowed_types:
    - "image/jpeg"
    - "image/png"
    - "image/webp"
  max_width: 2000
  max_height: 2000

menu:
  categories:
    - "food"
    - "beverage"
    - "cake"
    - "pastry"
    - "bread"

contact:
  duplicate_window: 5m       # prevent duplicate submission within 5 minutes

idempotency:
  expiry: 24h                # idempotency key expiry

jwt:
  expiry_hours: 1

order:
  number_prefix: "NV"        # e.g., NV-20260616-0001
  number_length: 4
```

---

## 3. System Architecture

### Deployment Strategy

**Phase 1: Local Development First**
- Frontend and backend run locally during development
- PostgreSQL hosted on Supabase (cloud) — accessible from local
- All integrations (Resend, R2, Google OAuth) work locally

**Phase 2: VPS Deployment**
- Single VPS (e.g., Hetzner, DigitalOcean, Vultr — $5-10/mo)
- Frontend: Next.js running via PM2 or Docker
- Backend: Go binary running via PM2 or Docker
- Reverse Proxy: Nginx (handles SSL, static files, routing)
- Both frontend and backend deployed to the same VPS

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTS                            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Customer     │  │  Admin       │  │  Telegram    │  │
│  │  (Browser/    │  │  (Browser)   │  │  (Bot API)   │  │
│  │   Mobile)     │  │              │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼──────────┘
          │                  │                  │
          ▼                  ▼                  │
┌─────────────────────────────────────┐        │
│         NGINX (VPS)                 │        │
│  SSL Termination + Reverse Proxy    │        │
│                                     │        │
│  navishabakery.com → Next.js :3000 │        │
│  api.navishabakery.com → Echo :8080│        │
└────────┬───────────────┬────────────┘        │
         │               │                    │
         ▼               ▼                    ▼
┌──────────────────┐  ┌──────────────────────────────────┐
│   NEXT.JS        │  │  GO BACKEND (Echo)                │
│   :3000          │  │  :8080                             │
│                  │  │                                    │
│  - Public Pages  │  │  ┌────────────┐ ┌──────────────┐ │
│  - Admin Dash.   │  │  │ REST API   │ │ Telegram Bot │ │
│  - BFF Layer     │  │  │            │ │ (Polling)    │ │
│                  │  │  │ /api/auth  │ │              │ │
│                  │  │  │ /api/menus │ │ /confirm     │ │
│                  │  │  │ /api/contact│ │ /complete    │ │
│                  │  │  │ /api/admins│ │ /cancel      │ │
│                  │  │  │ /api/orders│ │ /list        │ │
│                  │  │  └─────┬──────┘ └──────┬───────┘ │
│                  │  │        │                │         │
│                  │  │  ┌─────┴────────────────┴──────┐ │
│                  │  │  │    Domain Services           │ │
│                  │  │  │  - AuthService               │ │
│                  │  │  │  - MenuService               │ │
│                  │  │  │  - ContactService            │ │
│                  │  │  │  - AdminService              │ │
│                  │  │  │  - UserService (Phase 2)     │ │
│                  │  │  │  - OrderService (Phase 2)    │ │
│                  │  │  │  - EmailService              │ │
│                  │  │  │  - ImageService (R2)         │ │
│                  │  │  │  - TelegramService (Phase 2) │ │
│                  │  │  └────────────┬────────────────┘ │
│                  │  └───────────────┼──────────────────┘
└──────────────────┘                  │
                                      ▼
┌─────────────────────────────────────────────────────────┐
│                   POSTGRESQL (Supabase)                  │
│                                                         │
│  Tables:                                                │
│  - admins          (admin accounts)                     │
│  - users           (customer accounts, Phase 2)         │
│  - menus           (menu items, category as varchar)    │
│  - contacts        (contact form submissions)           │
│  - orders          (Phase 2: customer orders)           │
│  - order_items     (Phase 2: order line items)          │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   REDIS (Upstash)                        │
│                                                         │
│  - Idempotency keys (auto-expiry via TTL)               │
│  - Rate limiting counters                               │
│  - Contact duplicate detection cache                    │
│                                                         │
│  Graceful degradation: If Redis is unavailable,         │
│  idempotency checks are skipped (fail open).            │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                          │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Google OAuth │  │  Resend      │  │  Cloudflare  │  │
│  │  (Auth)       │  │  (Email)     │  │  R2 (Images) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Local Development Architecture

```
Terminal 1 (Frontend):          Terminal 2 (Backend):
cd frontend                     cd backend
npm run dev                     go run ./cmd/server
→ http://localhost:3000         → http://localhost:8080

Both connect to:
- Supabase PostgreSQL (cloud)
- Google OAuth (cloud)
- Resend (cloud)
- Cloudflare R2 (cloud)
```

---

## 4. Request Flows

### Customer Browsing Menu

```
1. Customer visits /menu on browser
2. Next.js server-side renders (SSR) or uses ISR
3. Next.js fetches menu data from Go backend API (/api/menus)
4. Go backend queries Supabase PostgreSQL for menu items
5. Go backend returns JSON response
6. Next.js renders menu page with data
7. Customer sees menu items with images, prices, discounts, categories
```

### Admin Managing Menu

```
1. Admin navigates to /dashboard/menu
2. Admin authenticates via Google OAuth
3. Backend verifies Google token, checks admins table, issues JWT (1-hour expiry)
4. Frontend stores JWT in httpOnly cookie
5. Admin creates/edits/deletes menu item (with idempotency key)
6. Frontend sends request to backend API with JWT + Idempotency-Key header
7. Backend validates JWT, checks idempotency, performs CRUD operation
8. Backend returns success/error response
9. Frontend updates UI accordingly
```

### Contact Form Submission (with Duplicate Prevention)

```
1. User fills contact form and submits
2. Frontend sends POST /api/contacts
3. Backend rate-limit check (5 requests per 5 min per IP)
4. Backend generates SHA-256 hash of (email + phone + message)
5. Backend checks contacts table for same hash within duplicate_window (5 min)
6. If duplicate found → return 429 DUPLICATE_SUBMISSION
7. If new → insert into contacts table
8. Return 201 success
```

---

## 5. Database Schema (Supabase PostgreSQL)

### Table: `admins`

```sql
CREATE TABLE admins (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    google_id   VARCHAR(255) UNIQUE,
    avatar_url  TEXT,
    role        VARCHAR(20) NOT NULL DEFAULT 'admin',   -- 'super_admin' | 'admin'
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_google_id ON admins(google_id);
```

### Table: `users` (Phase 2 — customer accounts)

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    name        VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    google_id   VARCHAR(255) UNIQUE,
    avatar_url  TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
```

### Table: `menus`

> **Design Decision:** Categories are NOT a separate table. They are defined as Go
> constants in `internal/domain/menu/constants.go` and stored as a `VARCHAR` column.
> This makes categories dynamically configurable without schema changes.

```sql
CREATE TABLE menus (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    category        VARCHAR(50) NOT NULL,              -- 'food', 'beverage', 'cake', 'pastry', 'bread'
    price           DECIMAL(10, 2) NOT NULL,
    discount        DECIMAL(5, 2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    discount_price  DECIMAL(10, 2),                    -- auto-calculated or manual override
    image_url       TEXT,                              -- Cloudflare R2 public URL
    image_key       VARCHAR(500),                      -- R2 object key for deletion
    is_available    BOOLEAN NOT NULL DEFAULT true,
    is_featured     BOOLEAN DEFAULT false,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_menus_category ON menus(category);
CREATE INDEX idx_menus_available ON menus(is_available);
CREATE INDEX idx_menus_featured ON menus(is_featured);
```

### Table: `contacts`

```sql
CREATE TABLE contacts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(50),
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    submission_hash VARCHAR(64),                       -- SHA-256 hash for duplicate detection
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_created ON contacts(created_at DESC);
CREATE INDEX idx_contacts_read ON contacts(is_read);
CREATE INDEX idx_contacts_hash ON contacts(submission_hash);
```

### Table: `orders` (Phase 2)

> **Design Decision:** `order_number` uses a formatted string (e.g., `NV-20260616-0001`)
> instead of a plain sequential integer to prevent predictability/enumeration attacks.
> Includes `user_id` as FK to `users` table for order history tracking.
> Includes `delivery_address` for delivery/pickup location.

```sql
CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
);

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(30) NOT NULL UNIQUE,   -- e.g., 'NV-20260616-0001'
    user_id             UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name       VARCHAR(255) NOT NULL,          -- denormalized for quick access
    customer_phone      VARCHAR(50),
    customer_email      VARCHAR(255),
    delivery_address    TEXT,                           -- delivery or pickup address
    delivery_notes      TEXT,                           -- landmark, gate code, etc.
    pickup_date         DATE,
    pickup_time         TIME,
    status              order_status NOT NULL DEFAULT 'pending',
    total_amount        DECIMAL(10, 2) NOT NULL DEFAULT 0,
    channel             VARCHAR(50) NOT NULL DEFAULT 'web',
    telegram_message_id INTEGER,                        -- for Telegram bot message updates
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_user ON orders(user_id);
```

### Table: `order_items` (Phase 2)

```sql
CREATE TABLE order_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_id     UUID NOT NULL REFERENCES menus(id) ON DELETE RESTRICT,
    quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price  DECIMAL(10, 2) NOT NULL,               -- price snapshot at time of order
    total_price DECIMAL(10, 2) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Idempotency & Caching (Redis — Upstash)

> **Design Decision:** Idempotency keys and rate limiting counters are stored in Redis
> instead of PostgreSQL. Benefits:
> 1. **Fast** — In-memory lookups (sub-millisecond)
> 2. **Built-in TTL** — Keys auto-expire, no cleanup job needed
> 3. **Lightweight** — No extra database tables for temporary data
> 4. **Graceful degradation** — If Redis is unavailable, skip idempotency checks (fail open)

**Redis Key Patterns:**
```
idempotency:{key}:{endpoint}    → { status_code, response }    TTL: 24h
ratelimit:{ip}:{window}         → { count }                     TTL: window duration
contact:dedup:{hash}            → 1                             TTL: 5m
```

**Idempotency Middleware Flow (Redis):**
```
1. Extract Idempotency-Key header
2. If missing on write op → return 400
3. Check Redis: GET idempotency:{key}:{endpoint}
4. If found → return cached response (same status + body)
5. If not found → proceed with request
6. After successful response → SET idempotency:{key}:{endpoint} with TTL 24h
```

**Fail-Open Strategy:**
```go
// If Redis is unavailable, skip idempotency check (allow request through)
if err := redis.Ping(); err != nil {
    log.Warn("Redis unavailable, skipping idempotency check")
    return next(c)
}
```

### Database Relationships

```
admins  (1) ───── (N) contacts      (admin reads/deletes)

users   (1) ───── (N) orders        (user's order history)
menus   (1) ───── (N) order_items   (menu items in orders)
orders  (1) ───── (N) order_items   (order line items)
```

---

## 6. API Design

### Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: `https://api.navishabakery.com/api`

### Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

For write operations (POST, PUT, PATCH, DELETE):
```
Idempotency-Key: <unique-uuid>
```

### Endpoint Design — Admin vs User Separation

> **Design Decision:** Admin and User authentication are separated to support
> future user registration/login independently.
> - Admin endpoints: `/api/admin/*`
> - User/customer endpoints: `/api/user/*`
> - Public endpoints: `/api/*` (no prefix)

### Endpoints — Admin Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/admin/auth/google` | Admin Google OAuth → JWT (1h expiry) | No |
| `GET` | `/api/admin/auth/me` | Get current admin profile | Admin JWT |
| `POST` | `/api/admin/auth/logout` | Clear admin JWT cookie | Admin JWT |

**POST /api/admin/auth/google**
```json
// Request
{
  "token": "google_oauth_id_token"
}

// Response 200
{
  "success": true,
  "data": {
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "name": "Admin Name",
      "avatar_url": "https://...",
      "role": "super_admin"
    },
    "token": "jwt_token",
    "expires_at": "2026-06-16T18:22:00Z"
  }
}

// Response 403 (not registered)
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Your email is not registered as an admin"
}
```

### Endpoints — User Authentication (Phase 2)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/user/auth/google` | User Google OAuth → JWT (1h expiry) | No |
| `GET` | `/api/user/auth/me` | Get current user profile | User JWT |
| `POST` | `/api/user/auth/logout` | Clear user JWT cookie | User JWT |

### Endpoints — Menu (Public)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/menus` | List all menu items | No |
| `GET` | `/api/menus/:id` | Get single menu item | No |
| `GET` | `/api/menus/featured` | Get featured menu items | No |

**GET /api/menus**
```json
// Query Parameters: ?category=cake&available=true&page=1&limit=20

// Response 200
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Chocolate Cake",
        "description": "Rich chocolate layer cake...",
        "category": "cake",
        "price": 250000,
        "discount": 10,
        "discount_price": 225000,
        "image_url": "https://images.navishabakery.com/...",
        "is_available": true,
        "is_featured": true,
        "created_at": "2026-06-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "total_pages": 3
    }
  }
}
```

### Endpoints — Menu Management (Admin)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/admin/menus` | Create menu item | Admin JWT + Idempotency-Key |
| `PUT` | `/api/admin/menus/:id` | Update menu item | Admin JWT + Idempotency-Key |
| `DELETE` | `/api/admin/menus/:id` | Delete menu item | Admin JWT + Idempotency-Key |

**POST /api/admin/menus**
```json
// Request (multipart/form-data for image upload)
// Headers: Idempotency-Key: <uuid>
{
  "name": "Chocolate Cake",
  "description": "Rich chocolate layer cake",
  "category": "cake",
  "price": 250000,
  "discount": 10,
  "is_available": true,
  "is_featured": false,
  "image": <binary file>
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Chocolate Cake",
    "category": "cake",
    ...
  }
}

// Response 409 (duplicate request)
{
  "success": false,
  "error": "IDEMPOTENCY_CONFLICT",
  "message": "A request with this Idempotency-Key has already been processed"
}
```

### Endpoints — Contact

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/contacts` | Submit contact form (public, rate-limited + dedup) | No |
| `GET` | `/api/admin/contacts` | List all inquiries | Admin JWT |
| `GET` | `/api/admin/contacts/:id` | Get single inquiry | Admin JWT |
| `PATCH` | `/api/admin/contacts/:id/read` | Mark as read/unread | Admin JWT + Idempotency-Key |
| `DELETE` | `/api/admin/contacts/:id` | Delete inquiry | Admin JWT + Idempotency-Key |

**POST /api/contacts**
```json
// Rate Limited: 5 requests per 5 minutes per IP
// Duplicate Detection: Same email+phone+message hash within 5 minutes → rejected

// Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+628123456789",
  "message": "I'd like to inquire about wedding cakes"
}

// Response 201
{
  "success": true,
  "message": "Your message has been sent successfully"
}

// Response 429 (duplicate)
{
  "success": false,
  "error": "DUPLICATE_SUBMISSION",
  "message": "You have already submitted a similar message recently. Please wait before submitting again."
}
```

### Endpoints — Admin User Management

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/admin/admins` | List all admins | Super Admin JWT |
| `POST` | `/api/admin/admins` | Add new admin + send email | Super Admin JWT + Idempotency-Key |
| `DELETE` | `/api/admin/admins/:id` | Remove admin | Super Admin JWT + Idempotency-Key |

**POST /api/admin/admins**
```json
// Headers: Idempotency-Key: <uuid>

// Request
{
  "email": "newadmin@example.com",
  "name": "New Admin"
}

// Response 201
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "newadmin@example.com",
    "name": "New Admin",
    "role": "admin",
    "created_at": "..."
  },
  "message": "Admin added successfully. Welcome email sent."
}
```

### Endpoints — Orders (Phase 2)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/user/orders` | Create new order | User JWT (optional for guest) |
| `GET` | `/api/user/orders` | List my orders | User JWT |
| `GET` | `/api/user/orders/:id` | Get my order details | User JWT |
| `GET` | `/api/admin/orders` | List all orders | Admin JWT |
| `GET` | `/api/admin/orders/:id` | Get order details | Admin JWT |
| `PATCH` | `/api/admin/orders/:id/status` | Update order status | Admin JWT + Idempotency-Key |
| `GET` | `/api/admin/orders/summary` | Transaction summary | Admin JWT |

### API Response Format (Standard)

```json
// Success
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}

// Error
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable description"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `DUPLICATE_SUBMISSION` | 429 | Duplicate contact form submission |
| `IDEMPOTENCY_CONFLICT` | 409 | Idempotency key already used |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 7. Security Design

### DDoS & Rate Limiting

| Layer | Protection | Detail |
|---|---|---|
| **Nginx** | Connection limiting | `limit_conn_zone`, `limit_req_zone` at reverse proxy level |
| **Echo Middleware** | Per-IP rate limiting | Configurable per endpoint via config.yaml |
| **Global** | 100 req/min/IP | Applied to all API endpoints |
| **Contact Form** | 5 req/5min/IP | Prevent spam submissions |
| **Auth** | 10 req/15min/IP | Prevent brute force on login |

### SQL Injection Prevention

| Measure | Implementation |
|---|---|
| **Parameterized Queries** | All queries use `pgx` named parameters, never string concatenation |
| **Input Validation** | Echo middleware validates all inputs before reaching handlers |
| **ORM Alternative** | Consider `sqlc` for type-safe SQL queries (compile-time checked) |
| **Least Privilege** | Database user has minimal required permissions |

### Idempotency for Write Operations

| Aspect | Detail |
|---|---|
| **Header** | `Idempotency-Key: <uuid-v4>` required on all POST, PUT, PATCH, DELETE |
| **Storage** | Redis (Upstash) — key pattern: `idempotency:{key}:{endpoint}` |
| **Expiry** | 24 hours via Redis TTL (auto-cleanup, no background job) |
| **Behavior** | If key exists → return cached response with same status code |
| **Fail-Open** | If Redis is unavailable → skip check, allow request through |
| **Graceful** | Redis failure is logged as warning, does not block API requests |

### Input Sanitization

| Input Type | Sanitization |
|---|---|
| **Strings** | Trim whitespace, escape HTML entities, max length enforcement |
| **Email** | RFC 5322 format validation |
| **Phone** | Strip non-numeric characters, validate format |
| **Numbers** | Range validation, type checking |
| **Files** | MIME type verification (magic bytes, not just extension), size limit |
| **SQL** | Parameterized queries only (handled by pgx driver) |
| **XSS** | Output encoding in frontend (React auto-escapes), CSP headers |

### Additional Security Measures

| Area | Measure |
|---|---|
| **Authentication** | Google OAuth 2.0 (no password storage), JWT in httpOnly cookies |
| **JWT Expiry** | 1 hour (configurable), no refresh token — re-login required |
| **Authorization** | Role-based: `super_admin` vs `admin`, middleware checks on all protected routes |
| **CORS** | Allow only configured origins (localhost for dev, domain for prod) |
| **CSRF** | SameSite=Strict cookies + custom header check |
| **HTTPS** | Enforced via Nginx in production |
| **Security Headers** | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, CSP, HSTS |
| **Secrets** | All secrets in .env via godotenv, never in code or Git |
| **Logging** | Structured logging without sensitive data |

---

## 8. Frontend Architecture

### Project Structure (Next.js — Domain-Based Modular)

```
frontend/
├── app/                              # Next.js App Router
│   ├── (public)/                     # Public route group
│   │   ├── layout.tsx                # Public layout (header + footer)
│   │   ├── page.tsx                  # Landing page (/)
│   │   ├── menu/
│   │   │   └── page.tsx              # Menu page (/menu)
│   │   └── contact/
│   │       └── page.tsx              # Contact Us page (/contact)
│   │
│   ├── (dashboard)/                  # Admin route group
│   │   ├── layout.tsx                # Dashboard layout (sidebar)
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard home (/dashboard)
│   │   │   ├── menu/
│   │   │   │   ├── page.tsx          # Menu list (/dashboard/menu)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Add menu (/dashboard/menu/new)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Edit menu (/dashboard/menu/:id)
│   │   │   ├── admins/
│   │   │   │   └── page.tsx          # Admin management (/dashboard/admins)
│   │   │   └── contacts/
│   │   │       └── page.tsx          # Contact inquiries (/dashboard/contacts)
│   │   │
│   │   └── login/
│   │       └── page.tsx              # Login page (/login)
│   │
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles + Tailwind
│   └── not-found.tsx                 # 404 page
│
├── components/
│   ├── ui/                           # Shared UI primitives (design system)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx
│   │   ├── DataTable.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── Pagination.tsx
│   │   └── Toast.tsx
│   │
│   ├── landing/                      # Domain: Landing page
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── FeaturedMenu.tsx
│   │   ├── Location.tsx
│   │   └── ContactInfo.tsx
│   │
│   ├── menu/                         # Domain: Menu
│   │   ├── MenuCard.tsx
│   │   ├── MenuGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── PriceDisplay.tsx
│   │
│   ├── contact/                      # Domain: Contact
│   │   ├── ContactForm.tsx
│   │   ├── MapEmbed.tsx
│   │   └── OperatingHours.tsx
│   │
│   ├── dashboard/                    # Domain: Admin Dashboard
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MenuTable.tsx
│   │   ├── MenuForm.tsx
│   │   ├── AdminTable.tsx
│   │   ├── ContactTable.tsx
│   │   └── StatsCard.tsx
│   │
│   └── layout/                       # Domain: Layout
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── MobileNav.tsx
│       └── GoogleAuthProvider.tsx
│
├── lib/                              # Shared utilities
│   ├── api.ts                        # API client (fetch wrapper with auth)
│   ├── auth.ts                       # Auth utilities
│   ├── constants.ts                  # App constants
│   ├── validations.ts                # Zod schemas for form validation
│   └── utils.ts                      # Helper functions (cn, formatCurrency, etc.)
│
├── hooks/                            # Shared React hooks
│   ├── useAuth.ts                    # Authentication hook
│   ├── useMenus.ts                   # Menu data fetching
│   └── usePagination.ts              # Pagination hook
│
├── types/                            # TypeScript type definitions
│   ├── api.ts                        # API response types
│   ├── menu.ts                       # Menu domain types
│   ├── contact.ts                    # Contact domain types
│   ├── admin.ts                      # Admin domain types
│   └── index.ts                      # Re-exports
│
├── tailwind.config.ts                # Tailwind CSS with custom theme
├── next.config.ts                    # Next.js configuration
├── package.json
└── tsconfig.json
```

### Frontend Routing

| Route | Page | Auth | Description |
|---|---|---|---|
| `/` | Landing Page | No | Public homepage |
| `/menu` | Menu Page | No | Public menu listing |
| `/contact` | Contact Us | No | Public contact form |
| `/login` | Login | No | Google OAuth login |
| `/dashboard` | Dashboard Home | Yes | Admin overview |
| `/dashboard/menu` | Menu Management | Yes | CRUD menu items |
| `/dashboard/menu/new` | Add Menu | Yes | Create new menu item |
| `/dashboard/menu/:id` | Edit Menu | Yes | Edit existing menu item |
| `/dashboard/admins` | Admin Management | Yes | Manage admin users (super_admin) |
| `/dashboard/contacts` | Contact Inquiries | Yes | View contact submissions |

### Frontend Key Libraries

| Library | Purpose |
|---|---|
| `next` | Framework |
| `react` | UI library |
| `tailwindcss` | Styling |
| `@tanstack/react-query` | Server state management / data fetching / caching |
| `react-hook-form` + `zod` | Form handling + validation |
| `@react-oauth/google` | Google OAuth client |
| `lucide-react` | Icons |
| `next-seo` or `next/head` | SEO meta tags |
| `framer-motion` | Animations |
| `ky` or `axios` | HTTP client |

### Frontend AI Agent Instructions

> File: `docs/ai_agent/FRONTEND_INSTRUCTIONS.md`

This file should contain:
- Project structure overview for AI agents
- Component naming conventions (PascalCase, domain-grouped)
- State management patterns (React Query for server state, useState for local)
- Form patterns (react-hook-form + zod validation)
- API calling patterns (centralized api.ts client)
- Styling conventions (Tailwind, no inline styles, cn() utility)
- File naming conventions (kebab-case for files, PascalCase for components)

---

## 9. Backend Architecture

### Project Structure (Go + Echo — Domain-Based Modular)

```
backend/
├── cmd/
│   └── server/
│       └── main.go                       # Entry point: load config, init DB, register routes
│
├── internal/
│   ├── config/
│   │   ├── config.go                     # Config loading (godotenv + config.yaml)
│   │   └── types.go                      # Config struct definitions
│   │
│   ├── database/
│   │   ├── database.go                   # PostgreSQL connection (pgx pool)
│   │   └── migrations/
│   │       ├── 001_create_admins.sql
│   │       ├── 002_create_users.sql
│   │       ├── 003_create_menus.sql
│   │       ├── 004_create_contacts.sql
│   │       ├── 005_create_orders.sql
│   │       └── 006_create_idempotency_keys.sql
│   │
│   ├── middleware/
│   │   ├── auth.go                       # JWT authentication (admin + user variants)
│   │   ├── cors.go                       # CORS from config.yaml
│   │   ├── ratelimit.go                  # Rate limiting from config.yaml
│   │   ├── idempotency.go                # Idempotency key checker
│   │   ├── logger.go                     # Request logging
│   │   ├── security.go                   # Security headers (X-Frame-Options, CSP, etc.)
│   │   └── sanitize.go                   # Input sanitization middleware
│   │
│   ├── domain/                           # Domain layer (business logic + models)
│   │   ├── menu/
│   │   │   ├── model.go                  # Menu struct/model
│   │   │   ├── repository.go             # Menu database operations
│   │   │   ├── service.go                # Menu business logic
│   │   │   ├── handler.go                # Menu HTTP handlers (Echo)
│   │   │   ├── constants.go              # Category constants (food, beverage, cake, etc.)
│   │   │   └── dto.go                    # Data Transfer Objects (request/response)
│   │   │
│   │   ├── contact/
│   │   │   ├── model.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   ├── handler.go
│   │   │   └── dto.go
│   │   │
│   │   ├── admin/
│   │   │   ├── model.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   ├── handler.go
│   │   │   └── dto.go
│   │   │
│   │   ├── auth/
│   │   │   ├── model.go
│   │   │   ├── service.go                # Google OAuth verification + JWT generation
│   │   │   ├── handler.go                # Auth HTTP handlers
│   │   │   └── dto.go
│   │   │
│   │   ├── user/                         # Phase 2
│   │   │   ├── model.go
│   │   │   ├── repository.go
│   │   │   ├── service.go
│   │   │   ├── handler.go
│   │   │   └── dto.go
│   │   │
│   │   └── order/                        # Phase 2
│   │       ├── model.go
│   │       ├── repository.go
│   │       ├── service.go
│   │       ├── handler.go
│   │       ├── dto.go
│   │       └── number.go                 # Order number generation (NV-YYYYMMDD-XXXX)
│   │
│   ├── services/                         # Cross-cutting services
│   │   ├── email/
│   │   │   └── resend.go                 # Resend email integration
│   │   ├── image/
│   │   │   └── r2.go                     # Cloudflare R2 upload/delete
│   │   └── telegram/                     # Phase 2
│   │       ├── bot.go                    # Bot initialization
│   │       ├── handlers.go               # Bot command handlers
│   │       └── messages.go               # Message templates
│   │
│   └── pkg/                              # Shared packages
│       ├── jwt/
│       │   └── jwt.go                    # JWT generation/validation (1h expiry)
│       ├── google/
│       │   └── oauth.go                  # Google OAuth token verification
│       ├── hash/
│       │   └── hash.go                   # SHA-256 hashing (for contact dedup)
│       └── validator/
│           └── validator.go              # Input validation helpers
│
├── config.yaml                           # Static configuration
├── .env                                  # Secrets (gitignored)
├── go.mod
├── go.sum
├── Makefile
├── Dockerfile
└── .gitignore
```

### Backend Domain Pattern (Per Domain)

Each domain follows this structure:

```
internal/domain/{domain}/
├── model.go          # Struct definitions, database models
├── dto.go            # Request/Response DTOs with validation tags
├── repository.go     # Database operations (pure SQL, no business logic)
├── service.go        # Business logic (calls repository, external services)
├── handler.go        # HTTP handlers (Echo context, request parsing, response)
└── constants.go      # Domain-specific constants (optional)
```

**Dependency Flow:**
```
Handler → Service → Repository → Database
  ↑          ↑
  │          └── External Services (email, image, telegram)
  └── Middleware (auth, rate limit, idempotency)
```

### Backend Key Libraries

| Library | Purpose |
|---|---|
| `github.com/labstack/echo/v4` | HTTP framework (Echo) |
| `github.com/jackc/pgx/v5` | PostgreSQL driver |
| `github.com/golang-jwt/jwt/v5` | JWT handling |
| `github.com/labstack/echo/v4/middleware` | Echo built-in middleware |
| `github.com/rs/cors` | CORS (or Echo middleware) |
| `github.com/go-telegram-bot-api/telegram-bot-api/v5` | Telegram bot (Phase 2) |
| `github.com/cloudflare/cloudflare-go` or AWS SDK R2 | Cloudflare R2 upload |
| `github.com/resend/resend-go/v2` | Email sending |
| `github.com/joho/godotenv` | .env loading |
| `gopkg.in/yaml.v3` | config.yaml parsing |
| `github.com/stretchr/testify` | Testing |

### Backend Conventions

- **Layered Architecture**: Handler → Service → Repository → Database
- **Error Handling**: Structured error responses with domain-specific error types
- **Validation**: Echo binding + custom validation tags in DTOs
- **Logging**: Structured JSON logging with request ID and user ID tracking
- **Testing**: Unit tests for services, integration tests for handlers
- **Naming**: Go standard conventions (unexported by default, exported for interfaces)

### Backend AI Agent Instructions

> File: `docs/ai_agent/BACKEND_INSTRUCTIONS.md`

This file should contain:
- Project structure overview for AI agents
- Domain pattern explanation (model → dto → repository → service → handler)
- Coding conventions (error handling, naming, package organization)
- Database query patterns (pgx named parameters)
- Middleware patterns (how to add new middleware)
- Testing patterns (table-driven tests, mock repository)
- How to add a new domain (step-by-step guide)

---

## 10. Authentication Design

### Separate Admin vs User Auth

> **Design Decision:** Admin and User authentication are kept separate because:
> 1. Admin accounts are manually whitelisted (not self-registration)
> 2. User accounts may support self-registration in the future
> 3. Different JWT claims and middleware for admin vs user
> 4. Different route prefixes: `/api/admin/*` vs `/api/user/*`
> 5. Easier to evolve independently

### JWT Token Structure

**Admin JWT:**
```json
{
  "sub": "admin_uuid",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "super_admin",
  "type": "admin",
  "iat": 1750000000,
  "exp": 1750003600
}
```

**User JWT (Phase 2):**
```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "name": "User Name",
  "type": "user",
  "iat": 1750000000,
  "exp": 1750003600
}
```

### JWT Configuration

| Setting | Value |
|---|---|
| **Expiry** | 1 hour (configurable via config.yaml) |
| **Storage** | httpOnly, secure, SameSite=Strict cookie |
| **Refresh** | No refresh token — re-authentication required |
| **Secret** | 32+ character random string in .env |

### Admin Authentication Flow

```
1. Admin clicks "Sign in with Google" on /login
2. Google OAuth popup → user selects account → consents
3. Google returns ID token to frontend
4. Frontend sends POST /api/admin/auth/google { token: id_token }
5. Backend:
   a. Verify Google ID token using Google's public keys
   b. Extract email from verified token
   c. Check admins table: email must exist AND is_active = true
   d. If not found → 403 UNAUTHORIZED
   e. If found → generate JWT with admin claims (1h expiry)
   f. Set JWT in httpOnly cookie
   g. Return admin profile + token
6. Frontend stores JWT, redirects to /dashboard
7. Subsequent requests include JWT in cookie → middleware validates
```

### User Authentication Flow (Phase 2)

```
1. Same Google OAuth flow as admin
2. Backend checks users table instead of admins table
3. If user not found → auto-create user account (self-registration)
4. Generate JWT with user claims (1h expiry)
```

---

## 11. Image Upload Design (Cloudflare R2)

### Upload Flow

```
Admin uploads image via dashboard form
        ↓
Frontend sends multipart/form-data to backend
        ↓
Backend validates file:
  - MIME type check (magic bytes, not just extension)
  - Size limit (5MB from config.yaml)
  - Image dimensions (max 2000x2000)
        ↓
Backend uploads to Cloudflare R2:
  - Object key: menus/{uuid}/{original_filename}
  - Content-Type: from validated MIME type
        ↓
R2 returns:
  - Public URL: https://images.navishabakery.com/menus/{uuid}/{filename}
  - Object key: menus/{uuid}/{filename}
        ↓
Backend stores image_url + image_key in menus table
        ↓
Image served via Cloudflare CDN (optimized, cached)
```

### Delete Flow (on menu item deletion)

```
1. Read image_key from menus table
2. Delete object from R2 using image_key
3. Delete menu record from database
```

---

## 12. Telegram Bot Integration (Phase 2)

### Bot Commands

| Command | Description | Example |
|---|---|---|
| `/start` | Welcome message + instructions | `/start` |
| `/list` | List all pending orders | `/list` |
| `/confirm <order_id>` | Mark order as confirmed | `/confirm NV-20260616-0001` |
| `/complete <order_id>` | Mark order as completed | `/complete NV-20260616-0001` |
| `/cancel <order_id>` | Cancel order | `/cancel NV-20260616-0001` |
| `/info <order_id>` | View order details | `/info NV-20260616-0001` |

### Notification Message Format

```
🔔 New Order #NV-20260616-0001

👤 Customer: John Doe
📱 Phone: +628123456789

🛒 Items:
  • Chocolate Cake x2 — Rp 450,000
  • Croissant x3 — Rp 75,000

💰 Total: Rp 525,000
📍 Delivery: Jl. Sudirman No. 123, Jakarta
📅 Pickup: 2026-06-20, 10:00 AM
📝 Notes: Extra candles please

⏰ Ordered at: 16:22 WIB

─────────────────
Reply with:
/confirm NV-20260616-0001
/complete NV-20260616-0001
/cancel NV-20260616-0001
```

### Order Number Format

> **Security Decision:** Order numbers use format `NV-YYYYMMDD-XXXX` where XXXX is
> a daily-resetting counter. This provides:
> - Human-readable format for Telegram communication
> - Date-based prefix makes enumeration harder (attacker needs to know both date AND sequence)
> - Daily counter resets, limiting exposure window
> - UUID as primary key prevents direct DB enumeration

```
NV-20260616-0001  ← 1st order on June 16, 2026
NV-20260616-0002  ← 2nd order on June 16, 2026
NV-20260617-0001  ← 1st order on June 17, 2026 (counter resets)
```

### Implementation

| Aspect | Detail |
|---|---|
| **Library** | `go-telegram-bot-api/telegram-bot-api/v5` |
| **Mode** | Long polling (simple, no HTTPS needed) |
| **Bot Token** | Environment variable `TELEGRAM_BOT_TOKEN` |
| **Admin Chat ID** | Environment variable `TELEGRAM_ADMIN_CHAT_ID` |
| **DB Sync** | All bot actions trigger database updates via domain services |
| **Error Handling** | Invalid commands return helpful usage messages |
| **Order Lookup** | Uses `order_number` (NV-YYYYMMDD-XXXX) for user-friendly lookups |

---

## 13. Frontend & Backend AI Agent Files

### Purpose

To reduce context window usage, create dedicated instruction files that AI agents can
read to understand project-specific patterns without needing to parse the entire codebase.

### Files to Create

| File | Purpose |
|---|---|
| `docs/ai_agent/FRONTEND_INSTRUCTIONS.md` | Frontend project patterns, conventions, and how-to guides |
| `docs/ai_agent/BACKEND_INSTRUCTIONS.md` | Backend project patterns, conventions, and how-to guides |
| `docs/ai_agent/DEPLOYMENT.md` | Deployment guide for VPS |

### FRONTEND_INSTRUCTIONS.md Contents

```markdown
# Navisha Bakery — Frontend AI Agent Instructions

## Tech Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Query (TanStack Query)
- react-hook-form + zod

## Project Structure
- `app/` — Next.js App Router pages (route-based)
- `components/ui/` — Shared UI primitives (Button, Card, Input, etc.)
- `components/{domain}/` — Domain-specific components (landing, menu, contact, dashboard)
- `lib/` — Utilities, API client, constants
- `hooks/` — Custom React hooks
- `types/` — TypeScript type definitions

## Conventions
- Components: PascalCase filenames, named exports
- Utilities: camelCase filenames, named exports
- Types: PascalCase, defined in types/ directory
- Styling: Tailwind classes only, use cn() utility for conditional classes
- State: React Query for server state, useState/useReducer for local state
- Forms: react-hook-form with zod schemas (defined in lib/validations.ts)
- API Calls: Always use lib/api.ts wrapper (handles auth, errors)

## Adding a New Page
1. Create page.tsx in appropriate app/ route directory
2. Create components in components/{domain}/
3. Add types in types/{domain}.ts
4. Add API hooks in hooks/

## Adding a New Dashboard Feature
1. Create route in app/(dashboard)/dashboard/{feature}/
2. Create table component in components/dashboard/
3. Create form component with react-hook-form + zod
4. Use React Query mutations for create/update/delete
```

### BACKEND_INSTRUCTIONS.md Contents

```markdown
# Navisha Bakery — Backend AI Agent Instructions

## Tech Stack
- Go 1.25+
- Echo v4 (HTTP framework)
- pgx v5 (PostgreSQL driver)
- godotenv (.env loading)
- config.yaml (static config)

## Domain Pattern
Each domain in internal/domain/{name}/:
- model.go — Struct definitions
- dto.go — Request/Response DTOs with validation
- repository.go — Database queries (parameterized SQL)
- service.go — Business logic
- handler.go — Echo HTTP handlers

## Conventions
- All SQL queries use pgx named parameters ($1, $2, etc.)
- Error responses use standard format: { success: false, error: "CODE", message: "..." }
- All write endpoints require Idempotency-Key header
- Auth middleware differentiates admin vs user via JWT "type" claim
- Config loaded from .env (secrets) + config.yaml (static)

## Adding a New Domain
1. Create internal/domain/{name}/ directory
2. Add model.go, dto.go, repository.go, service.go, handler.go
3. Register routes in cmd/server/main.go
4. Add migration SQL in internal/database/migrations/
5. Add middleware as needed (auth, idempotency, rate limit)

## Security Checklist for Handlers
- [ ] Input validation (Echo binding + custom validation)
- [ ] SQL injection prevention (parameterized queries only)
- [ ] Auth check (admin or user middleware)
- [ ] Idempotency check (for write operations)
- [ ] Rate limit applied
```

---

## 14. Environment Variables Summary

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Navisha Bakery
```

### Backend (.env)

```env
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=navishabakery-images
R2_PUBLIC_URL=https://images.navishabakery.com
RESEND_API_KEY=...
RESEND_FROM_EMAIL=notifications@navishabakery.com
TELEGRAM_BOT_TOKEN=...        # Phase 2
TELEGRAM_ADMIN_CHAT_ID=...    # Phase 2
SUPER_ADMIN_EMAIL=owner@navishabakery.com
```

---

## 15. Hosting & Deployment

### Phase 1: Local Development

| Component | Setup |
|---|---|
| **Frontend** | `npm run dev` → http://localhost:3000 |
| **Backend** | `go run ./cmd/server` → http://localhost:8080 |
| **Database** | Supabase (cloud) — connection string in .env |
| **Images** | Cloudflare R2 (cloud) — works from local |

### Phase 2: VPS Deployment

| Component | Setup |
|---|---|
| **VPS Provider** | Hetzner / DigitalOcean / Vultr ($5-10/mo) |
| **OS** | Ubuntu 22.04 LTS |
| **Process Manager** | PM2 (Node.js) + PM2 or systemd (Go) |
| **Reverse Proxy** | Nginx |
| **SSL** | Let's Encrypt via Certbot |
| **Domain** | navishabakery.com (DNS → VPS IP) |

**Nginx Configuration:**
```nginx
# Frontend
server {
    listen 443 ssl http2;
    server_name navishabakery.com;

    ssl_certificate /etc/letsencrypt/live/navishabakery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/navishabakery.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.navishabakery.com;

    ssl_certificate /etc/letsencrypt/live/navishabakery.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/navishabakery.com/privkey.pem;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    location / {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 16. Testing Strategy

### Frontend

| Type | Tool | Scope |
|---|---|---|
| **Unit Tests** | Vitest + React Testing Library | Components, hooks, utilities |
| **E2E Tests** | Playwright (Phase 2) | Critical user flows |

### Backend

| Type | Tool | Scope |
|---|---|---|
| **Unit Tests** | `testing` + `testify` | Services, utilities |
| **Integration Tests** | `testify` + test DB | Handlers with real DB |
| **API Tests** | `httptest` package | HTTP handler testing |

### CI/CD (GitHub Actions)

```yaml
on: [push, pull_request]
jobs:
  test-backend:
    - go test ./...
  test-frontend:
    - npm test
  lint:
    - golangci-lint run
    - npm run lint
```

---

## 17. Project Root Structure

```
bakery/
├── frontend/                    # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   ├── types/
│   ├── public/
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # Go application
│   ├── cmd/
│   ├── internal/
│   ├── pkg/
│   ├── config.yaml
│   ├── go.mod
│   ├── go.sum
│   ├── Makefile
│   └── Dockerfile
│
├── docs/                        # Documentation
│   └── ai_agent/
│       ├── PRD.md
│       ├── TRD.md
│       ├── TASKS.md
│       ├── FRONTEND_INSTRUCTIONS.md
│       ├── BACKEND_INSTRUCTIONS.md
│       └── DEPLOYMENT.md
│
├── .gitignore
├── README.md
└── docker-compose.yml           # Optional: local dev setup