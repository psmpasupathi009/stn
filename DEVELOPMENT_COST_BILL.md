# Website Development Cost Bill

**Project:** STN E-Commerce / Product Store Website  
**Scope:** Full stack Next.js web application (scanned from codebase)  
**Currency:** INR (₹)  

### Summary

| Item | Amount (₹) |
|------|------------|
| Website development | 7,25,000 |
| Deployment (one-time) | 26,000 |
| **Total project** | **7,51,000** |
| Maintenance (per year) | 1,28,000 |

---

## 1. Feature List (from project scan)

| # | Feature / Module | Description | Est. Hours | Rate (₹/hr) | Amount (₹) |
|---|------------------|-------------|------------|-------------|------------|
| 1 | **Tech stack & setup** | Next.js 16, React 19, TypeScript, Tailwind, ESLint, Prisma, MongoDB | 24 | 1,000 | 24,000 |
| 2 | **Database & schema** | Prisma schema (User, Product, Order, Cart, Review, Hero, Gallery, OTP, etc.) | 32 | 1,000 | 32,000 |
| 3 | **Authentication** | Sign up, sign in, sign out, OTP (send/verify), forgot password, reset password, create account, JWT/session, role (USER/ADMIN) | 56 | 1,000 | 56,000 |
| 4 | **Product catalog** | Products CRUD API, categories API, product list/detail pages, collections by category | 40 | 1,000 | 40,000 |
| 5 | **Shopping cart** | Cart API (add/update/remove), cart page, cart context | 24 | 1,000 | 24,000 |
| 6 | **Checkout & payments** | Checkout flow, Razorpay order create/verify, payment verification API | 40 | 1,100 | 44,000 |
| 7 | **Orders** | Order creation, order history, order detail, status flow (pending → delivered) | 32 | 1,000 | 32,000 |
| 8 | **Admin dashboard** | Admin layout, dashboard UI, protected routes | 24 | 1,000 | 24,000 |
| 9 | **Admin – Products** | Product CRUD, bulk actions, image upload (DigitalOcean Spaces) | 40 | 1,000 | 40,000 |
| 10 | **Admin – Orders** | Order list, filters, status update, shipping labels (PDF/jspdf) | 36 | 1,000 | 36,000 |
| 11 | **Admin – Hero & gallery** | Hero sections CRUD, sortable hero grid/list, gallery media (image/video), sortable gallery, DigitalOcean Spaces upload | 44 | 1,000 | 44,000 |
| 12 | **Reviews & ratings** | Review API, product reviews, rating display/aggregate | 20 | 1,000 | 20,000 |
| 13 | **Media & upload** | DigitalOcean Spaces integration, upload API, media route, product/gallery images | 24 | 1,000 | 24,000 |
| 14 | **Email** | Nodemailer setup, OTP emails, forgot-password emails, test script | 20 | 1,000 | 20,000 |
| 15 | **UI components** | Header, Footer, forms, buttons, cards, inputs, OTP input, sheet, sidebar, badges, etc. | 48 | 950 | 45,600 |
| 16 | **Home & marketing** | Homepage, hero section, category marquee, product cards, trust section, announcement bar | 32 | 1,000 | 32,000 |
| 17 | **Static & info pages** | Our Story, Contact, Profile, Track Order | 28 | 950 | 26,600 |
| 18 | **Integrations & extras** | WhatsApp button, ScrollToTop, responsive layout | 12 | 950 | 11,400 |
| 19 | **Security & validation** | Auth middleware, input validation (Zod), env handling | 16 | 1,000 | 16,000 |
| 20 | **Scripts & tooling** | Seed products, create-admin, Prisma generate/push | 8 | 950 | 7,600 |

---

## 2. Development cost summary

| Item | Hours | Amount (₹) |
|------|--------|------------|
| Total development (feature-based) | **640** | **6,59,200** |
| Contingency (10%) | 64 | 65,920 |
| **Total website development** | **704** | **7,25,120** |

**Rounded total development:** **₹7,25,000** (in words: Seven Lakh Twenty-Five Thousand Rupees Only)

---

## 3. Deployment cost (one-time)

| # | Item | Description | Amount (₹) |
|---|------|-------------|------------|
| 1 | Server / hosting setup | Vercel or equivalent (Next.js), env & domain config | 8,000 |
| 2 | Database setup | MongoDB Atlas (or similar) provisioning & connection | 4,000 |
| 3 | Third-party config | Razorpay, DigitalOcean Spaces, email SMTP (production) | 6,000 |
| 4 | SSL & domain | Domain DNS, SSL (if not included in host) | 3,000 |
| 5 | Go-live & smoke tests | Basic deployment checklist & smoke testing | 5,000 |
| | **Total deployment** | | **26,000** |

**Rounded total deployment:** **₹26,000** (in words: Twenty-Six Thousand Rupees Only)

---

## 4. Annual maintenance (company standard)

| # | Item | Description | Amount (₹/year) |
|---|------|-------------|------------------|
| 1 | Hosting & database | Vercel + MongoDB (estimated annual) | 15,000 |
| 2 | Maintenance retainer | Bug fixes, small updates, dependency updates (≈ 8 hrs/month × 12) | 96,000 |
| 3 | Security & backups | Basic monitoring, backup check, security patches | 12,000 |
| 4 | Third-party renewals | Razorpay/DigitalOcean/email – no extra if within free tier; buffer | 5,000 |
| | **Total maintenance (per year)** | | **1,28,000** |

**Rounded annual maintenance:** **₹1,28,000** (in words: One Lakh Twenty-Eight Thousand Rupees Only per year)

---

## 5. Grand total summary

| Bill type | Amount (₹) |
|-----------|------------|
| Total website development | 7,25,000 |
| Deployment (one-time) | 26,000 |
| **Total project (development + deploy)** | **7,51,000** |
| Annual maintenance (per year) | 1,28,000 |

---

## 6. File / scope reference (scanned)

- **Pages:** 20 (app router): home, login, signup, forgot/reset password, cart, checkout, products, collections, orders, profile, track-order, contact, our-story, admin dashboard.
- **API routes:** 26 (auth, cart, products, categories, orders, payments, reviews, hero-sections, gallery, upload, admin orders/labels).
- **Key libs:** Next.js 16, React 19, Prisma, MongoDB, Razorpay, DigitalOcean Spaces, Nodemailer, jspdf, React Hook Form, Zod, Tailwind, Radix UI.

---

*This bill is based on features and files present in the project and company-standard development, deployment, and maintenance rates. Adjust hours or rates as per your actual company policy.*
