import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  const userId = session.user.id === "admin" ? undefined : session.user.id;

  const reminders = await prisma.reminder.findMany({
    where: {
      ...(userId && { userId }),
      ...(folderId && { folderId }),
    },
    include: {
      items: {
        orderBy: { priority: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, folderId, dueDate } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

  const reminder = await prisma.reminder.create({
    data: {
      title,
      folderId: folderId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId,
    },
    include: {
      items: true,
    },
  });

  return NextResponse.json(reminder, { status: 201 });
}

