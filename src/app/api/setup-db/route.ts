import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This endpoint creates all required database tables
// Call once after deployment: GET /api/setup-db?secret=create-tables-now
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Simple protection - require secret parameter
  if (secret !== "create-tables-now") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Execute raw SQL to create all tables
    await prisma.$executeRawUnsafe(`
      -- Create Folder table
      CREATE TABLE IF NOT EXISTS "Folder" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "parentId" TEXT,
        "type" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
      );

      -- Create Checklist table
      CREATE TABLE IF NOT EXISTS "Checklist" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "folderId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Checklist_pkey" PRIMARY KEY ("id")
      );

      -- Create ChecklistItem table
      CREATE TABLE IF NOT EXISTS "ChecklistItem" (
        "id" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "checked" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP(3),
        "position" INTEGER NOT NULL DEFAULT 0,
        "fileUrl" TEXT,
        "checklistId" TEXT NOT NULL,
        CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
      );

      -- Create Reminder table
      CREATE TABLE IF NOT EXISTS "Reminder" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "folderId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
      );

      -- Create ReminderItem table
      CREATE TABLE IF NOT EXISTS "ReminderItem" (
        "id" TEXT NOT NULL,
        "text" TEXT NOT NULL,
        "checked" BOOLEAN NOT NULL DEFAULT false,
        "completedAt" TIMESTAMP(3),
        "position" INTEGER NOT NULL DEFAULT 0,
        "fileUrl" TEXT,
        "reminderId" TEXT NOT NULL,
        CONSTRAINT "ReminderItem_pkey" PRIMARY KEY ("id")
      );

      -- Create Recipe table
      CREATE TABLE IF NOT EXISTS "Recipe" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "folderId" TEXT,
        "embeddedChecklistId" TEXT,
        "fileUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
      );
    `);

    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Folder_parentId_idx" ON "Folder"("parentId");
      CREATE INDEX IF NOT EXISTS "Folder_type_idx" ON "Folder"("type");
      CREATE INDEX IF NOT EXISTS "Checklist_folderId_idx" ON "Checklist"("folderId");
      CREATE INDEX IF NOT EXISTS "ChecklistItem_checklistId_position_idx" ON "ChecklistItem"("checklistId", "position");
      CREATE INDEX IF NOT EXISTS "Reminder_folderId_idx" ON "Reminder"("folderId");
      CREATE INDEX IF NOT EXISTS "ReminderItem_reminderId_position_idx" ON "ReminderItem"("reminderId", "position");
      CREATE INDEX IF NOT EXISTS "Recipe_folderId_idx" ON "Recipe"("folderId");
      CREATE INDEX IF NOT EXISTS "Recipe_embeddedChecklistId_idx" ON "Recipe"("embeddedChecklistId");
    `);

    // Add foreign key constraints
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" 
          FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "Checklist" ADD CONSTRAINT "Checklist_folderId_fkey" 
          FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_checklistId_fkey" 
          FOREIGN KEY ("checklistId") REFERENCES "Checklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_folderId_fkey" 
          FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "ReminderItem" ADD CONSTRAINT "ReminderItem_reminderId_fkey" 
          FOREIGN KEY ("reminderId") REFERENCES "Reminder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_folderId_fkey" 
          FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;

      DO $$ BEGIN
        ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_embeddedChecklistId_fkey" 
          FOREIGN KEY ("embeddedChecklistId") REFERENCES "Checklist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Verify tables were created
    const folderCount = await prisma.folder.count();
    const checklistCount = await prisma.checklist.count();
    const reminderCount = await prisma.reminder.count();
    const recipeCount = await prisma.recipe.count();

    return NextResponse.json({
      success: true,
      message: "All database tables created successfully!",
      tables: {
        Folder: { exists: true, count: folderCount },
        Checklist: { exists: true, count: checklistCount },
        Reminder: { exists: true, count: reminderCount },
        Recipe: { exists: true, count: recipeCount },
      },
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tables",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

