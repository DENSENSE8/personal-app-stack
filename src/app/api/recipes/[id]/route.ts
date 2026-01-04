import { NextRequest, NextResponse } from "next/server";
import { sql, generateId } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const recipeResult = await sql`
      SELECT * FROM "Recipe"
      WHERE id = ${id}
    `;

    if (recipeResult.rows.length === 0) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const blocksResult = await sql`
      SELECT * FROM "RecipeBlock"
      WHERE "recipeId" = ${id}
      ORDER BY position ASC
    `;

    const recipe = {
      ...recipeResult.rows[0],
      blocks: blocksResult.rows,
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ error: "Failed to fetch recipe" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete recipe (blocks will cascade delete automatically)
    await sql`
      DELETE FROM "Recipe"
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { title, description, folderId, coverImage, tags, prepTime, cookTime, servings, blocks } = await req.json();

    const now = new Date().toISOString();

    // If blocks are provided, handle them separately
    if (blocks !== undefined) {
      // Delete all existing blocks
      await sql`
        DELETE FROM "RecipeBlock"
        WHERE "recipeId" = ${id}
      `;

      // Create new blocks
      if (blocks.length > 0) {
        for (const block of blocks) {
          const blockId = block.id.startsWith('temp-') ? generateId() : block.id;
          await sql`
            INSERT INTO "RecipeBlock" (id, "recipeId", type, content, position, metadata)
            VALUES (
              ${blockId}, ${id}, ${block.type}, ${JSON.stringify(block.content)}, 
              ${block.position}, ${JSON.stringify(block.metadata || {})}
            )
          `;
        }
      }
    }

    // Build update query dynamically
    const updates: string[] = ['"updatedAt" = $2'];
    const values: any[] = [id, now];
    let paramCount = 3;

    if (title !== undefined) {
      updates.push(`"title" = $${paramCount}`);
      values.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`"description" = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (folderId !== undefined) {
      updates.push(`"folderId" = $${paramCount}`);
      values.push(folderId);
      paramCount++;
    }

    if (coverImage !== undefined) {
      updates.push(`"coverImage" = $${paramCount}`);
      values.push(coverImage);
      paramCount++;
    }

    if (tags !== undefined) {
      updates.push(`"tags" = $${paramCount}`);
      values.push(tags);
      paramCount++;
    }

    if (prepTime !== undefined) {
      updates.push(`"prepTime" = $${paramCount}`);
      values.push(prepTime);
      paramCount++;
    }

    if (cookTime !== undefined) {
      updates.push(`"cookTime" = $${paramCount}`);
      values.push(cookTime);
      paramCount++;
    }

    if (servings !== undefined) {
      updates.push(`"servings" = $${paramCount}`);
      values.push(servings);
      paramCount++;
    }

    const recipeResult = await sql.query(
      `UPDATE "Recipe" SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );

    const blocksResult = await sql`
      SELECT * FROM "RecipeBlock"
      WHERE "recipeId" = ${id}
      ORDER BY position ASC
    `;

    const recipe = {
      ...recipeResult.rows[0],
      blocks: blocksResult.rows,
    };

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 });
  }
}
