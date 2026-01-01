import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();

  if (!text) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const existingSteps = await prisma.recipeStep.count({
    where: { recipeId: id },
  });

  const step = await prisma.recipeStep.create({
    data: {
      text,
      order: existingSteps,
      recipeId: id,
    },
  });

  return NextResponse.json(step, { status: 201 });
}

