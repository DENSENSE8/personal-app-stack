import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTaskSchema = z.object({
  description: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  completedAt: z.string().nullable().optional(),
  priority: z.number().optional(),
  fileUrl: z.string().nullable().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.checklistItem.findUnique({
    where: { id },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { description, completed, completedAt, priority, fileUrl } = parsed.data;

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: {
        ...(description !== undefined && { text: description }),
        ...(completed !== undefined && { completed }),
        ...(completedAt !== undefined && {
          completedAt: completedAt ? new Date(completedAt) : null,
        }),
        ...(priority !== undefined && { priority }),
        ...(fileUrl !== undefined && { fileUrl }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const task = await prisma.checklistItem.findUnique({
    where: { id },
  });

  if (!task) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.checklistItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
