import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    const reminders = await prisma.reminder.findMany({
      where: {
        ...(folderId && { folderId }),
      },
      include: {
        items: {
          orderBy: { position: "asc" },
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
    const { title, folderId } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        title,
        folderId: folderId || null,
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
