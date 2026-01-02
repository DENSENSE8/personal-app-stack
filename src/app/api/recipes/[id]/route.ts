import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        embeddedChecklist: {
          include: {
            items: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe);
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

    // Get recipe to find embedded checklist
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      select: { embeddedChecklistId: true },
    });

    // Delete recipe first
    await prisma.recipe.delete({
      where: { id },
    });

    // Delete embedded checklist if exists
    if (recipe?.embeddedChecklistId) {
      await prisma.checklist.delete({
        where: { id: recipe.embeddedChecklistId },
      }).catch(() => {}); // Ignore if already deleted
    }

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
    const { title, description, folderId, fileUrl } = await req.json();

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(folderId !== undefined && { folderId }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
      include: {
        embeddedChecklist: {
          include: {
            items: true,
          },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
