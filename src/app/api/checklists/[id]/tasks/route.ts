import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text, description } = await req.json();

    const itemText = text || description;

    if (!itemText) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const checklist = await prisma.checklist.findUnique({
      where: { id },
    });

    if (!checklist) {
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
    }

    const existingCount = await prisma.checklistItem.count({
      where: { checklistId: id },
    });

    const task = await prisma.checklistItem.create({
      data: {
        checklistId: id,
        text: itemText,
        priority: existingCount,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
