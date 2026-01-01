import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const userId = session.user.id === "admin" ? undefined : session.user.id;

  const folders = await prisma.folder.findMany({
    where: {
      ...(userId && { userId }),
      ...(type && { type }),
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(folders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, parentId } = await req.json();

  if (!name || !type) {
    return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
  }

  let userId = session.user.id;
  
  if (userId === "admin") {
    const adminUser = await prisma.user.findFirst();
    if (!adminUser) {
      const newUser = await prisma.user.create({
        data: {
          email: "admin@michaelgarisek.com",
          password: "admin",
          name: "Admin",
        },
      });
      userId = newUser.id;
    } else {
      userId = adminUser.id;
    }
  }

  const folder = await prisma.folder.create({
    data: {
      name,
      type,
      parentId: parentId || null,
      userId,
    },
  });

  return NextResponse.json(folder, { status: 201 });
}

