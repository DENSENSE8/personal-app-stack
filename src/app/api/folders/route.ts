import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get or create admin user
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
    const type = searchParams.get("type");

    const user = await getAdminUser();

    const folders = await prisma.folder.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(folders);
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

    const user = await getAdminUser();

    const folder = await prisma.folder.create({
      data: {
        name,
        type,
        parentId: parentId || null,
        userId: user.id,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}
