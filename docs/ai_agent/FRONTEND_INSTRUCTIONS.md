# Navisha Bakery — Frontend AI Agent Instructions

> Read this file to understand the frontend project patterns, conventions, and how-to guides.
> This reduces context window usage by providing a concise reference instead of parsing the entire codebase.

---

## 1. Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14+ (App Router) | Framework |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Styling |
| TanStack Query (React Query) | 5+ | Server state management |
| react-hook-form | 7+ | Form handling |
| zod | 3+ | Schema validation |
| @react-oauth/google | Latest | Google OAuth |
| lucide-react | Latest | Icons |
| framer-motion | Latest | Animations |
| ky | Latest | HTTP client |

---

## 2. Project Structure

```
frontend/
├── app/                          # Next.js App Router (route-based)
│   ├── (public)/                 # Public route group (shared layout)
│   │   ├── layout.tsx            # Public layout: Navbar + Footer
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── menu/page.tsx         # Menu page (/menu)
│   │   └── contact/page.tsx      # Contact Us page (/contact)
│   │
│   ├── (dashboard)/              # Admin route group (shared layout)
│   │   ├── layout.tsx            # Dashboard layout: Sidebar + Header
│   │   ├── login/page.tsx        # Login page (/login)
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard home
│   │       ├── menu/page.tsx     # Menu list
│   │       ├── menu/new/page.tsx # Add menu
│   │       ├── menu/[id]/page.tsx# Edit menu
│   │       ├── admins/page.tsx   # Admin management
│   │       └── contacts/page.tsx # Contact inquiries
│   │
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # robots.txt
│   └── not-found.tsx             # 404 page
│
├── components/
│   ├── ui/                       # Shared UI primitives (design system)
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
│   ├── landing/                  # Domain: Landing page
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── FeaturedMenu.tsx
│   │   ├── Location.tsx
│   │   └── ContactInfo.tsx
│   │
│   ├── menu/                     # Domain: Menu (public)
│   │   ├── MenuCard.tsx
│   │   ├── MenuGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── PriceDisplay.tsx
│   │
│   ├── contact/                  # Domain: Contact
│   │   ├── ContactForm.tsx
│   │   ├── MapEmbed.tsx
│   │   └── OperatingHours.tsx
│   │
│   ├── dashboard/                # Domain: Admin Dashboard
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MenuTable.tsx
│   │   ├── MenuForm.tsx
│   │   ├── AdminTable.tsx
│   │   ├── ContactTable.tsx
│   │   └── StatsCard.tsx
│   │
│   └── layout/                   # Domain: Layout components
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── MobileNav.tsx
│       └── GoogleAuthProvider.tsx
│
├── lib/                          # Shared utilities
│   ├── api.ts                    # API client (fetch wrapper)
│   ├── auth.ts                   # Auth utilities
│   ├── constants.ts              # App constants (categories, etc.)
│   ├── validations.ts            # Zod schemas
│   └── utils.ts                  # Helper functions
│
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useMenus.ts
│   ├── useContacts.ts
│   ├── useAdmins.ts
│   └── usePagination.ts
│
└── types/                        # TypeScript type definitions
    ├── api.ts                    # API response types
    ├── menu.ts                   # Menu types
    ├── contact.ts                # Contact types
    ├── admin.ts                  # Admin types
    └── index.ts                  # Re-exports
```

---

## 3. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| **Components** | PascalCase filenames | `MenuCard.tsx`, `CategoryFilter.tsx` |
| **Utilities** | camelCase filenames | `api.ts`, `utils.ts`, `constants.ts` |
| **Types** | PascalCase in types/ | `Menu`, `ContactForm`, `Admin` |
| **Hooks** | `use` prefix, camelCase | `useAuth.ts`, `useMenus.ts` |
| **Route pages** | `page.tsx` (Next.js convention) | `app/(public)/menu/page.tsx` |
| **CSS classes** | Tailwind utility classes | `className="text-brown-600 font-semibold"` |
| **Constants** | UPPER_SNAKE_CASE | `API_BASE_URL`, `CATEGORIES` |

---

## 4. Coding Conventions

### Components

```tsx
// Use named exports (preferred over default)
export function MenuCard({ item }: MenuCardProps) {
  return <div>...</div>
}

// Props interface defined in same file or imported from types/
interface MenuCardProps {
  item: Menu
  onSelect?: (id: string) => void
}
```

### Styling

```tsx
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" ? "primary-classes" : "secondary-classes"
)}>
```

### State Management

```tsx
// Server state → React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['menus', { category }],
  queryFn: () => api.get('/menus', { params: { category } })
})

// Local state → useState
const [isOpen, setIsOpen] = useState(false)

// Form state → react-hook-form
const form = useForm<FormValues>({
  resolver: zodResolver(schema)
})
```

### API Calls

