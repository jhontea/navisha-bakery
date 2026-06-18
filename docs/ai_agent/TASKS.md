# Task Breakdown
## Navisha Bakery — Phase 1 (MVP)

> This document contains all tasks for Phase 1 MVP development.
> Tasks are organized by domain (Frontend / Backend) and ordered by dependency.

---

## Legend

| Symbol | Meaning |
|---|---|
| `P0` | Must-have (blocker) |
| `P1` | Should-have |
| `P2` | Nice-to-have |
| `[F]` | Frontend task |
| `[B]` | Backend task |
| `[D]` | DevOps / Setup task |
| `[AI]` | AI Agent file creation |

---

## Phase 1.0 — Project Setup & Infrastructure

### D-01: Initialize Git Repository
- **Priority**: P0
- **Description**: Initialize git repo with `.gitignore`, README.md, branch strategy
- **Acceptance Criteria**:
  - [x] Git repo initialized
  - [x] `.gitignore` covers Go, Node.js, .env, IDE files
  - [x] README.md with project overview
  - [x] Branch: `main` (production), `develop` (integration)

### D-02: Frontend Project Scaffolding
- **Priority**: P0
- **Description**: Create Next.js project with TypeScript, Tailwind CSS, App Router
- **Acceptance Criteria**:
  - [x] `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir=false`
  - [x] Configure `tailwind.config.ts` with custom warm color palette (cream, brown, pastel-pink, gold, terracotta)
  - [x] Configure `next/font` for Playfair Display (headings) + Inter (body)
  - [x] Set up `lib/api.ts` (API client with auth headers)
  - [x] Set up `lib/utils.ts` (cn() helper, formatCurrency, etc.)
  - [x] Create `.env.local` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - [x] Verify `npm run dev` works on http://localhost:3000

### D-03: Backend Project Scaffolding
- **Priority**: P0
- **Description**: Create Go project with Echo, pgx, godotenv, config.yaml
- **Acceptance Criteria**:
  - [x] `go mod init github.com/navishabakery/backend`
  - [x] Create `cmd/server/main.go` entry point
  - [x] Set up Echo with basic health check endpoint (`GET /api/health`)
  - [x] Set up `config.yaml` with default values
  - [x] Set up `.env` with `DATABASE_URL`, `JWT_SECRET`, etc.
  - [x] Set up config loading: godotenv for `.env` + yaml parsing for `config.yaml`
  - [x] Create `Makefile` with common commands (run, build, test, migrate)
  - [x] Verify `go run ./cmd/server` works on http://localhost:8080

### D-04: Database Setup (Supabase)
- **Priority**: P0
- **Description**: Create Supabase project, configure PostgreSQL, run initial migrations
- **Acceptance Criteria**:
  - [x] Supabase project created
  - [x] Connection string obtained and added to `.env`
  - [x] Migration files created in `backend/internal/database/migrations/`
  - [x] `admins` table migration
  - [x] `menus` table migration (with category as varchar)
  - [x] `contacts` table migration
  - [x] `idempotency_keys` table migration
  - [x] Database connection working from Go backend
  - [x] Seed first super admin in `admins` table

### D-05: Database Connection Module
- **Priority**: P0
- **Description**: Create PostgreSQL connection pool using pgx
- **Acceptance Criteria**:
  - [x] `internal/database/database.go` with connection pool initialization
  - [x] Health check function (ping database)
  - [x] Graceful connection close on shutdown
  - [x] Connection pool settings configurable

### AI-01: Create AI Agent Instruction Files
- **Priority**: P1
- **Description**: Create FRONTEND_INSTRUCTIONS.md and BACKEND_INSTRUCTIONS.md for AI agent context
- **Acceptance Criteria**:
  - [x] `docs/ai_agent/FRONTEND_INSTRUCTIONS.md` created
  - [x] `docs/ai_agent/BACKEND_INSTRUCTIONS.md` created
  - [x] Both files contain project structure, conventions, and patterns

---

## Phase 1.1 — Authentication (Admin)

