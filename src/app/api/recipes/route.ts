import { NextRequest, NextResponse } from "next/server";
import { db, recipes } from "@/lib/db";
import { eq, ilike, and, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    const baseQuery = db.select().from(recipes);

    let result;
    if (folderId && search) {
      result = await baseQuery.where(and(
        eq(recipes.folderId, parseInt(folderId)),
        ilike(recipes.title, `%${search}%`)
      )).orderBy(desc(recipes.createdAt));
    } else if (folderId) {
      result = await baseQuery.where(eq(recipes.folderId, parseInt(folderId))).orderBy(desc(recipes.createdAt));
    } else if (search) {
      result = await baseQuery.where(ilike(recipes.title, `%${search}%`)).orderBy(desc(recipes.createdAt));
    } else {
      result = await baseQuery.orderBy(desc(recipes.createdAt));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, folderId, instructions, checklists, tools, photos } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const result = await db.insert(recipes).values({
      title,
      description: description || null,
      folderId: folderId ? parseInt(folderId) : null,
      instructions: instructions || [],
      checklists: checklists || [],
      tools: tools || [],
      photos: photos || [],
    }).returning() as any[];

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
