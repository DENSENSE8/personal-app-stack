"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChefHat, Filter, X } from "lucide-react";
import { Button, Modal, Badge } from "@/components/ui";
import { RecipeCard, RecipeForm, SearchAutocomplete } from "@/components/features";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Ingredient {
  ingredient: { name: string };
  quantity: string;
}

interface Tag {
  tag: { name: string };
}

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  prepTime?: number | null;
  servings?: number | null;
  ingredients: Ingredient[];
  tags: Tag[];
}

export default function RecipesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (selectedTag) params.set("tag", selectedTag);

      const res = await fetch(`/api/recipes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);

        const tags = new Set<string>();
        data.forEach((r: Recipe) => r.tags.forEach((t) => tags.add(t.tag.name)));
        setAllTags(Array.from(tags));
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTag]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchRecipes();
    }
  }, [status, router, fetchRecipes]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCreate = async (data: {
    title: string;
    description?: string;
    prepTime?: number;
    servings?: number;
    imageUrl?: string;
    ingredients: { name: string; quantity: string; unit?: string }[];
    tags: string[];
  }) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setModalOpen(false);
      fetchRecipes();
    }
  };

  const handleUpdate = async (data: {
    title: string;
    description?: string;
    prepTime?: number;
    servings?: number;
    imageUrl?: string;
    ingredients: { name: string; quantity: string; unit?: string }[];
    tags: string[];
  }) => {
    if (!editingRecipe) return;

    const res = await fetch(`/api/recipes/${editingRecipe.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setEditingRecipe(null);
      fetchRecipes();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    setViewingRecipe(null);
    fetchRecipes();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-stone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-100">Recipes</h1>
          <p className="text-stone-400 mt-1">Your personal recipe collection</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Recipe
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchAutocomplete
            onSearch={handleSearch}
            placeholder="Search recipes, ingredients, tags..."
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-stone-500" />
            {allTags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  selectedTag === tag
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-stone-800 border-stone-700 text-stone-400 hover:border-stone-600"
                }`}
              >
                {tag}
              </button>
            ))}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="p-1.5 rounded-full hover:bg-stone-800 text-stone-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {recipes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ChefHat className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-400">No recipes found</h3>
            <p className="text-stone-500 mt-1">
              {searchQuery || selectedTag ? "Try a different search" : "Add your first recipe to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <RecipeCard
                  {...recipe}
                  onClick={() => setViewingRecipe(recipe)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Recipe"
        size="lg"
      >
        <RecipeForm onSubmit={handleCreate} submitLabel="Create Recipe" />
      </Modal>

      <Modal
        isOpen={!!editingRecipe}
        onClose={() => setEditingRecipe(null)}
        title="Edit Recipe"
        size="lg"
      >
        {editingRecipe && (
          <RecipeForm
            initialData={{
              title: editingRecipe.title,
              description: editingRecipe.description || "",
              prepTime: editingRecipe.prepTime || undefined,
              servings: editingRecipe.servings || undefined,
              imageUrl: editingRecipe.imageUrl || "",
              ingredients: editingRecipe.ingredients.map((i) => ({
                name: i.ingredient.name,
                quantity: i.quantity,
              })),
              tags: editingRecipe.tags.map((t) => t.tag.name),
            }}
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      <Modal
        isOpen={!!viewingRecipe}
        onClose={() => setViewingRecipe(null)}
        title={viewingRecipe?.title}
        size="lg"
      >
        {viewingRecipe && (
          <div className="space-y-6">
            {viewingRecipe.imageUrl && (
              <div className="relative h-64 rounded-xl overflow-hidden -mx-6 -mt-6">
                <img
                  src={viewingRecipe.imageUrl}
                  alt={viewingRecipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {viewingRecipe.description && (
              <p className="text-stone-300">{viewingRecipe.description}</p>
            )}

            <div className="flex gap-6 text-sm text-stone-400">
              {viewingRecipe.prepTime && (
                <div>
                  <span className="text-stone-500">Prep time:</span>{" "}
                  <span className="text-stone-200">{viewingRecipe.prepTime} min</span>
                </div>
              )}
              {viewingRecipe.servings && (
                <div>
                  <span className="text-stone-500">Servings:</span>{" "}
                  <span className="text-stone-200">{viewingRecipe.servings}</span>
                </div>
              )}
            </div>

            {viewingRecipe.ingredients.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-stone-400 mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {viewingRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center gap-2 text-stone-200">
                      <span className="w-2 h-2 bg-amber-500 rounded-full" />
                      {ing.quantity} {ing.ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingRecipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viewingRecipe.tags.map((t) => (
                  <Badge key={t.tag.name}>{t.tag.name}</Badge>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-stone-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setViewingRecipe(null);
                  setEditingRecipe(viewingRecipe);
                }}
                className="flex-1"
              >
                Edit Recipe
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(viewingRecipe.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