### B-01: Admin Domain — Model & DTO
- **Priority**: P0
- **Description**: Create admin model and DTOs
- **Acceptance Criteria**:
  - [x] `internal/domain/admin/model.go` — Admin struct matching DB schema
  - [x] `internal/domain/admin/dto.go` — CreateAdminRequest, AdminResponse, UpdateAdminRequest
  - [x] Validation tags on all DTOs

### B-02: Admin Repository
- **Priority**: P0
- **Description**: Admin database operations
- **Acceptance Criteria**:
  - [x] `internal/domain/admin/repository.go`
  - [x] `FindByEmail(email)` — used during auth
  - [x] `FindByID(id)` — used for JWT validation
  - [x] `Create(admin)` — add new admin
  - [x] `Delete(id)` — remove admin
  - [x] `ListAll()` — list all admins
  - [x] All queries use pgx parameterized queries

### B-03: Google OAuth Verification Package
- **Priority**: P0
- **Description**: Package to verify Google OAuth ID tokens
- **Acceptance Criteria**:
  - [x] `internal/pkg/google/oauth.go`
  - [x] Verify ID token using Google's public keys
  - [x] Extract email, name, avatar from verified token
  - [x] Handle token expiry and invalid tokens

### B-04: JWT Package
- **Priority**: P0
- **Description**: JWT generation and validation with 1-hour expiry
- **Acceptance Criteria**:
  - [x] `internal/pkg/jwt/jwt.go`
  - [x] Generate JWT with claims: sub, email, name, role, type="admin", iat, exp
  - [x] Validate JWT and extract claims
  - [x] Expiry: 1 hour (configurable from config.yaml)
  - [x] Use HS256 with secret from .env

### B-05: Auth Domain — Service & Handler
- **Priority**: P0
- **Description**: Admin authentication endpoints
- **Acceptance Criteria**:
  - [x] `internal/domain/auth/service.go` — `LoginWithGoogle(idToken)` flow
  - [x] `internal/domain/auth/handler.go`
  - [x] `POST /api/admin/auth/google` — exchange Google token for JWT
  - [x] `GET /api/admin/auth/me` — get current admin profile
  - [x] `POST /api/admin/auth/logout` — clear JWT cookie
  - [x] JWT set as httpOnly, secure, SameSite=Strict cookie
  - [x] Non-registered emails return 403 UNAUTHORIZED

### B-06: Auth Middleware
- **Priority**: P0
- **Description**: JWT authentication middleware for Echo
- **Acceptance Criteria**:
  - [x] `internal/middleware/auth.go`
  - [x] Extract JWT from cookie or Authorization header
  - [x] Validate JWT and inject claims into Echo context
  - [x] Separate functions: `AdminAuth()` and `UserAuth()` (Phase 2)
  - [x] Return 401 UNAUTHORIZED for invalid/missing tokens

### B-07: Seed Super Admin
- **Priority**: P0
- **Description**: Create initial super admin record
- **Acceptance Criteria**:
  - [x] Migration or seed script inserts first admin from `SUPER_ADMIN_EMAIL` env
  - [x] Role set to `super_admin`
  - [x] Only this admin can manage other admins initially

---

## Phase 1.2 — Menu Management

### B-08: Menu Category Constants
- **Priority**: P0
- **Description**: Define menu categories as Go constants
- **Acceptance Criteria**:
  - [x] `internal/domain/menu/constants.go`
  - [x] Constants: `Food`, `Beverage`, `Cake`, `Pastry`, `Bread`
  - [x] Helper functions: `IsValidCategory(string) bool`, `AllCategories() []string`
  - [x] Categories match `config.yaml` menu.categories

### B-09: Menu Domain — Model & DTO
- **Priority**: P0
- **Description**: Menu model and DTOs
- **Acceptance Criteria**:
  - [x] `internal/domain/menu/model.go` — Menu struct (category as string)
  - [x] `internal/domain/menu/dto.go` — CreateMenuRequest, UpdateMenuRequest, MenuResponse, MenuListResponse
  - [x] Validation: name required, price > 0, category in allowed list, discount 0-100
  - [x] Auto-calculate `discount_price` if discount provided and discount_price not set

