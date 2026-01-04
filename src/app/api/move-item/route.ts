import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { itemId, itemType, newFolderId } = await req.json();

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    let result;

    switch (itemType) {
      case "recipe":
        result = await sql`
          UPDATE "Recipe"
          SET "folderId" = ${newFolderId || null}, "updatedAt" = ${now}
          WHERE id = ${itemId}
          RETURNING *
        `;
        break;

      case "folder":
        result = await sql`
          UPDATE "Folder"
          SET "parentId" = ${newFolderId || null}, "updatedAt" = ${now}
          WHERE id = ${itemId}
          RETURNING *
        `;
        break;

      default:
        return NextResponse.json({ error: "Invalid item type. Only 'recipe' and 'folder' are supported." }, { status: 400 });
    }

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error moving item:", error);
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 });
  }
}
