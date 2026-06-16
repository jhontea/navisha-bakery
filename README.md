# Navisha Bakery

A digital presence for Navisha Bakery — showcasing bakery products, menus, and enabling customer contact and future online ordering.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router) with TypeScript and Tailwind CSS
- **Backend**: Go 1.25+ with Echo v4
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Image Storage**: Cloudflare R2
- **Auth**: Google OAuth 2.0

## Project Structure

```
bakery/
├── frontend/        # Next.js application
├── backend/         # Go + Echo API server
├── docs/            # Documentation & AI agent context
│   └── ai_agent/
│       ├── PRD.md
│       ├── TRD.md
│       ├── TASKS.md
│       ├── FRONTEND_INSTRUCTIONS.md
│       └── BACKEND_INSTRUCTIONS.md
├── .gitignore
└── README.md
```

## Development

### Prerequisites

- Node.js 18+
- Go 1.25+
- PostgreSQL (via Supabase)
- Redis (via Upstash)

### Frontend

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd backend
go mod download
go run ./cmd/server  # http://localhost:8080
```

## Documentation

- [Product Requirement Document](docs/ai_agent/PRD.md)
- [Technical Requirement Document](docs/ai_agent/TRD.md)
- [Task Breakdown](docs/ai_agent/TASKS.md)