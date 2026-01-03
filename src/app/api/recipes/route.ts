import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const recipes = await prisma.recipe.findMany({
      where: {
        ...(folderId && { folderId }),
        ...(search && { 
          title: { 
            contains: search, 
            mode: "insensitive" 
          } 
        }),
      },
      include: {
        blocks: {
          orderBy: { position: "asc" },
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
    const { title, description, folderId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: description || null,
        folderId: folderId || null,
        tags: [],
      },
      include: {
        blocks: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
