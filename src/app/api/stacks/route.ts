import { NextRequest, NextResponse } from "next/server";
import { db, recipeStacks } from "@/lib/db";
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const baseQuery = db.select().from(recipeStacks);

    let result;
    if (type) {
      result = await baseQuery.where(eq(recipeStacks.type, type)).orderBy(desc(recipeStacks.createdAt));
    } else {
      result = await baseQuery.orderBy(desc(recipeStacks.createdAt));
    }

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
    }).returning() as any[];

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Failed to create recipe stack" }, { status: 500 });
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating recipe stack:", error);
    return NextResponse.json({ error: "Failed to create recipe stack" }, { status: 500 });
  }
}
