#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/db/schema';

// Create the connection to your Neon database
const sql = neon(process.env.DATABASE_URL!);

// Create the Drizzle instance
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

    // Create default folders using Drizzle
    await db.insert(schema.folders).values([
      {
        name: 'Recipes',
        type: 'recipe',
        parentId: null,
      },
      {
        name: 'Projects',
        type: 'project',
        parentId: null,
      },
      {
        name: 'Reminders',
        type: 'reminder',
        parentId: null,
      },
    ]);

    console.log('🛠️ Creating default recipe stacks...');

    // Create default recipe stacks (for quick content addition)
    await db.insert(schema.recipeStacks).values([
      {
        name: 'Basic Ingredients',
        type: 'ingredient',
        content: [
          { id: 'flour', amount: '2', unit: 'cups', item: 'All-purpose flour', notes: '' },
          { id: 'sugar', amount: '1', unit: 'cup', item: 'Granulated sugar', notes: '' },
          { id: 'butter', amount: '1/2', unit: 'cup', item: 'Unsalted butter', notes: 'softened' },
          { id: 'eggs', amount: '2', unit: '', item: 'Large eggs', notes: '' },
          { id: 'milk', amount: '1', unit: 'cup', item: 'Whole milk', notes: '' }
        ],
        description: 'Basic baking ingredients template',
      },
      {
        name: 'Kitchen Tools',
        type: 'tool',
        content: [
          'Mixing bowls',
          'Measuring cups and spoons',
          'Whisk',
          'Spatula',
          'Baking sheet'
        ],
        description: 'Essential kitchen tools',
      },
      {
        name: 'Preparation Checklist',
        type: 'checklist',
        content: [
          { item: 'Preheat oven to 350°F', checked: false },
          { item: 'Grease baking pan', checked: false },
          { item: 'Gather all ingredients', checked: false },
          { item: 'Measure ingredients accurately', checked: false }
        ],
        description: 'Standard preparation checklist',
      },
      {
        name: 'Baking Steps',
        type: 'step',
        content: [
          { step: 'Preheat oven to 350°F (175°C)', timer: null },
          { step: 'Cream butter and sugar together until light and fluffy', timer: 180 },
          { step: 'Add eggs one at a time, beating well after each addition', timer: null },
          { step: 'Gradually add dry ingredients to wet mixture', timer: null },
          { step: 'Bake for 25-30 minutes or until golden brown', timer: 1500 }
        ],
        description: 'Basic baking process steps',
      },
    ]);

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
