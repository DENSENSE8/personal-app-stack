import { NextRequest, NextResponse } from "next/server";
import { db, folders } from "@/lib/db";
import { eq } from 'drizzle-orm';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = parseInt(id);

    await db.delete(folders).where(eq(folders.id, folderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const folderId = parseInt(id);
    const { name, parentId } = await req.json();

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (parentId !== undefined) updateData.parentId = parentId ? parseInt(parentId) : null;

    const result = await db.update(folders)
      .set(updateData)
      .where(eq(folders.id, folderId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}
