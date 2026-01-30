# STN Products E-Commerce Website

A full-featured e-commerce website built with Next.js, React, TypeScript, MongoDB, and Prisma.

## Features

- 🔐 **Authentication System**
  - User and Admin roles
  - OTP-based email verification
  - Password reset functionality
  - Secure JWT token-based authentication

- 🛍️ **E-Commerce Features**
  - Product listing with categories
  - Product detail pages
  - Shopping cart
  - Order management
  - Razorpay payment integration

- 👨‍💼 **Admin Dashboard**
  - Product management (Create, Read, Update, Delete)
  - Image upload to Cloudinary
  - Admin-only access

- 🎨 **Modern UI**
  - Responsive design
  - Clean and intuitive interface
  - Built with shadcn/ui components

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Database**: MongoDB
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Payment**: Razorpay
- **Image Storage**: Cloudinary
- **Email**: Nodemailer

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/stn_products"

# JWT Secret
JWT_SECRET="your-secret-key-change-in-production"

# Cloudinary
CLOUDINARY_URL=""
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# SMTP (for email)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed products from JSON file
npm run db:seed
```

### 4. Configure Admin Access

To enable admin access:

1. **Set Admin Email in `.env`:**
   ```env
   ADMIN_EMAIL=psmpasupathi009@gmail.com
   ```

2. **Optional - Create Admin User with Password:**
   ```bash
   npm run admin:create psmpasupathi009@gmail.com yourpassword123
   ```

   This creates a user with `role: 'admin'` in the User table.

**Note:** Admin detection is automatic based on `ADMIN_EMAIL`. When someone signs up or logs in with an email matching `ADMIN_EMAIL`, they are assigned the `admin` role.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   ├── admin/            # Admin dashboard
│   ├── cart/             # Shopping cart page
│   ├── login/            # Authentication pages
│   ├── orders/           # Order history
│   ├── products/         # Product pages
│   ├── profile/          # User profile
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # shadcn/ui components
│   └── Header.tsx        # Navigation header
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── cloudinary.ts     # Cloudinary integration
│   ├── context.tsx       # Auth context
│   ├── email.ts          # Email utilities
│   ├── prisma.ts         # Prisma client
│   ├── razorpay.ts       # Razorpay integration
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
└── scripts/
    └── seed-products.ts  # Product seeding script
```

## Admin Access

1. Set `ADMIN_EMAIL=psmpasupathi009@gmail.com` in your `.env` file
2. Register/login with the admin email (must match `ADMIN_EMAIL`)
3. Complete OTP verification and set password
4. You'll be automatically redirected to the admin dashboard
5. Access the admin dashboard from the profile page or directly at `/admin/dashboard`

**Authentication:** All users (including admins) are stored in the `User` table with a `role` field (`'user'` or `'admin'`). Admin role is automatically assigned when the email matches `ADMIN_EMAIL`.

## Payment Integration

The website uses Razorpay for payments. Make sure to:
1. Set up a Razorpay account
2. Get your API keys
3. Add them to the `.env` file
4. Configure webhooks if needed

## Image Upload

Images are uploaded to Cloudinary. Make sure to:
1. Set up a Cloudinary account
2. Get your credentials
3. Add them to the `.env` file

## Email Configuration

For OTP and password reset emails, configure SMTP settings:
- Gmail: Use App Password for SMTP_PASS
- Other providers: Update SMTP_HOST and SMTP_PORT accordingly

## License

MIT
