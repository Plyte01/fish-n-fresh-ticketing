# FISH'N FRESH - Event Ticketing Platform

A modern, full-featured event ticketing platform built with Next.js, TypeScript, Prisma, and PostgreSQL. Features include event management, ticket sales, payment processing with Paystack, admin dashboard, QR code scanning, and PWA capabilities.

## 🚀 Features

- **Event Management**: Create, edit, and manage events with rich media support
- **Ticket Sales**: Secure ticket purchasing with Paystack payment integration
- **Admin Dashboard**: Comprehensive admin panel with role-based permissions
- **QR Code Scanning**: Check-in system with QR code generation and scanning
- **SEO Optimized**: Dynamic sitemaps, structured data, and meta tags
- **PWA Ready**: Offline support and mobile app-like experience
- **Responsive Design**: Beautiful UI that works on all devices
- **Dynamic Content**: Admin-editable homepage, contact info, and site settings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Payments**: Paystack
- **Image Handling**: Cloudinary
- **Authentication**: JWT-based admin authentication
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (for image uploads)
- Paystack account (for payments)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd fish-n-fresh
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong random string (32+ characters)
- `NEXT_PUBLIC_BASE_URL`: Your domain URL
- `CLOUDINARY_*`: Cloudinary credentials
- `PAYSTACK_*`: Paystack API keys
- `SEED_ADMIN_*`: Initial admin user credentials

### 3. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed initial data (admin user + permissions)
pnpm db:seed
```

### 4. Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🌐 Deployment on Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Vercel Deployment

1. Go to [Vercel](https://vercel.com) and import your GitHub repository
2. Configure environment variables in Vercel dashboard
3. Set build settings:
   - **Build Command**: `pnpm build`
   - **Install Command**: `pnpm install`
   - **Root Directory**: `./`

### 3. Database Setup on Production

After deployment, run migrations and seed:

```bash
# In Vercel dashboard, go to your project settings
# Add these environment variables and redeploy:
```

### 4. Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Check database connection
- [ ] Test admin login
- [ ] Verify payment integration
- [ ] Test image uploads
- [ ] Check SEO (sitemap, robots.txt)

## 📱 PWA Features

The app includes Progressive Web App capabilities:
- Offline functionality
- Install prompt for mobile/desktop
- Service worker for caching
- Responsive design optimized for mobile

## 🔐 Admin Access

Default admin credentials (change after first login):
- Email: As set in `SEED_ADMIN_EMAIL`
- Password: As set in `SEED_ADMIN_PASSWORD`

Admin features:
- Event management
- Ticket scanning and check-in
- Payment tracking
- Site customization
- User management

## 📚 API Documentation

Key API endpoints:
- `/api/admin/*` - Admin authentication and management
- `/api/public/*` - Public data (events, site settings)
- `/api/payments/*` - Payment processing
- `/api/tickets/*` - Ticket operations
- `/sitemap.xml` - Dynamic sitemap

## 🎨 Customization

The platform supports extensive customization:
- Homepage banner and content
- Event themes and branding
- Contact information
- SEO metadata
- Color schemes

All customizable through the admin dashboard.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and connection string is correct
2. **Environment Variables**: Double-check all required variables are set
3. **Build Errors**: Ensure all dependencies are installed with `pnpm install`
4. **Payment Issues**: Verify Paystack keys and webhook configurations

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
