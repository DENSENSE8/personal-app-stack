import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;
  const body = await req.json();

  const step = await prisma.recipeStep.update({
    where: { id: stepId },
    data: {
      ...(body.text !== undefined && { text: body.text }),
      ...(body.completed !== undefined && { completed: body.completed }),
      ...(body.order !== undefined && { order: body.order }),
    },
  });

  return NextResponse.json(step);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; stepId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { stepId } = await params;

  await prisma.recipeStep.delete({
    where: { id: stepId },
  });

  return NextResponse.json({ success: true });
}

