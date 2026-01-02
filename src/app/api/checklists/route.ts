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

    const user = await getAdminUser();

    const checklists = await prisma.checklist.findMany({
      where: {
        userId: user.id,
        ...(folderId && { folderId }),
      },
      include: {
        tasks: {
          orderBy: { priority: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(checklists);
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, folderId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const user = await getAdminUser();

    const checklist = await prisma.checklist.create({
      data: {
        title,
        userId: user.id,
        folderId: folderId || null,
      },
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(checklist, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
  }
}