### B-10: Menu Repository
- **Priority**: P0
- **Description**: Menu database operations
- **Acceptance Criteria**:
  - [x] `internal/domain/menu/repository.go`
  - [x] `List(category, available, page, limit)` — with filtering and pagination
  - [x] `FindByID(id)` — single menu item
  - [x] `ListFeatured(limit)` — featured items for landing page
  - [x] `Create(menu)` — insert new menu
  - [x] `Update(menu)` — update existing menu
  - [x] `Delete(id)` — delete menu item
  - [x] `Count(category, available)` — for pagination

### B-11: Menu Service
- **Priority**: P0
- **Description**: Menu business logic
- **Acceptance Criteria**:
  - [x] `internal/domain/menu/service.go`
  - [x] All CRUD operations with business validation
  - [x] Calculate discount_price automatically when discount is set
  - [x] Validate category against constants

### B-12: Menu Handlers (Public + Admin)
- **Priority**: P0
- **Description**: Menu HTTP endpoints
- **Acceptance Criteria**:
  - [x] `internal/domain/menu/handler.go`
  - [x] `GET /api/menus` — public, with category filter, pagination
  - [x] `GET /api/menus/:id` — public
  - [x] `GET /api/menus/featured` — public
  - [x] `POST /api/admin/menus` — admin only, with idempotency
  - [x] `PUT /api/admin/menus/:id` — admin only, with idempotency
  - [x] `DELETE /api/admin/menus/:id` — admin only, with idempotency

### B-13: Image Upload Service (Cloudflare R2)
- **Priority**: P0
- **Description**: Cloudflare R2 integration for menu image uploads
- **Acceptance Criteria**:
  - [x] `internal/services/image/r2.go`
  - [x] Upload file to R2 with path: `menus/{uuid}/{filename}`
  - [x] Return public URL + object key
  - [x] Delete object by key
  - [x] Validate file type (magic bytes) and size (5MB max)
  - [x] R2 credentials from .env

---

## Phase 1.3 — Contact Form

### B-14: Contact Domain — Model & DTO
- **Priority**: P1
- **Description**: Contact form model and DTOs
- **Acceptance Criteria**:
  - [ ] `internal/domain/contact/model.go`
  - [ ] `internal/domain/contact/dto.go`
  - [ ] Validation: name, email, message required; phone optional

### B-15: Contact Repository
- **Priority**: P1
- **Description**: Contact database operations
- **Acceptance Criteria**:
  - [ ] `internal/domain/contact/repository.go`
  - [ ] `Create(contact)` — with submission_hash
  - [ ] `FindByHashWithinTime(hash, window)` — duplicate detection
  - [ ] `List(page, limit)` — admin list
  - [ ] `FindByID(id)` — single inquiry
  - [ ] `MarkAsRead(id)` / `MarkAsUnread(id)`
  - [ ] `Delete(id)`

### B-16: SHA-256 Hash Package
- **Priority**: P1
- **Description**: Hashing utility for contact deduplication
- **Acceptance Criteria**:
  - [ ] `internal/pkg/hash/hash.go`
  - [ ] `SHA256(input string) string` — returns hex-encoded hash
  - [ ] Used to hash: email + phone + message

### B-17: Contact Service
- **Priority**: P1
- **Description**: Contact form business logic with duplicate prevention
- **Acceptance Criteria**:
  - [ ] `internal/domain/contact/service.go`
  - [ ] Generate submission hash from email+phone+message
  - [ ] Check for duplicates within `duplicate_window` (5 min from config.yaml)
  - [ ] If duplicate → return error DUPLICATE_SUBMISSION
  - [ ] If new → save to database

### B-18: Contact Handlers
- **Priority**: P1
- **Description**: Contact HTTP endpoints
- **Acceptance Criteria**:
  - [ ] `internal/domain/contact/handler.go`
  - [ ] `POST /api/contacts` — public, rate-limited (5/5min per IP)
  - [ ] `GET /api/admin/contacts` — admin only
  - [ ] `GET /api/admin/contacts/:id` — admin only
  - [ ] `PATCH /api/admin/contacts/:id/read` — admin only, with idempotency
  - [ ] `DELETE /api/admin/contacts/:id` — admin only, with idempotency

