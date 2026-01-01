# Michael Garisek Portfolio

A personal portfolio website with an integrated admin dashboard for managing checklists, recipes, and reminders.

## Features

- **Public Portfolio**: Clean, minimal white homepage with portfolio sections
- **Admin Dashboard**: Protected dashboard with floating navigation
- **Folder Organization**: Hierarchical folder structure for all items
- **Checklists**: Create, edit, and manage task lists with completion tracking
- **Recipes**: Store and organize recipes with prep steps and ingredients
- **Reminders**: Keep track of important items with due dates
- **File Uploads**: Attach videos to checklist/reminder items
- **Smooth Scrolling**: Lenis smooth scroll throughout the site

## Tech Stack

- **Framework**: Next.js 16
- **Database**: Neon PostgreSQL with Prisma ORM
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
/dashboard/recipes         # Recipe management with folders
/dashboard/checklists      # Checklist management with folders
/dashboard/reminders       # Reminder management with folders
```

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
│   ├── page.tsx                    # Public portfolio home
│   ├── login/page.tsx              # Admin login
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout with FAB
│   │   ├── page.tsx                # Dashboard home
│   │   ├── recipes/page.tsx        # Recipe management
│   │   ├── checklists/page.tsx     # Checklist management
│   │   └── reminders/page.tsx      # Reminder management
│   └── api/
│       ├── folders/                # Folder CRUD
│       ├── checklists/             # Checklist CRUD
│       ├── recipes/                # Recipe CRUD
│       ├── reminders/              # Reminder CRUD
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
│   ├── db.ts                       # Prisma client
│   └── redis.ts                    # Redis utilities
└── middleware.ts                   # Route protection
```

## Database Schema

- **User**: Account with email/password
- **Folder**: Hierarchical organization (recipe/checklist/reminder types)
- **Checklist**: Task lists with items
- **ChecklistItem**: Individual tasks with completion tracking
- **Reminder**: Reminder lists with items and due dates
- **ReminderItem**: Individual reminders with completion tracking
- **Recipe**: Recipes with ingredients, tags, and prep steps
- **RecipeStep**: Prep checklist for recipes

## License

Private - Michael Garisek
