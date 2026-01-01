import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createChecklistSchema = z.object({
  title: z.string().min(1),
  date: z.string().optional(),
  folderId: z.string().optional().nullable(),
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
  const folderId = searchParams.get("folderId");

  const userId = session.user.id === "admin" ? undefined : session.user.id;

  const where: {
    userId?: string;
    folderId?: string | null;
    date?: { gte: Date; lt: Date };
  } = {};

  if (userId) {
    where.userId = userId;
  }

  if (folderId) {
    where.folderId = folderId;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    where.date = { gte: startDate, lt: endDate };
  }

  const checklists = await prisma.checklist.findMany({
    where,
    include: {
      tasks: {
        orderBy: { priority: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = checklists.map((c) => ({
    ...c,
    tasks: c.tasks.map((t) => ({
      id: t.id,
      text: t.text,
      completed: t.completed,
      completedAt: t.completedAt?.toISOString() || null,
      priority: t.priority,
      fileUrl: t.fileUrl,
    })),
  }));

  return NextResponse.json(mapped);
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

    const { title, date, folderId, tasks } = parsed.data;

    let userId = session.user.id;

    if (userId === "admin") {
      const adminUser = await prisma.user.findFirst();
      if (!adminUser) {
        const newUser = await prisma.user.create({
          data: {
            email: "admin@michaelgarisek.com",
            password: "admin",
            name: "Admin",
          },
        });
        userId = newUser.id;
      } else {
        userId = adminUser.id;
      }
    }

    const checklist = await prisma.checklist.create({
      data: {
        userId,
        title,
        folderId: folderId || null,
        date: date ? new Date(date) : new Date(),
        tasks: tasks ? {
          create: tasks.map((t, index) => ({
            text: t.description,
            priority: t.priority ?? index,
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
