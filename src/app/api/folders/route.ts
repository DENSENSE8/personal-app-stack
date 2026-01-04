import { NextRequest, NextResponse } from "next/server";
import { db, folders } from "@/lib/db";
import { eq, asc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const query = db.select().from(folders);

    let result;
    if (type) {
      result = await query.where(eq(folders.type, type)).orderBy(asc(folders.name));
    } else {
      result = await query.orderBy(asc(folders.name));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, type, parentId } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const result = await db.insert(folders).values({
      name,
      type,
      parentId: parentId ? parseInt(parentId) : null,
    }).returning() as any[];

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
