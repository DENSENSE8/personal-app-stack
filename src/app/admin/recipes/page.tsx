"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";
import { RecipeType } from "@/lib/types";
import { useAdmin } from "@/context/AdminContext";

export default function RecipesPage() {
  const { selectedFolderId, theme } = useAdmin();
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchRecipes = useCallback(async () => {
    try {
      const url = selectedFolderId 
        ? `/api/recipes?folderId=${selectedFolderId}`
        : `/api/recipes`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const createRecipe = async () => {
    if (!newRecipeTitle.trim()) return;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newRecipeTitle, folderId: selectedFolderId }),
      });
      if (res.ok) {
        setNewRecipeTitle("");
        setShowNewRecipe(false);
        fetchRecipes();
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
    }
  };

  const deleteRecipe = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      fetchRecipes();
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const updateRecipeTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setEditingRecipeId(null);
        fetchRecipes();
      }
    } catch (error) {
      console.error("Error updating recipe title:", error);
    }
  };

  return (
    <div style={styles.sectionContent}>
      <div style={styles.contentHeader}>
        <h2 style={{ ...styles.contentTitle, color: theme.text }}>Recipes</h2>
        <button onClick={() => setShowNewRecipe(true)} style={styles.addItemBtn}>
          {Icons.plus}
          <span>Add Recipe</span>
        </button>
      </div>

      <div style={styles.itemsList}>
        {recipes.length === 0 ? (
          <div style={{ ...styles.emptyState, background: theme.cardBg, borderColor: theme.border }}>
            <span style={styles.emptyIcon}>📁</span>
            <p style={{ color: theme.textSecondary }}>No recipes yet. Create your first one!</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={recipe.id} 
              style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <div style={styles.itemHeader}>
                {editingRecipeId === recipe.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={() => updateRecipeTitle(recipe.id, editingText)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") updateRecipeTitle(recipe.id, editingText);
                      if (e.key === "Escape") setEditingRecipeId(null);
                    }}
                    autoFocus
                    style={{ ...styles.miniInput, margin: 0, fontSize: 18, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                  />
                ) : (
                  <h3 
                    style={{ ...styles.itemTitle, color: theme.text }} 
                    onDoubleClick={() => { setEditingRecipeId(recipe.id); setEditingText(recipe.title); }}
                  >
                    {recipe.title}
                  </h3>
                )}
                <div style={styles.itemActions}>
                  <button onClick={() => deleteRecipe(recipe.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                    {Icons.trash}
                  </button>
                </div>
              </div>
              {recipe.description && (
                <p style={{ ...styles.recipeDesc, color: theme.textSecondary }}>{recipe.description}</p>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showNewRecipe && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ ...styles.modal, background: theme.cardBg }}
            >
              <h2 style={{ ...styles.modalTitle, color: theme.text }}>New Recipe</h2>
              <input
                type="text"
                value={newRecipeTitle}
                onChange={(e) => setNewRecipeTitle(e.target.value)}
                placeholder="Enter title..."
                style={{ ...styles.modalInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
                autoFocus
              />
              <div style={styles.modalActions}>
                <button onClick={() => setShowNewRecipe(false)} style={{ ...styles.modalCancelBtn, background: theme.bgTertiary, color: theme.textSecondary }}>Cancel</button>
                <button onClick={createRecipe} style={styles.modalConfirmBtn}>Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
