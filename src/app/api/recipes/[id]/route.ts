import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { indexRecipe } from "@/lib/redis";
import { z } from "zod";

const updateRecipeSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  prepTime: z.number().optional(),
  servings: z.number().optional(),
  imageUrl: z.string().optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1),
    quantity: z.string().min(1),
    unit: z.string().optional(),
  })).optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id },
    include: {
      ingredients: { include: { ingredient: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateRecipeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, prepTime, servings, imageUrl, ingredients, tags } = parsed.data;

    if (ingredients) {
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    }

    if (tags) {
      await prisma.tagsOnRecipes.deleteMany({ where: { recipeId: id } });
    }

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(prepTime !== undefined && { prepTime }),
        ...(servings !== undefined && { servings }),
        ...(imageUrl !== undefined && { imageUrl }),
        ingredients: ingredients ? {
          create: await Promise.all(
            ingredients.map(async (ing) => {
              const ingredient = await prisma.ingredient.upsert({
                where: { name: ing.name.toLowerCase() },
                update: {},
                create: { name: ing.name.toLowerCase(), unit: ing.unit },
              });
              return {
                ingredientId: ingredient.id,
                quantity: ing.quantity,
              };
            })
          ),
        } : undefined,
        tags: tags ? {
          create: await Promise.all(
            tags.map(async (tagName) => {
              const tag = await prisma.tag.upsert({
                where: { name: tagName.toLowerCase() },
                update: {},
                create: { name: tagName.toLowerCase() },
              });
              return { tagId: tag.id };
            })
          ),
        } : undefined,
      },
      include: {
        ingredients: { include: { ingredient: true } },
        tags: { include: { tag: true } },
      },
    });

    if (title || tags || ingredients) {
      await indexRecipe(
        recipe.title,
        recipe.tags.map((t) => t.tag.name),
        recipe.ingredients.map((i) => i.ingredient.name)
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Update recipe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recipe.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

