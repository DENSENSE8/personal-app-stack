import { NextRequest, NextResponse } from "next/server";
import { db, recipes } from "@/lib/db";
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);

    const result = await db.select().from(recipes).where(eq(recipes.id, recipeId));

    if (result.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);

    await db.delete(recipes).where(eq(recipes.id, recipeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recipeId = parseInt(id);
    const { title, description, folderId, instructions, checklists, tools, photos } = await req.json();

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (folderId !== undefined) updateData.folderId = folderId ? parseInt(folderId) : null;
    if (instructions !== undefined) updateData.instructions = instructions;
    if (checklists !== undefined) updateData.checklists = checklists;
    if (tools !== undefined) updateData.tools = tools;
    if (photos !== undefined) updateData.photos = photos;

    const result = await db.update(recipes)
      .set(updateData)
      .where(eq(recipes.id, recipeId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
