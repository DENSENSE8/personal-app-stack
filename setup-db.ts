#!/usr/bin/env tsx

import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './src/db/schema';

// Set DATABASE_URL directly (temporarily for setup)
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_5BSJ6YzQjvaL@ep-old-meadow-ah5ydrzj-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Create the connection to your Neon database
const sql = neon(process.env.DATABASE_URL);

// Create the Drizzle instance with schema
const db = drizzle(sql, { schema });

async function setupDatabase() {
  console.log('🚀 Setting up Neon database with Drizzle ORM...');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await sql`SELECT 1`;
    console.log('✅ Database connection successful!');

    // Create tables manually using raw SQL for guaranteed execution
    console.log('📝 Creating database tables...');

    // Create folders table
    await sql`
      CREATE TABLE IF NOT EXISTS folders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        parent_id INTEGER REFERENCES folders(id),
        type VARCHAR(50) DEFAULT 'recipe',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create recipes table
    await sql`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        folder_id INTEGER REFERENCES folders(id),
        instructions JSONB,
        checklists JSONB,
        tools JSONB,
        photos JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create recipe_stacks table
    await sql`
      CREATE TABLE IF NOT EXISTS recipe_stacks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create integrations table
    await sql`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER REFERENCES recipes(id),
        service VARCHAR(100),
        api_config JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create indexes
    console.log('🔍 Creating database indexes...');
    await sql`CREATE INDEX IF NOT EXISTS folders_parent_id_idx ON folders(parent_id)`;
    await sql`CREATE INDEX IF NOT EXISTS folders_type_idx ON folders(type)`;
    await sql`CREATE INDEX IF NOT EXISTS recipes_folder_id_idx ON recipes(folder_id)`;
    await sql`CREATE INDEX IF NOT EXISTS recipe_stacks_type_idx ON recipe_stacks(type)`;

    console.log('📁 Creating default folders...');

    // Create default folders using raw SQL to avoid Drizzle compatibility issues
    await sql`INSERT INTO folders (name, type, parent_id) VALUES ('Recipes', 'recipe', NULL)`;
    await sql`INSERT INTO folders (name, type, parent_id) VALUES ('Projects', 'project', NULL)`;
    await sql`INSERT INTO folders (name, type, parent_id) VALUES ('Reminders', 'reminder', NULL)`;

    console.log('🛠️ Creating default recipe stacks...');

    // Create default recipe stacks using raw SQL
    await sql`INSERT INTO recipe_stacks (name, type, content, description) VALUES ('Basic Ingredients', 'ingredient', '[{"id": "flour", "amount": "2", "unit": "cups", "item": "All-purpose flour", "notes": ""}, {"id": "sugar", "amount": "1", "unit": "cup", "item": "Granulated sugar", "notes": ""}, {"id": "butter", "amount": "1/2", "unit": "cup", "item": "Unsalted butter", "notes": "softened"}, {"id": "eggs", "amount": "2", "unit": "", "item": "Large eggs", "notes": ""}, {"id": "milk", "amount": "1", "unit": "cup", "item": "Whole milk", "notes": ""}]', 'Basic baking ingredients template')`;

    await sql`INSERT INTO recipe_stacks (name, type, content, description) VALUES ('Kitchen Tools', 'tool', '["Mixing bowls", "Measuring cups and spoons", "Whisk", "Spatula", "Baking sheet"]', 'Essential kitchen tools')`;

    await sql`INSERT INTO recipe_stacks (name, type, content, description) VALUES ('Preparation Checklist', 'checklist', '[{"item": "Preheat oven to 350°F", "checked": false}, {"item": "Grease baking pan", "checked": false}, {"item": "Gather all ingredients", "checked": false}, {"item": "Measure ingredients accurately", "checked": false}]', 'Standard preparation checklist')`;

    await sql`INSERT INTO recipe_stacks (name, type, content, description) VALUES ('Baking Steps', 'step', '[{"step": "Preheat oven to 350°F (175°C)", "timer": null}, {"step": "Cream butter and sugar together until light and fluffy", "timer": 180}, {"step": "Add eggs one at a time, beating well after each addition", "timer": null}, {"step": "Gradually add dry ingredients to wet mixture", "timer": null}, {"step": "Bake for 25-30 minutes or until golden brown", "timer": 1500}]', 'Basic baking process steps')`;

    console.log('✅ Database setup completed successfully!');
    console.log('📊 Tables created: folders, recipes, recipe_stacks, integrations');
    console.log('📁 Default folders: Recipes, Projects, Reminders');
    console.log('🛠️ Default stacks: Basic Ingredients, Kitchen Tools, Preparation Checklist, Baking Steps');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);
