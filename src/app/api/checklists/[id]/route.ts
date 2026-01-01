import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateChecklistSchema = z.object({
  title: z.string().min(1).optional(),
  date: z.string().optional(),
});

export async function GET(
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
    include: { tasks: { orderBy: { priority: "desc" } } },
  });

  if (!checklist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(checklist);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.checklist.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateChecklistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { title, date } = parsed.data;

    const checklist = await prisma.checklist.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
      },
      include: { tasks: true },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Update checklist error:", error);
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

  const existing = await prisma.checklist.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.checklist.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

