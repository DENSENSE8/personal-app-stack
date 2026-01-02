import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const { text, checked, priority } = await req.json();

    const item = await prisma.reminderItem.update({
      where: { id: itemId },
      data: {
        ...(text !== undefined && { text }),
        ...(checked !== undefined && { 
          completed: checked,
          completedAt: checked ? new Date() : null,
        }),
        ...(priority !== undefined && { priority }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating reminder item:", error);
    return NextResponse.json({ error: "Failed to update reminder item" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { itemId } = await params;

    await prisma.reminderItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting reminder item:", error);
    return NextResponse.json({ error: "Failed to delete reminder item" }, { status: 500 });
  }
}
