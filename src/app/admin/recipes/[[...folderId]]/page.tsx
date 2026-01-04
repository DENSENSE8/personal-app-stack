"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";
import { RecipeType, RecipeBlock, RecipeBlockType, RecipeBlockContent } from "@/lib/types";
import { useAdmin } from "@/context/AdminContext";

export default function RecipesPage() {
  const params = useParams();
  const router = useRouter();
  const folderPathArr = params.folderId as string[] | undefined;
  const currentFolderId = folderPathArr?.[folderPathArr.length - 1] || null;
  
  const { theme } = useAdmin();
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  const [showNewRecipe, setShowNewRecipe] = useState(false);
  const [newRecipeTitle, setNewRecipeTitle] = useState("");
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number>(-1);

  const fetchRecipes = useCallback(async () => {
    try {
      const url = currentFolderId 
        ? `/api/recipes?folderId=${currentFolderId}`
        : `/api/recipes`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const createRecipe = async () => {
    if (!newRecipeTitle.trim()) return;
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newRecipeTitle, folderId: currentFolderId }),
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

  const openRecipe = async (recipeId: string) => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedRecipe(data);
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error fetching recipe:", error);
    }
  };

  const addBlock = (type: RecipeBlockType, position: number) => {
    if (!selectedRecipe) return;
    
    const newBlock: RecipeBlock = {
      id: `temp-${Date.now()}`,
      recipeId: selectedRecipe.id,
      type,
      content: getDefaultContent(type),
      position,
      metadata: {},
    };
    
    const updatedBlocks = [...(selectedRecipe.blocks || [])];
    updatedBlocks.splice(position, 0, newBlock);
    
    // Update positions
    updatedBlocks.forEach((block, idx) => {
      block.position = idx;
    });
    
    setSelectedRecipe({ ...selectedRecipe, blocks: updatedBlocks });
    setShowBlockMenu(false);
  };

  const getDefaultContent = (type: RecipeBlockType): RecipeBlockContent => {
    switch (type) {
      case "text": return { text: "" };
      case "heading": return { text: "", level: 2 };
      case "image": return { url: "", caption: "", alt: "" };
      case "ingredients": return { ingredients: [] };
      case "steps": return { steps: [] };
      case "divider": return {};
      case "quote": return { text: "" };
      default: return {};
    }
  };

  const updateBlock = (blockId: string, content: any) => {
    if (!selectedRecipe) return;
    const updatedBlocks = selectedRecipe.blocks?.map(block =>
      block.id === blockId ? { ...block, content } : block
    );
    setSelectedRecipe({ ...selectedRecipe, blocks: updatedBlocks });
  };

  const deleteBlock = (blockId: string) => {
    if (!selectedRecipe) return;
    const updatedBlocks = selectedRecipe.blocks?.filter(block => block.id !== blockId);
    updatedBlocks?.forEach((block, idx) => {
      block.position = idx;
    });
    setSelectedRecipe({ ...selectedRecipe, blocks: updatedBlocks });
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    if (!selectedRecipe?.blocks) return;
    const blocks = [...selectedRecipe.blocks];
    const [moved] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, moved);
    blocks.forEach((block, idx) => {
      block.position = idx;
    });
    setSelectedRecipe({ ...selectedRecipe, blocks });
  };

  const saveRecipe = async () => {
    if (!selectedRecipe) return;
    try {
      const res = await fetch(`/api/recipes/${selectedRecipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedRecipe),
      });
      if (res.ok) {
        setIsEditMode(false);
        fetchRecipes();
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  if (selectedRecipe) {
    return (
      <div style={styles.sectionContent}>
        <div style={{ marginBottom: 32 }}>
          <button 
            onClick={() => { setSelectedRecipe(null); fetchRecipes(); }}
            style={{ 
              ...styles.backBtn, 
              marginBottom: 16,
              background: theme.bgTertiary,
              color: theme.text,
            }}
          >
            {Icons.back}
            <span>Back to Collection</span>
          </button>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: theme.text, margin: 0 }}>
              {selectedRecipe.title}
            </h1>
            <div style={{ display: "flex", gap: 12 }}>
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)} style={{ ...styles.backBtn, background: theme.bgTertiary, color: theme.text }}>Cancel</button>
                  <button onClick={saveRecipe} style={styles.addItemBtn}>Save Changes</button>
                </>
              ) : (
                <button onClick={() => setIsEditMode(true)} style={styles.addItemBtn}>
                  {Icons.edit}
                  <span>Edit Recipe</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedRecipe.blocks?.length === 0 || !selectedRecipe.blocks ? (
            <div style={{ ...styles.emptyState, background: theme.cardBg, borderColor: theme.border }}>
              <span style={styles.emptyIcon}>📝</span>
              <p style={{ color: theme.textSecondary, marginBottom: 16 }}>No content yet. Start building your recipe!</p>
              {isEditMode && (
                <button onClick={() => { setInsertPosition(0); setShowBlockMenu(true); }} style={styles.addItemBtn}>
                  {Icons.plus}
                  <span>Add First Block</span>
                </button>
              )}
            </div>
          ) : (
            selectedRecipe.blocks.map((block, index) => (
              <div key={block.id} style={{ position: "relative" }}>
                {isEditMode && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 8, opacity: 0.6 }}>
                    <button onClick={() => index > 0 && moveBlock(index, index - 1)} disabled={index === 0} style={{ padding: "4px 8px", background: theme.bgTertiary, border: "none", borderRadius: 4, color: theme.text, fontSize: 12 }}>↑</button>
                    <button onClick={() => index < (selectedRecipe.blocks?.length || 0) - 1 && moveBlock(index, index + 1)} disabled={index === (selectedRecipe.blocks?.length || 0) - 1} style={{ padding: "4px 8px", background: theme.bgTertiary, border: "none", borderRadius: 4, color: theme.text, fontSize: 12 }}>↓</button>
                    <button onClick={() => deleteBlock(block.id)} style={{ padding: "4px 8px", background: theme.errorBg, border: "none", borderRadius: 4, color: theme.error, fontSize: 12 }}>{Icons.trash}</button>
                    <button onClick={() => { setInsertPosition(index + 1); setShowBlockMenu(true); }} style={{ padding: "4px 8px", background: theme.bgTertiary, border: "none", borderRadius: 4, color: theme.text, fontSize: 12, marginLeft: "auto" }}>{Icons.plus} Insert Below</button>
                  </div>
                )}
                <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 12, padding: 20 }}>
                  {renderBlock(block, isEditMode)}
                </div>
              </div>
            ))
          )}
        </div>

        {showBlockMenu && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }} onClick={() => setShowBlockMenu(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ backgroundColor: theme.cardBg, borderRadius: 16, padding: 24, maxWidth: 500, width: "90%", margin: "auto" }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: theme.text, marginBottom: 16 }}>Add Block</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {[
                  { type: "text", label: "Text", icon: "📝" },
                  { type: "heading", label: "Heading", icon: "📌" },
                  { type: "image", label: "Image", icon: "🖼️" },
                  { type: "ingredients", label: "Ingredients", icon: "🥗" },
                  { type: "steps", label: "Steps", icon: "👨‍🍳" },
                  { type: "divider", label: "Divider", icon: "➖" },
                  { type: "quote", label: "Quote", icon: "💬" },
                ].map(({ type, label, icon }) => (
                  <button key={type} onClick={() => addBlock(type as RecipeBlockType, insertPosition)} style={{ padding: 16, background: theme.bgTertiary, border: `1px solid ${theme.border}`, borderRadius: 8, cursor: "pointer", color: theme.text, fontSize: 14, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 24 }}>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  const renderBlock = (block: RecipeBlock, editMode: boolean) => {
    switch (block.type) {
      case "text":
        return <textarea value={block.content.text || ""} onChange={(e) => editMode && updateBlock(block.id, { text: e.target.value })} readOnly={!editMode} style={{ width: "100%", minHeight: 100, border: "none", background: "transparent", color: theme.text, fontSize: 16, fontFamily: "inherit", resize: "vertical", outline: editMode ? `1px dashed ${theme.border}` : "none", padding: editMode ? 8 : 0 }} placeholder="Type your text here..." />;
      case "heading":
        return <input type="text" value={block.content.text || ""} onChange={(e) => editMode && updateBlock(block.id, { ...block.content, text: e.target.value })} readOnly={!editMode} style={{ width: "100%", border: "none", background: "transparent", color: theme.text, fontSize: 24, fontWeight: 700, outline: editMode ? `1px dashed ${theme.border}` : "none", padding: editMode ? 8 : 0 }} placeholder="Heading text..." />;
      case "image":
        return (
          <div>
            {block.content.url ? <img src={block.content.url} alt={block.content.alt || ""} style={{ width: "100%", borderRadius: 8 }} /> : editMode && (
              <div style={{ padding: 40, border: `2px dashed ${theme.border}`, borderRadius: 8, textAlign: "center", color: theme.textSecondary }}>
                <p>Image URL:</p>
                <input type="text" value={block.content.url || ""} onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 8, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, borderRadius: 4, color: theme.text }} placeholder="https://example.com/image.jpg" />
              </div>
            )}
            {(block.content.url || editMode) && <input type="text" value={block.content.caption || ""} onChange={(e) => editMode && updateBlock(block.id, { ...block.content, caption: e.target.value })} readOnly={!editMode} style={{ width: "100%", marginTop: 8, padding: 4, border: "none", background: "transparent", color: theme.textSecondary, fontSize: 14, fontStyle: "italic", textAlign: "center", outline: editMode ? `1px dashed ${theme.border}` : "none" }} placeholder="Image caption..." />}
          </div>
        );
      case "divider": return <div style={{ height: 1, background: theme.border, margin: "16px 0" }} />;
      default: return <p style={{ color: theme.textSecondary }}>Block type: {block.type}</p>;
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
            <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={recipe.id} style={{ ...styles.itemCard, backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, cursor: "pointer" } as React.CSSProperties} onClick={() => openRecipe(recipe.id)}>
              <div style={styles.itemHeader}>
                {editingRecipeId === recipe.id ? (
                  <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} onClick={(e) => e.stopPropagation()} onBlur={() => updateRecipeTitle(recipe.id, editingText)} onKeyDown={(e) => { if (e.key === "Enter") updateRecipeTitle(recipe.id, editingText); if (e.key === "Escape") setEditingRecipeId(null); }} autoFocus style={{ ...styles.input, margin: 0, fontSize: 18, fontWeight: 600, color: theme.text, background: theme.inputBg, border: `1px solid ${theme.inputBorder}`, padding: "8px 12px" }} />
                ) : (
                  <h3 style={{ ...styles.itemTitle, color: theme.text }}>{recipe.title}</h3>
                )}
                <div style={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingRecipeId(recipe.id); setEditingText(recipe.title); }} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: theme.text }} title="Rename">{Icons.edit}</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">{Icons.trash}</button>
                </div>
              </div>
              {recipe.description && <p style={{ ...styles.recipeDesc, color: theme.textSecondary }}>{recipe.description}</p>}
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showNewRecipe && (
          <div style={styles.modalOverlay}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ ...styles.modal, backgroundColor: theme.cardBg } as React.CSSProperties}>
              <h2 style={{ ...styles.modalTitle, color: theme.text }}>New Recipe</h2>
              <input type="text" value={newRecipeTitle} onChange={(e) => setNewRecipeTitle(e.target.value)} placeholder="Enter title..." style={{ ...styles.modalInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }} autoFocus />
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
