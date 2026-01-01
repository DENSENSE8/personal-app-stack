import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTaskSchema = z.object({
  description: z.string().min(1).optional(),
  completed: z.boolean().optional(),
  priority: z.number().optional(),
  reminderDate: z.string().nullable().optional(),
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

  const task = await prisma.task.findFirst({
    where: { id },
    include: { checklist: true },
  });

  if (!task || task.checklist.userId !== session.user.id) {
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

    const { description, completed, priority, reminderDate } = parsed.data;

    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority }),
        ...(reminderDate !== undefined && {
          reminderDate: reminderDate ? new Date(reminderDate) : null,
        }),
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

  const task = await prisma.task.findFirst({
    where: { id },
    include: { checklist: true },
  });

  if (!task || task.checklist.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