---

## Phase 1.4 — Cross-Cutting Concerns (Backend)

### B-19: Idempotency Middleware
- **Priority**: P0
- **Description**: Idempotency key checker for all write endpoints
- **Acceptance Criteria**:
  - [ ] `internal/middleware/idempotency.go`
  - [ ] Extract `Idempotency-Key` header
  - [ ] Required on POST, PUT, PATCH, DELETE — return 400 if missing
  - [ ] Check `idempotency_keys` table for existing key+endpoint
  - [ ] If found → return cached response (same status + body)
  - [ ] If not found → proceed, then store result
  - [ ] Expiry: 24h from config.yaml

### B-20: Rate Limiting Middleware
- **Priority**: P0
- **Description**: Per-IP rate limiting
- **Acceptance Criteria**:
  - [ ] `internal/middleware/ratelimit.go`
  - [ ] Global: 100 req/min/IP (configurable)
  - [ ] Contact form: 5 req/5min/IP
  - [ ] Auth: 10 req/15min/IP
  - [ ] Rate limit headers in response (X-RateLimit-Remaining, etc.)

### B-21: CORS Middleware
- **Priority**: P0
- **Description**: CORS configuration from config.yaml
- **Acceptance Criteria**:
  - [ ] `internal/middleware/cors.go`
  - [ ] Allowed origins from config.yaml
  - [ ] Allow credentials
  - [ ] Proper preflight handling

### B-22: Security Headers Middleware
- **Priority**: P1
- **Description**: Security headers on all responses
- **Acceptance Criteria**:
  - [ ] `internal/middleware/security.go`
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Strict-Transport-Security (production only)
  - [ ] Content-Security-Policy

### B-23: Input Sanitization Middleware
- **Priority**: P1
- **Description**: Sanitize all incoming request data
- **Acceptance Criteria**:
  - [ ] `internal/middleware/sanitize.go`
  - [ ] Trim whitespace from string fields
  - [ ] Strip HTML tags from text fields
  - [ ] Max length enforcement

### B-24: Request Logger Middleware
- **Priority**: P1
- **Description**: Structured request/response logging
- **Acceptance Criteria**:
  - [ ] `internal/middleware/logger.go`
  - [ ] Log method, path, status, latency, request ID
  - [ ] JSON structured logs
  - [ ] No sensitive data in logs (no tokens, no passwords)

### B-25: Route Registration
- **Priority**: P0
- **Description**: Register all routes in main.go with middleware groups
- **Acceptance Criteria**:
  - [ ] Public group: `/api/menus`, `/api/contacts`, `/api/health`
  - [ ] Admin group: `/api/admin/*` with auth + idempotency middleware
  - [ ] Global middleware: CORS, rate limit, security headers, logger, sanitize

---

## Phase 1.5 — Frontend: Layout & Navigation

### F-01: Root Layout
- **Priority**: P0
- **Description**: Root layout with fonts, metadata, Google OAuth provider
- **Acceptance Criteria**:
  - [ ] `app/layout.tsx` — root layout
  - [ ] Playfair Display + Inter fonts loaded via `next/font`
  - [ ] Google OAuth provider wrapping the app
  - [ ] Global metadata (title, description, OG tags)

### F-02: Public Layout (Header + Footer)
- **Priority**: P0
- **Description**: Layout for public pages with navigation
- **Acceptance Criteria**:
  - [ ] `app/(public)/layout.tsx`
  - [ ] `components/layout/Navbar.tsx` — responsive navbar with logo, nav links
  - [ ] `components/layout/Footer.tsx` — footer with social links, copyright
  - [ ] `components/layout/MobileNav.tsx` — mobile hamburger menu or bottom nav
  - [ ] Active link highlighting
  - [ ] Logo links to `/`

