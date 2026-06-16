# Product Requirement Document (PRD)
## Navisha Bakery

---

## 1. Product Overview

| Field | Description |
|---|---|
| **Product Name** | Navisha Bakery |
| **Product Type** | Web Application (Landing Page + Admin Dashboard) |
| **Vision** | A digital presence for Navisha Bakery to showcase products, attract customers, and eventually enable online ordering. |
| **Mission** | Provide an elegant, fast, and mobile-friendly website where customers can browse bakery menus, learn about the bakery, and contact the business — with a future path toward online ordering and Telegram-based order management. |

---

## 2. Goals & Objectives

### Business Goals
- Establish an online presence for Navisha Bakery
- Showcase bakery products (menus) in an attractive and organized way
- Enable customers to reach out easily (Contact Us)
- Provide the bakery owner an easy-to-use dashboard for managing menus and admin users
- Lay the foundation for future online ordering (WhatsApp, Telegram, Email, Preorder)
- Enable Telegram-based order management for real-time operations

### User Goals (Customer)
- Quickly understand what Navisha Bakery offers
- Browse menu items by category with images, descriptions, and pricing (including discounts)
- Find bakery location and contact information
- Eventually: place orders or preorders conveniently

### User Goals (Admin/Owner)
- Manage menu items (add, edit, delete) without technical knowledge
- Manage admin users (add/remove) with email notifications
- View contact inquiries from customers
- (Future) Manage orders via Telegram bot in real-time
- (Future) View transaction summaries and order history

---

## 3. Target Users

### Persona 1: Customer

| Attribute | Detail |
|---|---|
| **Who** | Local customers looking for bakery products |
| **Need** | Browse menu, find location, contact the bakery |
| **Device** | Primarily mobile, also desktop |
| **Behavior** | Quick browsing, expects fast load, visual-heavy (photos of baked goods) |

### Persona 2: Admin / Bakery Owner

| Attribute | Detail |
|---|---|
| **Who** | Bakery owner or designated staff member |
| **Need** | Manage menu content, manage admin users, view customer inquiries, (future) manage orders via Telegram |
| **Device** | Desktop or tablet |
| **Behavior** | Infrequent dashboard visits but needs simple, intuitive interface |

---

## 4. Feature Specification

### Phase 1 — MVP (Current Sprint)

#### F1: Landing Page

| Item | Detail |
|---|---|
| **Description** | Main page introducing Navisha Bakery |
| **Components** | Hero section (banner/tagline), About section, Featured menus preview, Location/Map embed, Contact info, Footer with social links |
| **Acceptance Criteria** | Page loads in < 3s, responsive on mobile/tablet/desktop, all sections visible without excessive scrolling, SEO-optimized meta tags |

#### F2: Menu Page

| Item | Detail |
|---|---|
| **Description** | Dedicated page showing all bakery menu items |
| **Components** | Category filter/tabs, Menu card with the following fields |
| **Menu Fields** | |

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | Yes | Menu item name |
| `description` | string | Yes | Item description |
| `price` | decimal | Yes | Original price |
| `discount` | percentage | No | Discount percentage (0-100) |
| `discount_price` | decimal | No | Final price after discount (auto-calculated or manual) |
| `category` | enum | Yes | `food`, `beverage`, `cake`, `pastry`, `bread` |
| `image` | url/file | Yes | Product photo |
| `is_available` | boolean | Yes | Availability toggle (default: true) |

| Item | Detail (continued) |
|---|---|
| **Display Logic** | Items with discount show original price (strikethrough) + discounted price |
| **Category Tabs** | All, Food, Beverage, Cake, Pastry, Bread |
| **Acceptance Criteria** | Menu items fetched from API, categories filterable, responsive grid layout, images load with lazy loading, discount display working correctly |

#### F3: Contact Us Page

| Item | Detail |
|---|---|
| **Description** | Page for customers to contact the bakery |
| **Components** | Contact form (name, email, phone, message), Bakery address with map embed, Operating hours, Social media links |
| **Acceptance Criteria** | Form validation (client + server), form submission stores inquiry in DB, success/error feedback to user, rate limiting on submissions |

#### F4: Admin Dashboard — Authentication

| Item | Detail |
|---|---|
| **Description** | Secure login for admin dashboard |
| **Auth Method** | Google OAuth 2.0 Sign-In only (no email/password) |
| **Access Control** | Only users whose Google email is registered in the `admins` table can access the dashboard |
| **Session** | JWT token stored in httpOnly cookie |
| **Flow** | User clicks "Sign in with Google" → Google OAuth → Backend verifies token + checks admin whitelist → Issues JWT → Dashboard access |
| **Rejection** | Non-registered Google accounts see an "Unauthorized" message |

#### F5: Admin Dashboard — Menu Management

| Item | Detail |
|---|---|
| **Description** | Dashboard for bakery owner to manage menu items |
| **Components** | Menu list (table/card view), Add/Edit menu form (name, description, price, discount, category, image upload, availability), Delete with confirmation dialog |
| **Acceptance Criteria** | Only authenticated admins can access, full CRUD operations work correctly, image upload with preview, form validation, category dropdown, discount auto-calculates discount_price |

