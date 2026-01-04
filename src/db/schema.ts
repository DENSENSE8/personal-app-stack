import { pgTable, serial, text, jsonb, timestamp, integer, varchar } from 'drizzle-orm/pg-core';

// Folders Table: For navigation (left sidebar)
export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  parentId: integer('parent_id').references(() => folders.id), // Self-referencing for hierarchy
  type: varchar('type', { length: 50 }).default('recipe'), // 'recipe', 'project', etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Core Recipes Table: Stores main recipe data
export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  folderId: integer('folder_id').references(() => folders.id), // Link to folders for navigation
  instructions: jsonb('instructions').$type<string[] | { step: string; timer?: number }[]>(), // Array of steps, optionally with timers (e.g., [{step: "Mix", timer: 300}])
  checklists: jsonb('checklists').$type<{ item: string; checked: boolean }[]>(), // Editable checklists
  tools: jsonb('tools').$type<string[] | { name: string; link?: string }[]>(), // Array of tools, optionally with links
  photos: jsonb('photos').$type<string[]>().default([]), // Array of Vercel Blob URLs
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recipe Stacks Table: For quick content addition in recipe editor
export const recipeStacks = pgTable('recipe_stacks', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'ingredient', 'step', 'tool', 'checklist'
  content: jsonb('content').notNull(), // The actual content to add
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Optional: Integrations Table for API hooks (e.g., to other apps)
export const integrations = pgTable('integrations', {
  id: serial('id').primaryKey(),
  recipeId: integer('recipe_id').references(() => recipes.id),
  service: varchar('service', { length: 100 }), // e.g., 'Notion', 'Todoist'
  apiConfig: jsonb('api_config').$type<{ endpoint: string; key: string }>(), // Store API details securely
});

// Type exports for TypeScript
export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type RecipeStack = typeof recipeStacks.$inferSelect;
export type NewRecipeStack = typeof recipeStacks.$inferInsert;
export type Integration = typeof integrations.$inferSelect;
export type NewIntegration = typeof integrations.$inferInsert;
