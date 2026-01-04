import { NextRequest, NextResponse } from "next/server";
import { sql, generateId } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search");

    let recipes;
    
    if (folderId && search) {
      recipes = await sql`
        SELECT * FROM "Recipe"
        WHERE "folderId" = ${folderId} AND title ILIKE ${`%${search}%`}
        ORDER BY "createdAt" DESC
      `;
    } else if (folderId) {
      recipes = await sql`
        SELECT * FROM "Recipe"
        WHERE "folderId" = ${folderId}
        ORDER BY "createdAt" DESC
      `;
    } else if (search) {
      recipes = await sql`
        SELECT * FROM "Recipe"
        WHERE title ILIKE ${`%${search}%`}
        ORDER BY "createdAt" DESC
      `;
    } else {
      recipes = await sql`
        SELECT * FROM "Recipe"
        ORDER BY "createdAt" DESC
      `;
    }

    // Fetch blocks for each recipe
    const recipesWithBlocks = await Promise.all(
      recipes.rows.map(async (recipe) => {
        const blocks = await sql`
          SELECT * FROM "RecipeBlock"
          WHERE "recipeId" = ${recipe.id}
          ORDER BY position ASC
        `;
        return { ...recipe, blocks: blocks.rows };
      })
    );

    return NextResponse.json(recipesWithBlocks);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, folderId, coverImage, tags, prepTime, cookTime, servings } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();

    const result = await sql`
      INSERT INTO "Recipe" (
        id, title, description, "folderId", "coverImage", tags, 
        "prepTime", "cookTime", servings, "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${title}, ${description || null}, ${folderId || null}, 
        ${coverImage || null}, ${tags || []}, ${prepTime || null}, 
        ${cookTime || null}, ${servings || null}, ${now}, ${now}
      )
      RETURNING *
    `;

    const recipe = { ...result.rows[0], blocks: [] };

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 });
  }
}
