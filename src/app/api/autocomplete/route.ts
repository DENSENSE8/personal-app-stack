import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchAutocomplete } from "@/lib/redis";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const suggestions = await searchAutocomplete(query, 10);
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Autocomplete error:", error);
    return NextResponse.json([]);
  }
}

