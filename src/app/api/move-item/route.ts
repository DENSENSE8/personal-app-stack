import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { itemId, itemType, newFolderId, newPosition } = await req.json();

    if (!itemId || !itemType) {
      return NextResponse.json({ error: "itemId and itemType are required" }, { status: 400 });
    }

    let result;

    switch (itemType) {
      case "checklist":
        result = await prisma.checklist.update({
          where: { id: itemId },
          data: { folderId: newFolderId || null },
        });
        break;

      case "reminder":
        result = await prisma.reminder.update({
          where: { id: itemId },
          data: { folderId: newFolderId || null },
        });
        break;

      case "recipe":
        result = await prisma.recipe.update({
          where: { id: itemId },
          data: { folderId: newFolderId || null },
        });
        break;

      case "checklistItem":
        result = await prisma.checklistItem.update({
          where: { id: itemId },
          data: { 
            ...(newPosition !== undefined && { position: newPosition }),
          },
        });
        break;

      case "reminderItem":
        result = await prisma.reminderItem.update({
          where: { id: itemId },
          data: { 
            ...(newPosition !== undefined && { position: newPosition }),
          },
        });
        break;

      case "folder":
        result = await prisma.folder.update({
          where: { id: itemId },
          data: { parentId: newFolderId || null },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error moving item:", error);
    return NextResponse.json({ error: "Failed to move item" }, { status: 500 });
  }
}

