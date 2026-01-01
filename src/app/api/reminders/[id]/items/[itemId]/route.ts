import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const body = await req.json();

  const item = await prisma.reminderItem.update({
    where: { id: itemId },
    data: {
      ...(body.text !== undefined && { text: body.text }),
      ...(body.completed !== undefined && { completed: body.completed }),
      ...(body.completedAt !== undefined && {
        completedAt: body.completedAt ? new Date(body.completedAt) : null,
      }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;

  await prisma.reminderItem.delete({
    where: { id: itemId },
  });

  return NextResponse.json({ success: true });
}

