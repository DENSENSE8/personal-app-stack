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

    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
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
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, folderId, dueDate } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const user = await getAdminUser();

    const reminder = await prisma.reminder.create({
      data: {
        title,
        userId: user.id,
        folderId: folderId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder" }, { status: 500 });
  }
}
