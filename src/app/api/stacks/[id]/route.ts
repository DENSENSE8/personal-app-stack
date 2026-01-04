import { NextRequest, NextResponse } from "next/server";
import { db, recipeStacks } from "@/lib/db";
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stackId = parseInt(id);

    const result = await db.select().from(recipeStacks).where(eq(recipeStacks.id, stackId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Recipe stack not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching recipe stack:", error);
    return NextResponse.json({ error: "Failed to fetch recipe stack" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stackId = parseInt(id);
    const { name, type, content, description } = await req.json();

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (content !== undefined) updateData.content = content;
    if (description !== undefined) updateData.description = description;

    const result = await db.update(recipeStacks)
      .set(updateData)
      .where(eq(recipeStacks.id, stackId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Recipe stack not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating recipe stack:", error);
    return NextResponse.json({ error: "Failed to update recipe stack" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stackId = parseInt(id);

    await db.delete(recipeStacks).where(eq(recipeStacks.id, stackId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe stack:", error);
    return NextResponse.json({ error: "Failed to delete recipe stack" }, { status: 500 });
  }
}
