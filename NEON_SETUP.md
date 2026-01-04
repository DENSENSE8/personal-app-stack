# Neon DB Setup Guide

This guide explains how to set up Neon DB with Drizzle ORM for your personal app stack.

## Architecture Overview

- **Folders**: Used for navigation in the left sidebar - hierarchical organization for recipes/projects
- **Recipes**: Main content with JSONB fields for flexible recipe editing
- **Recipe Stacks**: Quick-add content templates for recipe editing (ingredients, tools, checklists, steps)
- **Integrations**: API hooks for external services

## Prerequisites

1. **Neon Account**: Sign up at [neon.tech](https://neon.tech)
2. **Redis Account**: Sign up at [upstash.com](https://upstash.com) for Redis
3. **Vercel Blob**: For file storage (photos)

## Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Neon Database
DATABASE_URL=postgres://user:password@your-project.neon.tech/db-name?sslmode=require

# Redis (Upstash)
REDIS_URL=https://your-redis-url.upstash.io
REDIS_TOKEN=your-redis-token

# Vercel Blob (for file uploads)
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

## Database Setup

1. **Create Neon Project**:
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Initialize Database Schema**:
   ```bash
   # Run the complete setup script (creates tables + default data)
   npx tsx scripts/setup-db.ts
   ```

3. **Verify Setup**:
   - Check your Neon console to see the created tables: `folders`, `recipes`, `recipe_stacks`, `integrations`

## API Routes

The following API routes are now available:

### Recipes
- `GET /api/recipes` - List recipes (with optional folderId and search filters)
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Get specific recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

### Folders (Navigation)
- `GET /api/folders` - List folders (with optional type filter)
- `POST /api/folders` - Create new folder
- `GET /api/folders/[id]` - Get specific folder
- `PUT /api/folders/[id]` - Update folder
- `DELETE /api/folders/[id]` - Delete folder

### Recipe Stacks (Quick Content Addition)
- `GET /api/stacks` - List recipe stacks (with optional type filter)
- `POST /api/stacks` - Create new recipe stack
- `GET /api/stacks/[id]` - Get specific recipe stack
- `PUT /api/stacks/[id]` - Update recipe stack
- `DELETE /api/stacks/[id]` - Delete recipe stack

### File Upload
- `POST /api/upload` - Upload files to Vercel Blob

## Schema Overview

### Folders Table (Navigation)
- `id`: Primary key (integer)
- `name`: Folder name
- `parentId`: Self-reference for hierarchy
- `type`: 'recipe', 'project', 'reminder', etc.
- `createdAt`, `updatedAt`: Timestamps

### Recipes Table
- `id`: Primary key (integer)
- `title`: Recipe title
- `description`: Optional description
- `folderId`: Reference to folders table (for navigation)
- `instructions`: JSONB array of steps (with optional timers)
- `checklists`: JSONB array of checklist items
- `tools`: JSONB array of tools (with optional links)
- `photos`: JSONB array of Vercel Blob URLs
- `createdAt`, `updatedAt`: Timestamps

### Recipe Stacks Table (Quick Content Addition)
- `id`: Primary key (integer)
- `name`: Stack name (e.g., "Basic Ingredients")
- `type`: Content type ('ingredient', 'step', 'tool', 'checklist')
- `content`: JSONB content to add to recipes
- `description`: Optional description
- `createdAt`: Timestamp

### Integrations Table
- `id`: Primary key (integer)
- `recipeId`: Reference to recipes
- `service`: External service name (Notion, Todoist, etc.)
- `apiConfig`: JSONB with API credentials

## Usage Examples

### Creating a Recipe
```typescript
const response = await fetch('/api/recipes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Chocolate Chip Cookies',
    description: 'Classic homemade cookies',
    folderId: 1, // ID of the folder (for navigation)
    instructions: [
      { step: 'Mix dry ingredients', timer: 300 }, // 5 minutes
      'Add wet ingredients',
      'Fold in chocolate chips'
    ],
    checklists: [
      { item: 'Preheat oven', checked: false },
      { item: 'Grease baking sheet', checked: true }
    ],
    tools: ['mixing bowl', 'baking sheet'],
    photos: []
  })
});
```

### Creating a Recipe Stack (Quick Content Template)
```typescript
const response = await fetch('/api/stacks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Cookie Ingredients',
    type: 'ingredient',
    content: [
      { id: 'flour', amount: '2 1/4', unit: 'cups', item: 'All-purpose flour', notes: '' },
      { id: 'baking_soda', amount: '1', unit: 'tsp', item: 'Baking soda', notes: '' },
      { id: 'salt', amount: '1', unit: 'tsp', item: 'Salt', notes: '' },
      { id: 'butter', amount: '1', unit: 'cup', item: 'Unsalted butter', notes: 'softened' },
      { id: 'sugar', amount: '3/4', unit: 'cup', item: 'Granulated sugar', notes: '' },
      { id: 'brown_sugar', amount: '3/4', unit: 'cup', item: 'Brown sugar', notes: 'packed' },
      { id: 'eggs', amount: '2', unit: '', item: 'Large eggs', notes: '' },
      { id: 'vanilla', amount: '2', unit: 'tsp', item: 'Vanilla extract', notes: '' },
      { id: 'chocolate_chips', amount: '2', unit: 'cups', item: 'Chocolate chips', notes: '' }
    ],
    description: 'Complete ingredient list for chocolate chip cookies'
  })
});
```

### Uploading Photos
```typescript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const { url } = await response.json();
// Add url to recipe.photos array
```

## Development Commands

```bash
# Generate migrations (if using migrations instead of push)
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly to database
npm run db:push

# Run setup script
npx tsx scripts/setup-db.ts
```

## Architecture Summary

### Separation of Concerns
- **Folders**: Pure navigation structure (left sidebar) - hierarchical organization
- **Recipes**: Content with flexible JSONB fields for instructions, checklists, tools, photos
- **Recipe Stacks**: Quick-add content templates for recipe editing (ingredients, steps, tools, checklists)

### Default Data Created
- **Folders**: Recipes, Projects, Reminders
- **Recipe Stacks**: Basic Ingredients, Kitchen Tools, Preparation Checklist, Baking Steps

## Redis Integration

Redis is used for:
- Caching recipe data (1-hour expiration)
- Search indexing (basic implementation)
- Fast lookups for frequently accessed data

## Next Steps

1. Set up your Neon database and get the DATABASE_URL
2. Run `npx tsx scripts/setup-db.ts` to initialize everything
3. Update your frontend to use folderId for navigation in the left sidebar
4. Add recipe stack integration to your recipe editor for quick content addition
5. Deploy to Vercel with environment variables
