import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const AUTOCOMPLETE_KEY = "autocomplete:all";

export async function indexForAutocomplete(text: string) {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return;
  await redis.zadd(AUTOCOMPLETE_KEY, { score: 0, member: normalized });
}

export async function removeFromAutocomplete(text: string) {
  const normalized = text.toLowerCase().trim();
  if (!normalized) return;
  await redis.zrem(AUTOCOMPLETE_KEY, normalized);
}

export async function searchAutocomplete(prefix: string, limit = 10): Promise<string[]> {
  const normalized = prefix.toLowerCase().trim();
  if (!normalized) return [];
  
  const results = await redis.zrange<string[]>(
    AUTOCOMPLETE_KEY,
    `[${normalized}`,
    `[${normalized}\xff`,
    { byLex: true, offset: 0, count: limit }
  );
  
  return results;
}

export async function indexRecipe(title: string, tags: string[], ingredients: string[]) {
  const items = [title, ...tags, ...ingredients].filter(Boolean);
  await Promise.all(items.map(indexForAutocomplete));
}

