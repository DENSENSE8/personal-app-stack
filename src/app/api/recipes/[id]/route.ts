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
        blocks: {
          orderBy: { position: "asc" },
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

    // Delete recipe (blocks will cascade delete automatically)
    await prisma.recipe.delete({
      where: { id },
    });

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
    const { title, description, folderId, coverImage, tags, prepTime, cookTime, servings, blocks } = await req.json();

    // If blocks are provided, handle them separately
    if (blocks !== undefined) {
      // Delete all existing blocks
      await prisma.recipeBlock.deleteMany({
        where: { recipeId: id },
      });

      // Create new blocks
      if (blocks.length > 0) {
        await prisma.recipeBlock.createMany({
          data: blocks.map((block: any) => ({
            id: block.id.startsWith('temp-') ? undefined : block.id,
            recipeId: id,
            type: block.type,
            content: block.content,
            position: block.position,
            metadata: block.metadata || {},
          })),
        });
      }
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(folderId !== undefined && { folderId }),
        ...(coverImage !== undefined && { coverImage }),
        ...(tags !== undefined && { tags }),
        ...(prepTime !== undefined && { prepTime }),
        ...(cookTime !== undefined && { cookTime }),
        ...(servings !== undefined && { servings }),
      },
      include: {
        blocks: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
