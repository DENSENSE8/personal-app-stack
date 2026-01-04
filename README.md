# Michael Garisek Portfolio

A personal portfolio website with an integrated admin dashboard for managing recipes.

## Features

- **Public Portfolio**: Clean, minimal white homepage with portfolio sections
- **Admin Dashboard**: Protected dashboard with floating navigation
- **Folder Organization**: Hierarchical folder structure for recipes
- **Recipes**: Store and organize recipes with rich content blocks
- **File Uploads**: Attach images to recipe blocks
- **Smooth Scrolling**: Lenis smooth scroll throughout the site

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Neon PostgreSQL with direct SQL (@vercel/postgres)
- **Cache**: Upstash Redis for autocomplete
- **Storage**: Vercel Blob for file uploads
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Smooth Scroll**: Lenis

## Page Structure

```
/                          # Public portfolio homepage
/login                     # Admin login page
/dashboard                 # Protected dashboard home
/admin/recipes             # Recipe management with folders
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```env
   POSTGRES_URL=your_neon_postgres_url
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   AUTH_SECRET=your_auth_secret
   ```

3. Create database tables:
   Visit `/api/setup-db?secret=create-tables-now` to create all required tables.

4. Run development server:
   ```bash
   npm run dev
   ```

## Admin Access

- URL: `/login`
- Username: `admin`
- Password: `admin`

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Public portfolio home
│   ├── login/page.tsx              # Admin login
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout
│   │   ├── page.tsx                # Dashboard home
│   │   └── recipes/                # Recipe management (dynamic)
│   └── api/
│       ├── folders/                # Folder CRUD
│       ├── recipes/                # Recipe CRUD
│       └── upload/                 # File upload
├── components/
│   ├── dashboard/
│   │   ├── FloatingMenu.tsx        # Bottom FAB navigation
│   │   └── FolderSidebar.tsx       # Folder tree sidebar
│   ├── ui/                         # Reusable UI components
│   └── layout/
│       ├── Providers.tsx           # Session + Lenis providers
│       └── SmoothScroll.tsx        # Lenis smooth scroll
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── db.ts                       # Direct SQL utilities
│   └── redis.ts                    # Redis utilities
└── middleware.ts                   # Route protection
```

## Database Schema

- **User**: Account with email/password
- **Folder**: Hierarchical organization for recipes
- **Recipe**: Recipes with ingredients, tags, and prep steps

## License

Private - Michael Garisek
