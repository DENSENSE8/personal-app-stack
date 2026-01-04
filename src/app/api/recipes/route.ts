import { NextRequest, NextResponse } from "next/server";
import { db, recipes } from "@/lib/db";
import { eq, ilike, and } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    let query = db.select().from(recipes);

    // Apply filters
    if (folderId && search) {
      query = query.where(and(
        eq(recipes.folderId, parseInt(folderId)),
        ilike(recipes.title, `%${search}%`)
      ));
    } else if (folderId) {
      query = query.where(eq(recipes.folderId, parseInt(folderId)));
    } else if (search) {
      query = query.where(ilike(recipes.title, `%${search}%`));
    }

    const result = await query.orderBy(recipes.createdAt);

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
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
