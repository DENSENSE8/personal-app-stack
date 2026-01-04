import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await sql`
      DELETE FROM "Folder"
      WHERE id = ${id}
    `;

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
    const { name, parentId } = await req.json();

    const now = new Date().toISOString();

    // Build update query dynamically
    const updates: string[] = ['"updatedAt" = $3'];
    const values: any[] = [id];
    let paramCount = 2;

    if (name !== undefined) {
      updates.push(`"name" = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (parentId !== undefined) {
      updates.push(`"parentId" = $${paramCount}`);
      values.push(parentId);
      paramCount++;
    }

    values.push(now); // updatedAt

    const result = await sql.query(
      `UPDATE "Folder" SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating folder:", error);
    return NextResponse.json({ error: "Failed to update folder" }, { status: 500 });
  }
}