#### F6: Admin Dashboard — Admin User Management

| Item | Detail |
|---|---|
| **Description** | Super admin can add/remove admin users |
| **Components** | Admin list view, Add admin form (name, email), Remove admin with confirmation |
| **Access Control** | Only super admin (first registered admin / owner) can manage other admins |
| **Email Notification** | When a new admin is added, send a welcome/notification email via **Resend** API |
| **Email Details** | |

| Field | Value |
|---|---|
| **Service** | Resend (https://resend.com) |
| **From** | `notifications@navishabakery.com` (or configured domain) |
| **To** | New admin's email address |
| **Subject** | "You've been added as an Admin on Navisha Bakery" |
| **Content** | Branded HTML email with Navisha Bakery branding, new admin details, and login instructions |

#### F7: Admin Dashboard — Contact Inquiries

| Item | Detail |
|---|---|
| **Description** | View and manage contact form submissions |
| **Components** | Inquiry list with timestamp, Mark as read/unread, Delete inquiry |
| **Acceptance Criteria** | List shows all submissions, basic filtering, detail view |

---

### Phase 2 — Future (Next Sprint)

#### F8: Order via External Channel (WhatsApp / Email)

| Item | Detail |
|---|---|
| **Description** | Allow customers to order via WhatsApp or Email |
| **Components** | "Order Now" button on menu items, Channel selection (WhatsApp / Email), Pre-filled message template with item details |
| **Acceptance Criteria** | Clicking order opens the selected channel with pre-filled order message |

#### F9: Telegram Bot Order Management

| Item | Detail |
|---|---|
| **Description** | Telegram bot for receiving and processing orders directly from Telegram |
| **Priority** | High (Phase 2 primary feature) |

**Order Flow:**

```
Customer places order on website
        ↓
Go backend creates order in DB (status: pending)
        ↓
Go backend sends Telegram notification to admin's Telegram
(Bot message: "New Order #001 - Item: Croissant x2 - Total: Rp 50,000")
        ↓
Admin replies in Telegram:
  /confirm 001  →  Updates DB status to "confirmed"
  /complete 001 →  Updates DB status to "completed"
  /cancel 001   →  Updates DB status to "cancelled"
        ↓
Bot sends confirmation back to admin in Telegram
(Optional: Bot sends status update to customer via Telegram if available)
```

**Components:**

| Component | Detail |
|---|---|
| **Bot Setup** | Created via BotFather, token stored as environment variable |
| **Go Library** | `go-telegram-bot-api/telegram-bot-api` or `tucnak/telebot` |
| **Webhook/Polling** | Go backend exposes webhook endpoint or uses long polling |
| **Commands** | `/confirm <order_id>`, `/complete <order_id>`, `/cancel <order_id>`, `/list` (view pending orders) |
| **Admin Chat ID** | Configured in environment variable |
| **DB Sync** | All Telegram actions are persisted to PostgreSQL in real-time |
| **Notification Format** | Structured message with order ID, customer name, items, total, timestamp |

**Acceptance Criteria:**
- Telegram notification received within 5 seconds of order creation
- All admin commands update database correctly
- Admin can view order list via `/list` command
- Error handling for invalid commands or order IDs
- All actions logged for audit trail

#### F10: Preorder System

| Item | Detail |
|---|---|
| **Description** | Customers can place preorders directly through the website |
| **Components** | Cart functionality, Order form (name, phone, pickup date/time, notes), Order confirmation page |
| **Acceptance Criteria** | Order stored in database, confirmation displayed, admin can view/manage orders, Telegram notification triggered |

---

### Phase 3 — Future

#### F11: Transaction Summary & Order Tracking

| Item | Detail |
|---|---|
| **Description** | Admin dashboard shows order history and transaction summaries |
| **Components** | Order list with status, Revenue summary (daily/weekly/monthly), Order status management workflow (pending → confirmed → completed / cancelled) |
| **Acceptance Criteria** | Accurate transaction data, filterable by date range, exportable reports, status workflow works end-to-end |

---

## 5. User Stories

### Customer Stories

| ID | Story | Phase | Priority |
|---|---|---|---|
| US-01 | As a customer, I want to see what Navisha Bakery offers on the landing page so I can quickly decide if I'm interested | 1 | High |
| US-02 | As a customer, I want to browse all menu items by category so I can find what I like | 1 | High |
| US-03 | As a customer, I want to see menu item photos, descriptions, prices, and any active discounts | 1 | High |
| US-04 | As a customer, I want to find the bakery's location and contact information | 1 | High |
| US-05 | As a customer, I want to send a message via a contact form | 1 | High |
| US-06 | As a customer, I want the site to work well on my phone | 1 | High |
| US-07 | As a customer, I want to order items via WhatsApp or Email | 2 | Medium |
| US-08 | As a customer, I want to preorder items for a specific pickup date/time | 2 | Medium |
| US-09 | As a customer, I want to receive order confirmation via Telegram | 2 | Medium |

### Admin Stories

| ID | Story | Phase | Priority |
|---|---|---|---|
| AS-01 | As an admin, I want to sign in securely using Google OAuth | 1 | High |
| AS-02 | As an admin, I want to add new menu items with name, description, price, discount, category, and image | 1 | High |
| AS-03 | As an admin, I want to edit existing menu items | 1 | High |
| AS-04 | As an admin, I want to delete menu items with confirmation | 1 | High |
| AS-05 | As an admin, I want to add/remove admin users from the dashboard | 1 | High |
| AS-06 | As an admin, I want to receive email notification when a new admin is registered | 1 | Medium |
| AS-07 | As an admin, I want to view contact form submissions | 1 | Medium |
| AS-08 | As an admin, I want to manage orders via Telegram bot commands | 2 | High |
| AS-09 | As an admin, I want to receive real-time Telegram notifications for new orders | 2 | High |
| AS-10 | As an admin, I want to view transaction summaries and order history | 3 | Low |

---

## 6. Non-Functional Requirements

### Performance
- Landing page loads in < 3 seconds on 3G connection
- Images use lazy loading and optimization (WebP format preferred)
- Lighthouse performance score > 80

### Responsive Design
- Fully responsive: mobile (320px+), tablet (768px+), desktop (1024px+)
- Touch-friendly interactions on mobile
- Bottom navigation on mobile for key pages

### UI Design Direction

| Aspect | Direction |
|---|---|
| **Style** | Minimalist, modern, clean |
| **Theme** | Bakery / cake / food-oriented |
| **Color Palette** | Warm tones — cream, soft brown, pastel pink, white, with gold or terracotta accents |
| **Typography** | Elegant serif for headings (e.g., Playfair Display), clean sans-serif for body (e.g., Inter, Poppins) |
| **Imagery** | High-quality bakery product photos, soft shadows, rounded corners |
| **Layout** | Generous whitespace, card-based menu grid, subtle animations |
| **Components** | Rounded buttons, soft gradients, subtle glass-morphism effects, warm hover states |
| **Mobile-First** | Touch-friendly, swipeable category tabs, bottom navigation on mobile |

### SEO
- Meta tags (title, description) per page
- Open Graph tags for social sharing
- Semantic HTML structure
- sitemap.xml and robots.txt
- Structured data (JSON-LD) for bakery business

### Accessibility
- WCAG 2.1 AA compliance
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast ratios

### Security
- HTTPS enforced on all endpoints
- Input sanitization and validation on all forms
- CSRF protection
- Rate limiting on API endpoints (especially contact form)
- JWT tokens in httpOnly cookies
- Environment variables for all secrets (never hardcoded)

### Browser Support
- Chrome, Firefox, Safari, Edge (latest 2 versions)

### Internationalization
- English (primary)
- Potential for Bahasa Indonesia in future

---

## 7. Success Metrics

| Metric | Target |
|---|---|
| **Page Load Time** | < 3 seconds on 3G |
| **Lighthouse Performance** | Score > 80 |
| **Mobile Usability** | 100% responsive, passes Google Mobile-Friendly Test |
| **SEO Score** | Lighthouse SEO > 90 |
| **Menu Page Views** | Track via analytics (baseline TBD) |
| **Contact Form Submissions** | Track via analytics (baseline TBD) |
| **Admin Task Completion** | Menu CRUD operations completable in < 2 minutes |
| **Telegram Bot Response** | Order notification delivered within 5 seconds |

---

## 8. Out of Scope (Phase 1)

- Online payment / checkout processing
- Customer user registration / accounts
- Inventory management system
- Multi-language support
- Native mobile app (iOS/Android)
- Delivery tracking / logistics integration

---

## 9. Summary — Phased Delivery

| Phase | Features | Timeline |
|---|---|---|
| **Phase 1 (MVP)** | Landing Page, Menu Page, Contact Us, Admin Dashboard (Google Auth, Menu CRUD, Admin User Management with Resend Email, Contact Inquiries) | Current Sprint |
| **Phase 2** | Order via WhatsApp/Email, Telegram Bot Order Management, Preorder System | Next Sprint |
| **Phase 3** | Transaction Summary, Order Tracking, Reporting | Future |

---

## 10. Assumptions & Dependencies

### Assumptions
- The bakery owner has a Google account for admin login
- Internet connectivity is available for image loading
- Free tier hosting limits are sufficient for initial traffic
- Resend free tier allows sufficient email volume for admin notifications

### Dependencies

| Dependency | Purpose | Free Tier Available |
|---|---|---|
| **Google OAuth 2.0** | Admin authentication | Yes |
| **Resend** | Admin registration email notifications | Yes (100 emails/day free) |
| **Telegram Bot API** | Order management via Telegram (Phase 2) | Yes (unlimited) |
| **Vercel** | Next.js frontend hosting | Yes (hobby tier) |
| **Render / Railway** | Go backend hosting | Yes (free tier) |
| **Neon / Supabase** | PostgreSQL database hosting | Yes (free tier) |