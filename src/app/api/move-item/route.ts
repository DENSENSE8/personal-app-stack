import { NextRequest, NextResponse } from "next/server";
import { db, recipes, folders } from "@/lib/db";
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const { itemId, itemType, newFolderId } = await req.json();

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    let result;

    switch (itemType) {
      case "recipe":
        result = await db.update(recipes)
          .set({
            folderId: newFolderId ? parseInt(newFolderId) : null,
            updatedAt: new Date()
          })
          .where(eq(recipes.id, parseInt(itemId)))
          .returning();
        break;

      case "folder":
        result = await db.update(folders)
          .set({
            parentId: newFolderId ? parseInt(newFolderId) : null,
            updatedAt: new Date()
          })
          .where(eq(folders.id, parseInt(itemId)))
          .returning();
        break;

      default:
        return NextResponse.json({ error: "Invalid item type. Only 'recipe' and 'folder' are supported." }, { status: 400 });
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error moving item:", error);
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 });
  }
}
