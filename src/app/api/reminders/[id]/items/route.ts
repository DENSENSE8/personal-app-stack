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

    // Get the highest position
    const lastItem = await prisma.reminderItem.findFirst({
      where: { reminderId: id },
      orderBy: { position: "desc" },
    });

    const item = await prisma.reminderItem.create({
      data: {
        reminderId: id,
        text,
        position: lastItem ? lastItem.position + 1 : 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder item:", error);
    return NextResponse.json({ error: "Failed to create reminder item" }, { status: 500 });
  }
}
