#!/usr/bin/env node

/**
 * Database Setup Script for Vercel + Neon
 * Creates all required tables if they don't exist
 * Run with: node scripts/setup-db.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Check if tables exist by trying to count records
    try {
      await prisma.folder.count();
      console.log('✅ Folder table exists');
    } catch (e) {
      console.log('⚠️ Folder table does not exist - tables need to be created');
      console.log('Run: npx prisma db push');
      process.exit(1);
    }

    try {
      await prisma.checklist.count();
      console.log('✅ Checklist table exists');
    } catch (e) {
      console.log('⚠️ Checklist table missing');
    }

    try {
      await prisma.reminder.count();
      console.log('✅ Reminder table exists');
    } catch (e) {
      console.log('⚠️ Reminder table missing');
    }

    try {
      await prisma.recipe.count();
      console.log('✅ Recipe table exists');
    } catch (e) {
      console.log('⚠️ Recipe table missing');
    }

    console.log('✅ Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

