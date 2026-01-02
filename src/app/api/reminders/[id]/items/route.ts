import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const reminder = await prisma.reminder.findUnique({
      where: { id },
    });

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    const existingCount = await prisma.reminderItem.count({
      where: { reminderId: id },
    });

    const item = await prisma.reminderItem.create({
      data: {
        reminderId: id,
        text,
        priority: existingCount,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder item:", error);
    return NextResponse.json({ error: "Failed to create reminder item" }, { status: 500 });
  }
}
