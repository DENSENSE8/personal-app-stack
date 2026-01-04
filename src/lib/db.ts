import { sql } from "@vercel/postgres";

export { sql };

// Helper function for query execution
export async function query(text: string, params?: any[]) {
  const result = await sql.query(text, params);
  return result;
}

// Generate a CUID-like ID (similar to Prisma's default)
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomStr}`;
}

// SQL table creation queries
export const CREATE_TABLES_SQL = `
-- Create Folder table
CREATE TABLE IF NOT EXISTS "Folder" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Folder_parentId_idx" ON "Folder"("parentId");
CREATE INDEX IF NOT EXISTS "Folder_type_idx" ON "Folder"("type");

-- Create Recipe table
CREATE TABLE IF NOT EXISTS "Recipe" (
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

CREATE INDEX IF NOT EXISTS "Recipe_folderId_idx" ON "Recipe"("folderId");

-- Create RecipeBlock table
CREATE TABLE IF NOT EXISTS "RecipeBlock" (
  "id" TEXT PRIMARY KEY,
  "recipeId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "content" JSONB NOT NULL,
  "position" INTEGER DEFAULT 0,
  "metadata" JSONB,
  FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "RecipeBlock_recipeId_position_idx" ON "RecipeBlock"("recipeId", "position");
CREATE INDEX IF NOT EXISTS "RecipeBlock_type_idx" ON "RecipeBlock"("type");
`;
