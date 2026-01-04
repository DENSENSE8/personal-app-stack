import { NextRequest, NextResponse } from "next/server";
import { sql, generateId } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let folders;
    if (type) {
      folders = await sql`
        SELECT * FROM "Folder"
        WHERE type = ${type}
        ORDER BY name ASC
      `;
    } else {
      folders = await sql`
        SELECT * FROM "Folder"
        ORDER BY name ASC
      `;
    }

    return NextResponse.json(folders.rows);
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

    const id = generateId();
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO "Folder" (id, name, type, "parentId", "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${type}, ${parentId || null}, ${now}, ${now})
      RETURNING *
    `;

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
