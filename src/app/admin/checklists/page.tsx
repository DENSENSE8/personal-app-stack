"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";
import { ChecklistType } from "@/lib/types";
import { useAdmin } from "@/context/AdminContext";

export default function ChecklistsPage() {
  const { selectedFolderId, theme } = useAdmin();
  const [checklists, setChecklists] = useState<ChecklistType[]>([]);
  const [showNewChecklist, setShowNewChecklist] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchChecklists = useCallback(async () => {
    try {
      const url = selectedFolderId 
        ? `/api/checklists?folderId=${selectedFolderId}`
        : `/api/checklists`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setChecklists(data);
      }
    } catch (error) {
      console.error("Error fetching checklists:", error);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const createChecklist = async () => {
    if (!newChecklistTitle.trim()) return;
    try {
      const res = await fetch("/api/checklists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChecklistTitle, folderId: selectedFolderId }),
      });
      if (res.ok) {
        setNewChecklistTitle("");
        setShowNewChecklist(false);
        fetchChecklists();
      }
    } catch (error) {
      console.error("Error creating checklist:", error);
    }
  };

  const deleteChecklist = async (id: string) => {
    if (!confirm("Delete this checklist?")) return;
    try {
      await fetch(`/api/checklists/${id}`, { method: "DELETE" });
      fetchChecklists();
    } catch (error) {
      console.error("Error deleting checklist:", error);
    }
  };

  const updateChecklistTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await fetch(`/api/checklists/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      setEditingChecklistId(null);
      fetchChecklists();
    } catch (error) {
      console.error("Error updating checklist title:", error);
    }
  };

  const toggleChecklistItem = async (checklistId: string, itemId: string, checked: boolean) => {
    try {
      await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !checked }),
      });
      fetchChecklists();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const addSubItem = async (parentId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await fetch(`/api/checklists/${parentId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      fetchChecklists();
    } catch (error) {
      console.error("Error adding sub-item:", error);
    }
  };

  const updateSubItemText = async (parentId: string, itemId: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      await fetch(`/api/checklists/${parentId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });
      setEditingSubId(null);
      fetchChecklists();
    } catch (error) {
      console.error("Error updating sub-item text:", error);
    }
  };

  const resetChecklist = async (id: string) => {
    try {
      const checklist = checklists.find(c => c.id === id);
      if (!checklist) return;
      for (const task of checklist.items) {
        if (task.checked) {
          await fetch(`/api/checklists/${id}/items/${task.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ checked: false }),
          });
        }
      }
      fetchChecklists();
    } catch (error) {
      console.error("Error resetting checklist:", error);
    }
  };

  return (
    <div style={styles.sectionContent}>
      <div style={styles.contentHeader}>
        <h2 style={{ ...styles.contentTitle, color: theme.text }}>Checklists</h2>
        <button onClick={() => setShowNewChecklist(true)} style={styles.addItemBtn}>
          {Icons.plus}
          <span>Add Checklist</span>
        </button>
      </div>

      <div style={styles.itemsList}>
        {checklists.length === 0 ? (
          <div style={{ ...styles.emptyState, background: theme.cardBg, borderColor: theme.border }}>
            <span style={styles.emptyIcon}>📁</span>
            <p style={{ color: theme.textSecondary }}>No checklists yet. Create your first one!</p>
          </div>
        ) : (
              checklists.map((item: ChecklistType) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={item.id} 
                  style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                >
                  <div style={styles.itemHeader}>
                    {editingChecklistId === item.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                        onBlur={() => updateChecklistTitle(item.id, editingText)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") updateChecklistTitle(item.id, editingText);
                          if (e.key === "Escape") setEditingChecklistId(null);
                        }}
                        autoFocus
                        style={{ ...styles.miniInput, margin: 0, fontSize: 18, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                      />
                    ) : (
                      <h3 
                        style={{ ...styles.itemTitle, color: theme.text }} 
                        onDoubleClick={() => { setEditingChecklistId(item.id); setEditingText(item.title); }}
                      >
                        {item.title}
                      </h3>
                    )}
                    <div style={styles.itemActions}>
                      <button onClick={() => resetChecklist(item.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: theme.textSecondary }} title="Reset">
                        {Icons.reset}
                      </button>
                      <button onClick={() => deleteChecklist(item.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                        {Icons.trash}
                      </button>
                    </div>
                  </div>

                  <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                    {item.items.map((task: any) => (
                      <div key={task.id} style={styles.subItem}>
                        <button
                          onClick={() => toggleChecklistItem(item.id, task.id, task.checked)}
                          style={{ ...styles.checkbox, background: task.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${task.checked ? "transparent" : theme.border}` }}
                        >
                          {task.checked && Icons.check}
                        </button>
                        {editingSubId === task.id ? (
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                            onBlur={() => updateSubItemText(item.id, task.id, editingText)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                              if (e.key === "Enter") updateSubItemText(item.id, task.id, editingText);
                              if (e.key === "Escape") setEditingSubId(null);
                            }}
                            autoFocus
                            style={{ ...styles.miniInput, margin: 0, padding: "4px 8px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                          />
                        ) : (
                          <span 
                            style={{ ...styles.subItemText, textDecoration: task.checked ? "line-through" : "none", color: task.checked ? theme.textMuted : theme.text }}
                            onDoubleClick={() => { setEditingSubId(task.id); setEditingText(task.text); }}
                          >
                            {task.text}
                          </span>
                        )}
                        {task.completedAt && (
                          <span style={{ ...styles.timestamp, color: theme.textMuted }}>
                            {new Date(task.completedAt).toLocaleDateString()} {new Date(task.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    ))}
                    <div style={styles.addSubItem}>
                      <input
                        type="text"
                        placeholder="Add item..."
                        style={{ ...styles.subItemInput, background: theme.inputBg, border: `2px dashed ${theme.border}`, color: theme.text }}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") {
                            addSubItem(item.id, (e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))
        )}
      </div>

      <AnimatePresence>
        {showNewChecklist && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ ...styles.modal, background: theme.cardBg }}
            >
              <h2 style={{ ...styles.modalTitle, color: theme.text }}>New Checklist</h2>
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Enter title..."
                style={{ ...styles.modalInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
                autoFocus
              />
              <div style={styles.modalActions}>
                <button onClick={() => setShowNewChecklist(false)} style={{ ...styles.modalCancelBtn, background: theme.bgTertiary, color: theme.textSecondary }}>Cancel</button>
                <button onClick={createChecklist} style={styles.modalConfirmBtn}>Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
