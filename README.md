# Michael Garisek Portfolio

A personal portfolio website with an integrated admin dashboard for managing checklists and recipes.

## Features

- **Public Portfolio**: Clean, minimal homepage with portfolio sections
- **Admin Dashboard**: Protected dashboard for managing personal data
- **Checklists**: Create, edit, and manage daily task lists with drag-and-drop reordering
- **Recipes**: Store and organize recipes with ingredients, tags, and images
- **Authentication**: Secure admin login with JWT-based sessions

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Neon PostgreSQL with Prisma ORM
- **Cache**: Upstash Redis for autocomplete
- **Storage**: Vercel Blob for image uploads
- **Auth**: NextAuth.js v5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```env
   DATABASE_URL=your_neon_postgres_url
   UPSTASH_REDIS_REST_URL=your_redis_url
   UPSTASH_REDIS_REST_TOKEN=your_redis_token
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   AUTH_SECRET=your_auth_secret
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

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
│   ├── page.tsx           # Public portfolio home
│   ├── login/             # Admin login
│   ├── dashboard/         # Protected admin dashboard
│   ├── checklists/        # Checklist management
│   ├── recipes/           # Recipe management
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── features/          # Feature-specific components
│   └── layout/            # Layout components
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   └── redis.ts           # Redis utilities
└── middleware.ts          # Route protection
```

## License

Private - Michael Garisek
