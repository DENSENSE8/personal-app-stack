import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

async function getAdminUser() {
  let user = await prisma.user.findFirst({
    where: { email: "admin@michaelgarisek.com" },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "admin@michaelgarisek.com",
        password: "admin",
        name: "Michael Garisek",
      },
    });
  }
  
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const user = await getAdminUser();

    const recipes = await prisma.recipe.findMany({
      where: {
        userId: user.id,
        ...(folderId && { folderId }),
        ...(search && { 
          title: { 
            contains: search, 
            mode: "insensitive" 
          } 
        }),
      },
      include: {
        steps: {
          orderBy: { order: "asc" },
        },
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, folderId, prepTime, servings } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const user = await getAdminUser();

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: description || null,
        userId: user.id,
        folderId: folderId || null,
        prepTime: prepTime || null,
        servings: servings || null,
      },
      include: {
        steps: true,
        ingredients: {
          include: {
            ingredient: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