### F-03: Dashboard Layout (Sidebar)
- **Priority**: P0
- **Description**: Layout for admin dashboard with sidebar
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/layout.tsx`
  - [ ] `components/dashboard/Sidebar.tsx` — sidebar with nav links
  - [ ] `components/dashboard/Header.tsx` — top header with user info + logout
  - [ ] Sidebar links: Dashboard, Menu, Admins, Contacts
  - [ ] Responsive: sidebar collapses on mobile
  - [ ] Auth check: redirect to /login if not authenticated

---

## Phase 1.6 — Frontend: Shared UI Components

### F-04: UI Component Library
- **Priority**: P0
- **Description**: Create shared UI primitives with Tailwind
- **Acceptance Criteria**:
  - [ ] `components/ui/Button.tsx` — variants: primary, secondary, danger, ghost
  - [ ] `components/ui/Card.tsx` — card container with hover effect
  - [ ] `components/ui/Input.tsx` — text input with label + error state
  - [ ] `components/ui/Modal.tsx` — modal/dialog component
  - [ ] `components/ui/Badge.tsx` — status badge (available, unavailable, etc.)
  - [ ] `components/ui/Skeleton.tsx` — loading skeleton
  - [ ] `components/ui/DataTable.tsx` — table component for dashboard
  - [ ] `components/ui/ImageUpload.tsx` — file upload with preview
  - [ ] `components/ui/Pagination.tsx` — page navigation
  - [ ] `components/ui/Toast.tsx` — success/error notifications
  - [ ] All components follow warm bakery theme colors

### F-05: Utility Functions & Types
- **Priority**: P0
- **Description**: Shared utilities and TypeScript types
- **Acceptance Criteria**:
  - [ ] `lib/utils.ts` — cn() for class merging, formatCurrency(), formatDate()
  - [ ] `lib/api.ts` — fetch wrapper with base URL, auth headers, error handling
  - [ ] `lib/constants.ts` — categories, status labels, etc.
  - [ ] `lib/validations.ts` — Zod schemas for all forms
  - [ ] `types/api.ts` — API response types
  - [ ] `types/menu.ts` — Menu, Category types
  - [ ] `types/contact.ts` — Contact types
  - [ ] `types/admin.ts` — Admin types

---

## Phase 1.7 — Frontend: Public Pages

### F-06: Landing Page
- **Priority**: P0
- **Description**: Main landing page with all sections
- **Acceptance Criteria**:
  - [ ] `app/(public)/page.tsx`
  - [ ] `components/landing/Hero.tsx` — hero banner with tagline and CTA
  - [ ] `components/landing/About.tsx` — about the bakery section
  - [ ] `components/landing/FeaturedMenu.tsx` — featured menu items (fetched from API)
  - [ ] `components/landing/Location.tsx` — address + Google Maps embed
  - [ ] `components/landing/ContactInfo.tsx` — phone, email, social links
  - [ ] Responsive on all screen sizes
  - [ ] SEO meta tags (title, description, OG image)
  - [ ] Subtle animations with Framer Motion

### F-07: Menu Page
- **Priority**: P0
- **Description**: Dedicated menu listing page with category filtering
- **Acceptance Criteria**:
  - [ ] `app/(public)/menu/page.tsx`
  - [ ] `components/menu/CategoryFilter.tsx` — horizontal scrollable category tabs
  - [ ] `components/menu/MenuGrid.tsx` — responsive grid of menu cards
  - [ ] `components/menu/MenuCard.tsx` — image, name, description, price, category badge
  - [ ] `components/menu/PriceDisplay.tsx` — shows original price (strikethrough) + discount price
  - [ ] Category filtering (All, Food, Beverage, Cake, Pastry, Bread)
  - [ ] Lazy loading on images
  - [ ] Loading skeleton while fetching
  - [ ] Empty state when no items in category
  - [ ] Pagination (if > 20 items)

### F-08: Contact Us Page
- **Priority**: P1
- **Description**: Contact form and bakery information
- **Acceptance Criteria**:
  - [ ] `app/(public)/contact/page.tsx`
  - [ ] `components/contact/ContactForm.tsx` — name, email, phone, message fields
  - [ ] `components/contact/MapEmbed.tsx` — Google Maps iframe
  - [ ] `components/contact/OperatingHours.tsx` — business hours display
  - [ ] Client-side validation with react-hook-form + zod
  - [ ] Server-side validation error display
  - [ ] Success toast after submission
  - [ ] Duplicate submission error handling (429 → friendly message)
  - [ ] Form reset after successful submission

---

## Phase 1.8 — Frontend: Admin Dashboard

### F-09: Login Page
- **Priority**: P0
- **Description**: Google OAuth login page
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/login/page.tsx`
  - [ ] `components/layout/GoogleAuthProvider.tsx` — wraps app with Google OAuth
  - [ ] "Sign in with Google" button
  - [ ] On success: redirect to /dashboard
  - [ ] On failure (not registered): show unauthorized message
  - [ ] Clean, centered layout

