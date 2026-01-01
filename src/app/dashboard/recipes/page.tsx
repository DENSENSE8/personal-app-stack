"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Edit2, RotateCcw, ChefHat, X } from "lucide-react";
import { FolderSidebar } from "@/components/dashboard/FolderSidebar";
import Image from "next/image";

interface RecipeStep {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface Ingredient {
  ingredient: { name: string };
  quantity: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  prepTime: number | null;
  servings: number | null;
  folderId: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [newRecipeDesc, setNewRecipeDesc] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [newStepText, setNewStepText] = useState("");

  const fetchRecipes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolderId) params.set("folderId", selectedFolderId);

      const res = await fetch(`/api/recipes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handleCreateRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeTitle.trim()) return;

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newRecipeTitle,
        description: newRecipeDesc || undefined,
        folderId: selectedFolderId,
        ingredients: [],
        tags: [],
      }),
    });

    if (res.ok) {
      setNewRecipeTitle("");
      setNewRecipeDesc("");
      setShowNewRecipe(false);
      fetchRecipes();
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
    fetchRecipes();
  };

  const handleAddStep = async (recipeId: string) => {
    if (!newStepText.trim()) return;

    await fetch(`/api/recipes/${recipeId}/steps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newStepText }),
    });
    setNewStepText("");
    fetchRecipes();
    
    const updatedRecipe = recipes.find((r) => r.id === recipeId);
    if (updatedRecipe) {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRecipe(data);
      }
    }
  };

  const handleToggleStep = async (recipeId: string, stepId: string, completed: boolean) => {
    await fetch(`/api/recipes/${recipeId}/steps/${stepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    fetchRecipes();
    
    const res = await fetch(`/api/recipes/${recipeId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedRecipe(data);
    }
  };

  const handleResetSteps = async (recipeId: string) => {
    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    await Promise.all(
      recipe.steps.map((step) =>
        fetch(`/api/recipes/${recipeId}/steps/${step.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: false }),
        })
      )
    );
    fetchRecipes();
    
    const res = await fetch(`/api/recipes/${recipeId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedRecipe(data);
    }
  };

  const handleDeleteStep = async (recipeId: string, stepId: string) => {
    await fetch(`/api/recipes/${recipeId}/steps/${stepId}`, { method: "DELETE" });
    fetchRecipes();
    
    const res = await fetch(`/api/recipes/${recipeId}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedRecipe(data);
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      <FolderSidebar
        type="recipe"
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onFoldersChange={fetchRecipes}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-stone-900">Recipes</h2>
            <button
              onClick={() => setShowNewRecipe(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#006400] hover:bg-[#228B22] text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Recipe
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading...</div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">No recipes yet. Create one above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <div className="h-32 bg-stone-100 relative">
                    {recipe.imageUrl ? (
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-stone-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-stone-900 mb-1">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="text-sm text-stone-500 line-clamp-2">{recipe.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                      {recipe.prepTime && <span>{recipe.prepTime} min</span>}
                      {recipe.servings && <span>{recipe.servings} servings</span>}
                      {recipe.steps.length > 0 && (
                        <span>
                          {recipe.steps.filter((s) => s.completed).length}/{recipe.steps.length} steps
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showNewRecipe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewRecipe(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-2xl shadow-xl z-50 p-6"
            >
              <h3 className="text-lg font-semibold text-stone-900 mb-4">New Recipe</h3>
              <form onSubmit={handleCreateRecipe} className="space-y-4">
                <input
                  type="text"
                  value={newRecipeTitle}
                  onChange={(e) => setNewRecipeTitle(e.target.value)}
                  placeholder="Recipe title"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#006400]"
                  autoFocus
                />
                <textarea
                  value={newRecipeDesc}
                  onChange={(e) => setNewRecipeDesc(e.target.value)}
                  placeholder="Description (optional)"
                  rows={3}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#006400] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#006400] hover:bg-[#228B22] text-white rounded-lg"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewRecipe(false)}
                    className="flex-1 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecipe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-stone-900">{selectedRecipe.title}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResetSteps(selectedRecipe.id)}
                      className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
                      title="Reset steps"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                      className="p-2 rounded-lg hover:bg-rose-50 text-rose-500"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedRecipe(null)}
                      className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {selectedRecipe.description && (
                  <p className="text-stone-600 mb-6">{selectedRecipe.description}</p>
                )}

                {selectedRecipe.ingredients.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-stone-900 mb-2">Ingredients</h4>
                    <ul className="space-y-1">
                      {selectedRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                          <span className="w-2 h-2 bg-[#006400] rounded-full" />
                          {ing.quantity} {ing.ingredient.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-stone-900 mb-3">Prep Steps</h4>
                  <div className="space-y-2 mb-4">
                    {selectedRecipe.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 group"
                      >
                        <button
                          onClick={() => handleToggleStep(selectedRecipe.id, step.id, !step.completed)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                            step.completed
                              ? "bg-[#006400] border-[#006400]"
                              : "border-stone-300 hover:border-stone-400"
                          }`}
                        >
                          {step.completed && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${
                            step.completed ? "text-stone-400 line-through" : "text-stone-700"
                          }`}
                        >
                          {step.text}
                        </span>
                        <button
                          onClick={() => handleDeleteStep(selectedRecipe.id, step.id)}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-400 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStepText}
                      onChange={(e) => setNewStepText(e.target.value)}
                      placeholder="Add prep step..."
                      className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:border-[#006400]"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddStep(selectedRecipe.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddStep(selectedRecipe.id)}
                      className="px-3 py-2 bg-[#006400] hover:bg-[#228B22] text-white rounded-lg"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

