import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

// Helper functions for caching recipes
export async function cacheRecipe(recipeId: string, recipe: any) {
  await redis.set(`recipe:${recipeId}`, JSON.stringify(recipe), { ex: 3600 }); // 1 hour
}

export async function getCachedRecipe(recipeId: string) {
  const cached = await redis.get(`recipe:${recipeId}`);
  return cached ? JSON.parse(cached as string) : null;
}

export async function invalidateRecipeCache(recipeId: string) {
  await redis.del(`recipe:${recipeId}`);
}

// Search indexing helpers
export async function indexRecipeForSearch(recipeId: string, title: string, description?: string) {
  await redis.set(`search:recipe:${recipeId}`, JSON.stringify({
    id: recipeId,
    title,
    description: description || '',
  }));
}

export async function searchRecipes(query: string): Promise<string[]> {
  // Simple implementation - in production, use Redis search or full-text search
  const keys = await redis.keys('search:recipe:*');
  const results: string[] = [];

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const recipe = JSON.parse(data as string);
      if (recipe.title.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase())) {
        results.push(recipe.id);
      }
    }
  }

  return results;
}