```tsx
// Always use lib/api.ts wrapper
import { api } from '@/lib/api'

// GET
const menus = await api.get('/menus', { params: { category: 'cake' } })

// POST with idempotency key
const result = await api.post('/admin/menus', formData, {
  headers: { 'Idempotency-Key': crypto.randomUUID() }
})

// PUT
await api.put(`/admin/menus/${id}`, data)

// DELETE
await api.delete(`/admin/menus/${id}`)
```

### Forms

```tsx
// Define schema in lib/validations.ts
export const menuSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.enum(['food', 'beverage', 'cake', 'pastry', 'bread']),
  price: z.number().positive('Price must be positive'),
  discount: z.number().min(0).max(100).optional(),
  is_available: z.boolean().default(true),
})

// Use in component
const form = useForm<z.infer<typeof menuSchema>>({
  resolver: zodResolver(menuSchema),
  defaultValues: { ... }
})

return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <Input {...register('name')} error={form.formState.errors.name?.message} />
    ...
  </form>
)
```

---

## 5. API Client Pattern (`lib/api.ts`)

```tsx
import ky from 'ky'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

export const api = ky.create({
  prefixUrl: API_BASE_URL,
  credentials: 'include',           // Send cookies
  timeout: 30000,                    // 30s timeout
  hooks: {
    beforeRequest: [
      (request) => {
        // Add auth token from cookie if available
        // (httpOnly cookies are sent automatically)
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          // Redirect to login
          window.location.href = '/login'
        }
        return response
      }
    ]
  }
})
```

---

## 6. Type Definition Pattern

```tsx
// types/menu.ts
export interface Menu {
  id: string
  name: string
  description: string | null
  category: MenuCategory
  price: number
  discount: number | null
  discount_price: number | null
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type MenuCategory = 'food' | 'beverage' | 'cake' | 'pastry' | 'bread'

export interface MenuListResponse {
  items: Menu[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  total_pages: number
}

// types/api.ts
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
```

---

## 7. Theme & Design Tokens

### Color Palette (Tailwind Config)

```ts
// tailwind.config.ts additions
colors: {
  cream:      { 50: '#FFF8F0', 100: '#FFF0DB', 200: '#FFE0B2', 300: '#FFD189', 400: '#FFC261', 500: '#FFB733' },
  brown:      { 50: '#F5F0EB', 100: '#E8DDD4', 200: '#D4BCA8', 300: '#C09A7C', 400: '#AD7D5E', 500: '#8B5E3C', 600: '#6D4A2F', 700: '#503621', 800: '#332314', 900: '#1A110A' },
  'pastel-pink': { 50: '#FFF0F3', 100: '#FFD9E1', 200: '#FFB3C4', 300: '#FF8CA6', 400: '#FF6689', 500: '#FF406C' },
  gold:        { 50: '#FFF9E6', 100: '#FFF0BF', 200: '#FFE699', 300: '#FFDB73', 400: '#FFD14D', 500: '#FFC726' },
  terracotta:  { 50: '#FDF0EB', 100: '#F9D9CC', 200: '#F2B399', 300: '#EB8D66', 400: '#E56733', 500: '#D4421E' },
}
```

### Typography

```tsx
// app/layout.tsx
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body' })

// Usage in tailwind:
// font-heading → Playfair Display (headings, hero text)
// font-body → Inter (body text, UI elements)
```

### Design Principles

- **Minimalist & Modern**: Clean layouts, generous whitespace
- **Warm Bakery Theme**: Cream backgrounds, brown text, pink/gold accents
- **Rounded Corners**: Use `rounded-lg` or `rounded-xl` on cards, buttons
- **Soft Shadows**: `shadow-sm` or `shadow-md` (not heavy shadows)
- **Subtle Animations**: Framer Motion for scroll reveals, hover effects
- **Mobile-First**: Design for mobile, enhance for desktop

---

## 8. Common Patterns

### Adding a New Page

1. Create route file: `app/(public)/new-page/page.tsx`
2. Create components in: `components/new-page/`
3. Add types in: `types/new-page.ts`
4. Add API hooks in: `hooks/useNewPage.ts`
5. Add to navigation in: `components/layout/Navbar.tsx`

### Adding a New Dashboard Feature

1. Create route: `app/(dashboard)/dashboard/{feature}/page.tsx`
2. Create table: `components/dashboard/{Feature}Table.tsx`
3. Create form: `components/dashboard/{Feature}Form.tsx`
4. Add React Query hooks with mutations
5. Add sidebar link in: `components/dashboard/Sidebar.tsx`

### Adding a New UI Component

1. Create in: `components/ui/{ComponentName}.tsx`
2. Use `cn()` for class merging
3. Support `className` prop for customization
4. Define Props interface in same file
5. Export as named export

---

## 9. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `NEXT_PUBLIC_APP_URL` | Yes | Frontend URL (for redirects) |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (default: "Navisha Bakery") |

---

## 10. Common Commands

```bash
# Development
npm run dev          # Start dev server on :3000

# Build
npm run build        # Production build

# Lint
npm run lint         # ESLint check

# Test
npm test             # Run Vitest tests