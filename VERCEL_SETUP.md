# Vercel Deployment Setup

## Required Environment Variables

Before deploying to Vercel, make sure to set these environment variables in your Vercel project dashboard:

### Database
```
DATABASE_URL=your_neon_postgresql_connection_string
```

Get your Neon PostgreSQL connection string from:
1. Go to https://neon.tech
2. Create/select your project
3. Copy the connection string (starts with `postgresql://`)

### Optional (if using these features)
```
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
AUTH_SECRET=your_random_secret_string
```

## Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (first time only):
   ```bash
   vercel link
   ```

4. **Set environment variables**:
   ```bash
   vercel env add DATABASE_URL production
   # Paste your Neon PostgreSQL URL when prompted
   ```

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## What Happens During Build

The `vercel-build` script will:
1. Generate Prisma Client
2. Push the schema to your database (creates/updates tables)
3. Build the Next.js application

**Important**: Make sure your DATABASE_URL is set in Vercel's environment variables BEFORE deploying, as the build process needs it to push the schema.

## Local Development with Mapped Drive

Since you're using a network drive, map it first:

```powershell
# Map network drive
net use Z: "\\densense-1\personal_folder\Michael Garisek Portoflio" /persistent:yes

# Navigate to project
cd Z:\personal-app-stack

# Install dependencies
npm install

# Run dev server
npm run dev
```

## Troubleshooting

### "Prisma schema validation error"
- Make sure you're using Prisma 6.9.0 (not 7.x)
- Run: `npm install` to ensure correct versions

### "DATABASE_URL not found"
- Set it in Vercel dashboard under Settings → Environment Variables
- Must be set for Production, Preview, and Development environments

### "Table already exists"
- The `--accept-data-loss` flag handles schema changes
- Vercel will automatically migrate your database on each deploy

