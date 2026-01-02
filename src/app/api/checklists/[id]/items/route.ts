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

    const checklist = await prisma.checklist.findUnique({
      where: { id },
    });

    if (!checklist) {
      return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
    }

    // Get the highest position
    const lastItem = await prisma.checklistItem.findFirst({
      where: { checklistId: id },
      orderBy: { position: "desc" },
    });

    const item = await prisma.checklistItem.create({
      data: {
        checklistId: id,
        text,
        position: lastItem ? lastItem.position + 1 : 0,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json({ error: "Failed to create checklist item" }, { status: 500 });
  }
}

