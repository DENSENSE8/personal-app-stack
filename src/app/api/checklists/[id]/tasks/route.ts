import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createTaskSchema = z.object({
  description: z.string().min(1),
  priority: z.number().optional(),
  reminderDate: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const checklist = await prisma.checklist.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!checklist) {
    return NextResponse.json({ error: "Checklist not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { description, priority, reminderDate } = parsed.data;

    const task = await prisma.task.create({
      data: {
        checklistId: id,
        description,
        priority: priority ?? 0,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

