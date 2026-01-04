import { NextRequest, NextResponse } from "next/server";
import { db, recipeStacks } from "@/lib/db";
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let query = db.select().from(recipeStacks);

    if (type) {
      query = query.where(eq(recipeStacks.type, type));
    }

    const result = await query.orderBy(recipeStacks.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching recipe stacks:", error);
    return NextResponse.json({ error: "Failed to fetch recipe stacks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type, content, description } = await req.json();

    if (!name || !type || !content) {
      return NextResponse.json({ error: "Name, type, and content are required" }, { status: 400 });
    }

    const result = await db.insert(recipeStacks).values({
      name,
      type,
      content,
      description: description || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating recipe stack:", error);
    return NextResponse.json({ error: "Failed to create recipe stack" }, { status: 500 });
  }
}