### F-10: Dashboard Home
- **Priority**: P1
- **Description**: Dashboard overview page
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/dashboard/page.tsx`
  - [ ] `components/dashboard/StatsCard.tsx` — total menus, total contacts, etc.
  - [ ] Quick action links (Add Menu, View Contacts)
  - [ ] Welcome message with admin name

### F-11: Menu Management Page
- **Priority**: P0
- **Description**: CRUD interface for menu items in dashboard
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/dashboard/menu/page.tsx` — menu list
  - [ ] `components/dashboard/MenuTable.tsx` — table with name, category, price, status, actions
  - [ ] Search/filter by category
  - [ ] Pagination
  - [ ] Delete confirmation modal
  - [ ] "Add New" button links to /dashboard/menu/new

### F-12: Add/Edit Menu Form
- **Priority**: P0
- **Description**: Form for creating and editing menu items
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/dashboard/menu/new/page.tsx` — add menu
  - [ ] `app/(dashboard)/dashboard/menu/[id]/page.tsx` — edit menu
  - [ ] `components/dashboard/MenuForm.tsx` — shared form component
  - [ ] Fields: name, description, category (dropdown), price, discount, is_available, is_featured, image
  - [ ] Image upload with preview (`components/ui/ImageUpload.tsx`)
  - [ ] Client-side validation with zod
  - [ ] Auto-calculate discount_price preview
  - [ ] Submit sends multipart/form-data to backend
  - [ ] Idempotency-Key header on create/update
  - [ ] Success/error toast notifications
  - [ ] Redirect to menu list after success

### F-13: Admin User Management Page
- **Priority**: P1
- **Description**: Manage admin users (super_admin only)
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/dashboard/admins/page.tsx`
  - [ ] `components/dashboard/AdminTable.tsx` — table with name, email, role, actions
  - [ ] "Add Admin" form (modal or inline): name, email
  - [ ] Remove admin with confirmation
  - [ ] Only visible to super_admin role
  - [ ] Idempotency-Key on add/remove

### F-14: Contact Inquiries Page
- **Priority**: P1
- **Description**: View contact form submissions in dashboard
- **Acceptance Criteria**:
  - [ ] `app/(dashboard)/dashboard/contacts/page.tsx`
  - [ ] `components/dashboard/ContactTable.tsx` — table with name, email, message preview, date, read status
  - [ ] Click to view full message detail
  - [ ] Mark as read/unread toggle
  - [ ] Delete with confirmation
  - [ ] Visual indicator for unread items (bold, badge)

---

## Phase 1.9 — Frontend: State Management & API Integration

### F-15: React Query Setup
- **Priority**: P0
- **Description**: Set up TanStack Query for server state management
- **Acceptance Criteria**:
  - [ ] QueryClient provider in root layout
  - [ ] `hooks/useAuth.ts` — login, logout, current user
  - [ ] `hooks/useMenus.ts` — list, create, update, delete menus
  - [ ] `hooks/useContacts.ts` — list, mark read, delete contacts
  - [ ] `hooks/useAdmins.ts` — list, add, remove admins
  - [ ] Proper cache invalidation on mutations
  - [ ] Loading and error states handled

---

## Phase 1.10 — SEO & Performance

