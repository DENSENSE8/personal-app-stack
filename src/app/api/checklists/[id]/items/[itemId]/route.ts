import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const { text, checked, position } = await req.json();

    const item = await prisma.checklistItem.update({
      where: { id: itemId },
      data: {
        ...(text !== undefined && { text }),
        ...(checked !== undefined && { 
          checked,
          completedAt: checked ? new Date() : null,
        }),
        ...(position !== undefined && { position }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json({ error: "Failed to update checklist item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;

    await prisma.checklistItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json({ error: "Failed to delete checklist item" }, { status: 500 });
  }
}

