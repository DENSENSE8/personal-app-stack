import { NextResponse } from "next/server";
import { sql, CREATE_TABLES_SQL } from "@/lib/db";

// Database setup endpoint for Neon DB
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Simple protection - require secret parameter
  if (secret !== "create-tables-now") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check database connection
    const result = await sql`SELECT NOW()`;

    // Create tables
    await sql.query(CREATE_TABLES_SQL);

    return NextResponse.json({
      success: true,
      message: "Database setup complete! All tables created.",
      timestamp: result.rows[0]?.now,
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: error instanceof Error ? error.message : String(error),
        hint: "Make sure POSTGRES_URL is set correctly in your environment variables.",
      },
      { status: 500 }
    );
  }
}
