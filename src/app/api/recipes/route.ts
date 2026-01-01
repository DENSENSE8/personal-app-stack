import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { indexRecipe } from "@/lib/redis";
import { z } from "zod";

const createRecipeSchema = z.object({
  title: z.string().min(1),
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

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const tag = searchParams.get("tag");

  const where: {
    userId: string;
    title?: { contains: string; mode: "insensitive" };
    tags?: { some: { tag: { name: string } } };
  } = {
    userId: session.user.id,
  };

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (tag) {
    where.tags = { some: { tag: { name: tag } } };
  }

  const recipes = await prisma.recipe.findMany({
    where,
    include: {
      ingredients: { include: { ingredient: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createRecipeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, description, prepTime, servings, imageUrl, ingredients, tags } = parsed.data;

    const recipe = await prisma.recipe.create({
      data: {
        userId: session.user.id,
        title,
        description,
        prepTime,
        servings,
        imageUrl,
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

    await indexRecipe(
      title,
      tags ?? [],
      ingredients?.map((i) => i.name) ?? []
    );

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Create recipe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