### F-16: SEO Implementation
- **Priority**: P1
- **Description**: SEO meta tags, sitemap, robots.txt
- **Acceptance Criteria**:
  - [ ] Dynamic `<title>` and `<meta>` per page
  - [ ] Open Graph tags (og:title, og:description, og:image)
  - [ ] `app/sitemap.ts` — dynamic sitemap generation
  - [ ] `app/robots.ts` — robots.txt
  - [ ] Semantic HTML (proper heading hierarchy, landmarks)
  - [ ] JSON-LD structured data for bakery business

### F-17: Performance Optimization
- **Priority**: P1
- **Description**: Performance optimizations for landing page
- **Acceptance Criteria**:
  - [ ] Images use `next/image` with lazy loading
  - [ ] Font loading optimized (swap display)
  - [ ] No layout shift (CLS < 0.1)
  - [ ] Lighthouse performance score > 80
  - [ ] Proper `loading="lazy"` on below-fold images

---

## Phase 1.11 — Testing

### B-26: Backend Unit Tests
- **Priority**: P2
- **Description**: Unit tests for services and utilities
- **Acceptance Criteria**:
  - [ ] Tests for menu service (discount calculation, category validation)
  - [ ] Tests for contact service (duplicate detection, hash generation)
  - [ ] Tests for auth service (token generation, validation)
  - [ ] Tests for JWT package
  - [ ] Tests for hash package
  - [ ] All tests passing with `go test ./...`

### F-18: Frontend Unit Tests
- **Priority**: P2
- **Description**: Component tests with Vitest + React Testing Library
- **Acceptance Criteria**:
  - [ ] Tests for PriceDisplay component (normal, discount, no discount)
  - [ ] Tests for CategoryFilter component
  - [ ] Tests for ContactForm validation
  - [ ] Tests for MenuForm validation
  - [ ] All tests passing with `npm test`

---

## Task Dependency Graph

```
Phase 1.0 (Setup) — All tasks independent, can be parallelized
    ↓
Phase 1.1 (Auth) — Depends on D-03, D-04, D-05
    ↓
Phase 1.2 (Menu) — Depends on B-06 (Auth Middleware), D-04
    ↓
Phase 1.3 (Contact) — Depends on B-06, D-04
    ↓
Phase 1.4 (Cross-cutting) — Depends on D-03, can be done alongside 1.2/1.3
    ↓
Phase 1.5-1.9 (Frontend) — Depends on D-02, B-01 through B-18
    ↓
Phase 1.10 (SEO/Performance) — Depends on frontend pages being complete
    ↓
Phase 1.11 (Testing) — Depends on all features being complete
```

---

## Summary

| Phase | Tasks | Count |
|---|---|---|
| 1.0 — Setup | D-01 to D-05, AI-01 | 6 |
| 1.1 — Auth | B-01 to B-07 | 7 |
| 1.2 — Menu | B-08 to B-13 | 6 |
| 1.3 — Contact | B-14 to B-18 | 5 |
| 1.4 — Cross-cutting | B-19 to B-25 | 7 |
| 1.5 — Layout | F-01 to F-03 | 3 |
| 1.6 — UI Components | F-04 to F-05 | 2 |
| 1.7 — Public Pages | F-06 to F-08 | 3 |
| 1.8 — Dashboard | F-09 to F-14 | 6 |
| 1.9 — State Mgmt | F-15 | 1 |
| 1.10 — SEO/Perf | F-16 to F-17 | 2 |
| 1.11 — Testing | B-26, F-18 | 2 |
| **Total** | | **50 tasks** |

---

## Estimated Effort

| Category | Tasks | Estimated Days |
|---|---|---|
| Project Setup | 6 | 1-2 days |
| Backend (Auth + Menu + Contact + Middleware) | 25 | 5-7 days |
| Frontend (Layout + Pages + Dashboard) | 22 | 5-7 days |
| SEO + Performance + Testing | 4 | 1-2 days |
| **Total** | **50** | **12-18 days** |

> Note: Backend and Frontend can be developed in parallel by different developers,
> reducing total calendar time to approximately 7-10 days.