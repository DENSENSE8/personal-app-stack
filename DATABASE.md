# Database Setup Guide

This project uses **Neon PostgreSQL** with direct SQL queries via `@vercel/postgres`.

## Environment Variables

Set the following in your `.env` file:

```env
POSTGRES_URL=your_neon_postgres_connection_string
```

## Database Setup

### Option 1: Via API Endpoint (Recommended)

Visit the following URL after deploying or running locally:

```
http://localhost:3000/api/setup-db?secret=create-tables-now
```

This will automatically create all required tables.

### Option 2: Manual SQL Execution

Connect to your Neon database and run the SQL from `src/lib/db.ts` (exported as `CREATE_TABLES_SQL`).

## Database Schema

### Folder Table
Hierarchical folder structure for organizing recipes.

```sql
CREATE TABLE "Folder" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE
);
```

**Indexes:**
- `parentId`
- `type`

### Recipe Table
Stores recipe information including metadata like prep time, cook time, and servings.

```sql
CREATE TABLE "Recipe" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "folderId" TEXT,
  "coverImage" TEXT,
  "tags" TEXT[] DEFAULT '{}',
  "prepTime" INTEGER,
  "cookTime" INTEGER,
  "servings" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL
);
```

**Indexes:**
- `folderId`

### RecipeBlock Table
Block-based content for recipes (ingredients, steps, images, etc.).

```sql
CREATE TABLE "RecipeBlock" (
  "id" TEXT PRIMARY KEY,
  "recipeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "position" INTEGER DEFAULT 0,
  "metadata" JSONB,
  FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE
);
```

**Indexes:**
- `recipeId, position` (composite)
- `type`

**Block Types:**
- `text` - Rich text content
- `heading` - Section headings
- `image` - Image blocks
- `checklist` - Checklist items
- `video` - Video embeds
- `divider` - Visual dividers
- `quote` - Quoted text
- `ingredients` - Ingredient lists
- `steps` - Step-by-step instructions

## API Routes

All database operations are handled through Next.js API routes:

### Folders
- `GET /api/folders` - List all folders (optional `?type=recipe` filter)
- `POST /api/folders` - Create a new folder
- `PUT /api/folders/[id]` - Update a folder
- `DELETE /api/folders/[id]` - Delete a folder

### Recipes
- `GET /api/recipes` - List all recipes (optional `?folderId=...` and `?search=...` filters)
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/[id]` - Get a specific recipe with blocks
- `PUT /api/recipes/[id]` - Update a recipe and its blocks
- `DELETE /api/recipes/[id]` - Delete a recipe

### Move Items
- `POST /api/move-item` - Move a recipe or folder to a different folder

## Helper Functions

Located in `src/lib/db.ts`:

- `generateId()` - Generates a unique ID similar to Prisma's CUID
- `query(text, params)` - Execute raw SQL queries
- `CREATE_TABLES_SQL` - SQL script for table creation

## Migration from Prisma

This project previously used Prisma ORM. The migration to direct SQL provides:

✅ **Faster builds** - No code generation step
✅ **Better control** - Direct SQL queries for complex operations
✅ **Smaller bundle** - No Prisma client overhead
✅ **Same functionality** - All features preserved

All Prisma queries have been replaced with equivalent SQL queries using `@vercel/postgres`.

