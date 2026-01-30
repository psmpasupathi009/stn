# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in all required values:
     - MongoDB connection string
     - JWT secret
     - Cloudinary credentials
     - Razorpay keys
     - SMTP credentials for email

3. **Set Up Database**
   ```bash
   # Generate Prisma Client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed products from JSON file
   npm run db:seed
   ```

4. **Create Admin User**
   ```bash
   npm run admin:create <admin-email> <password>
   ```
   
   Example:
   ```bash
   npm run admin:create admin@example.com mypassword123
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Admin Access

1. Make sure `ADMIN_EMAIL=psmpasupathi009@gmail.com` is set in your `.env` file
2. Go to `/login` or `/signup`
3. Enter the admin email (must match `ADMIN_EMAIL` in `.env`)
4. Complete the OTP verification
5. Set your password
6. You'll be automatically redirected to the admin dashboard
7. You can also access the admin dashboard from the profile page

**Note:** Admin detection is based on the `ADMIN_EMAIL` environment variable. When a user signs up or logs in with an email matching `ADMIN_EMAIL`, they are automatically assigned the `admin` role.

## Features Overview

### User Features
- Browse products by category
- Search products
- Add to cart
- Checkout with Razorpay
- View order history
- User profile management

### Admin Features
- Create/Edit/Delete products
- Upload product images to Cloudinary
- View all products
- Manage inventory

## Important Notes

1. **MongoDB**: Make sure MongoDB is running and accessible
2. **Email**: Configure SMTP for OTP and password reset emails
3. **Cloudinary**: Required for image uploads
4. **Razorpay**: Required for payment processing
5. **Admin Email**: Must match `ADMIN_EMAIL` in `.env` file (e.g., `ADMIN_EMAIL=psmpasupathi009@gmail.com`)

## Troubleshooting

### Database Connection Issues
- Check MongoDB is running
- Verify DATABASE_URL in .env
- Run `npm run db:push` again

### Image Upload Not Working
- Verify Cloudinary credentials
- Check CLOUDINARY_* environment variables

### Payment Not Working
- Verify Razorpay keys
- Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET

### Email Not Sending
- Check SMTP credentials
- For Gmail, use App Password
- Verify SMTP_HOST and SMTP_PORT
