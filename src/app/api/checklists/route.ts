import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createChecklistSchema = z.object({
  title: z.string().min(1),
  date: z.string().optional(),
  tasks: z.array(z.object({
    description: z.string().min(1),
    priority: z.number().optional(),
    reminderDate: z.string().optional(),
  })).optional(),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  const where: { userId: string; date?: { gte: Date; lt: Date } } = {
    userId: session.user.id,
  };

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    where.date = { gte: startDate, lt: endDate };
  }

  const checklists = await prisma.checklist.findMany({
    where,
    include: { tasks: { orderBy: { priority: "desc" } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(checklists);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createChecklistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, date, tasks } = parsed.data;

    const checklist = await prisma.checklist.create({
      data: {
        userId: session.user.id,
        title,
        date: date ? new Date(date) : new Date(),
        tasks: tasks ? {
          create: tasks.map((t) => ({
            description: t.description,
            priority: t.priority ?? 0,
            reminderDate: t.reminderDate ? new Date(t.reminderDate) : null,
          })),
        } : undefined,
      },
      include: { tasks: true },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Create checklist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

