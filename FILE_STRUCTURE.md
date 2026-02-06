# Project file structure

Standard Next.js 16 App Router layout. Kept flat and predictable for fast navigation and builds.

```
stn/
├── app/
│   ├── layout.tsx          # Root layout (fonts, Header, Footer, AuthProvider)
│   ├── page.tsx            # Redirects to /home
│   ├── globals.css
│   ├── admin/              # Admin dashboard (protected)
│   │   ├── layout.tsx
│   │   └── dashboard/page.tsx
│   ├── home/               # Storefront
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Home (hero, categories, products)
│   │   ├── products/       # Listing + [id] detail
│   │   ├── cart/ | checkout/ | orders/ | track-order/
│   │   ├── contact/ | our-story/ | profile/
│   │   ├── login/ | signup/ | forgot-password/ | reset-password/
│   │   └── privacy/ | terms/ | shipping-returns/
│   └── api/                # Route handlers
│       ├── auth/ | cart/ | orders/ | payments/ | products/
│       ├── admin/orders/   # Admin order + labels
│       ├── categories/ | gallery/ | hero-sections/ | reviews/ | upload/
│       └── ...
├── components/
│   ├── Header.tsx | Footer.tsx | ScrollToTop.tsx
│   ├── CategoryMarquee.tsx
│   ├── PageLoadingOverlay.tsx
│   ├── homepage/           # HeroSection, ProductsByCategory, ProductCard, TrustSection, types
│   ├── admin/              # SortableGalleryList
│   ├── ui/                 # Button, Card, Input, Label, Sheet, etc.
│   └── login-form.tsx
├── lib/                    # context, session, prisma, razorpay, email, auth, utils
├── prisma/schema.prisma
├── public/
└── next.config.ts
```

**Performance notes**

- `optimizePackageImports: ["lucide-react"]` in `next.config.ts` so only used icons are bundled.
- Admin: `jspdf` is loaded only when the user downloads shipping labels (dynamic import).
- Checkout: Razorpay script uses `strategy="lazyOnload"`.
- Images: use `next/image` with Cloudinary remote pattern; set `sizes` where possible.
