"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";
import { ReminderType } from "@/lib/types";
import { useAdmin } from "@/context/AdminContext";

export default function RemindersPage() {
  const { selectedFolderId, theme } = useAdmin();
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [showNewReminder, setShowNewReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const fetchReminders = useCallback(async () => {
    try {
      const url = selectedFolderId 
        ? `/api/reminders?folderId=${selectedFolderId}`
        : `/api/reminders`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const createReminder = async () => {
    if (!newReminderTitle.trim()) return;
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newReminderTitle, folderId: selectedFolderId }),
      });
      if (res.ok) {
        setNewReminderTitle("");
        setShowNewReminder(false);
        fetchReminders();
      }
    } catch (error) {
      console.error("Error creating reminder:", error);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    try {
      await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      fetchReminders();
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const updateReminderTitle = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      setEditingReminderId(null);
      fetchReminders();
    } catch (error) {
      console.error("Error updating reminder title:", error);
    }
  };

  const toggleReminderItem = async (reminderId: string, itemId: string, checked: boolean) => {
    try {
      await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !checked }),
      });
      fetchReminders();
    } catch (error) {
      console.error("Error toggling reminder item:", error);
    }
  };

  const addSubItem = async (parentId: string, text: string) => {
    if (!text.trim()) return;
    try {
      await fetch(`/api/reminders/${parentId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      fetchReminders();
    } catch (error) {
      console.error("Error adding sub-item:", error);
    }
  };

  const updateSubItemText = async (parentId: string, itemId: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      await fetch(`/api/reminders/${parentId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText }),
      });
      setEditingSubId(null);
      fetchReminders();
    } catch (error) {
      console.error("Error updating sub-item text:", error);
    }
  };

  return (
    <div style={styles.sectionContent}>
      <div style={styles.contentHeader}>
        <h2 style={{ ...styles.contentTitle, color: theme.text }}>Reminders</h2>
        <button onClick={() => setShowNewReminder(true)} style={styles.addItemBtn}>
          {Icons.plus}
          <span>Add Reminder</span>
        </button>
      </div>

      <div style={styles.itemsList}>
        {reminders.length === 0 ? (
          <div style={{ ...styles.emptyState, background: theme.cardBg, borderColor: theme.border }}>
            <span style={styles.emptyIcon}>📁</span>
            <p style={{ color: theme.textSecondary }}>Create a reminder first to see all reminders.</p>
          </div>
        ) : (
          reminders.map((item: ReminderType) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={item.id} 
              style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
            >
              <div style={styles.itemHeader}>
                {editingReminderId === item.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                    onBlur={() => updateReminderTitle(item.id, editingText)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") updateReminderTitle(item.id, editingText);
                      if (e.key === "Escape") setEditingReminderId(null);
                    }}
                    autoFocus
                    style={{ ...styles.miniInput, margin: 0, fontSize: 18, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                  />
                ) : (
                  <h3 
                    style={{ ...styles.itemTitle, color: theme.text }} 
                    onDoubleClick={() => { setEditingReminderId(item.id); setEditingText(item.title); }}
                  >
                    {item.title}
                  </h3>
                )}
                <div style={styles.itemActions}>
                  <button onClick={() => deleteReminder(item.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                    {Icons.trash}
                  </button>
                </div>
              </div>

              <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                {item.items.map((ri: any) => (
                  <div key={ri.id} style={styles.subItem}>
                    <button
                      onClick={() => toggleReminderItem(item.id, ri.id, ri.checked)}
                      style={{ ...styles.checkbox, background: ri.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${ri.checked ? "transparent" : theme.border}` }}
                    >
                      {ri.checked && Icons.check}
                    </button>
                    {editingSubId === ri.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                        onBlur={() => updateSubItemText(item.id, ri.id, editingText)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") updateSubItemText(item.id, ri.id, editingText);
                          if (e.key === "Escape") setEditingSubId(null);
                        }}
                        autoFocus
                        style={{ ...styles.miniInput, margin: 0, padding: "4px 8px", fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}
                      />
                    ) : (
                      <span 
                        style={{ ...styles.subItemText, textDecoration: ri.checked ? "line-through" : "none", color: ri.checked ? theme.textMuted : theme.text }}
                        onDoubleClick={() => { setEditingSubId(ri.id); setEditingText(ri.text); }}
                      >
                        {ri.text}
                      </span>
                    )}
                    {ri.completedAt && (
                      <span style={{ ...styles.timestamp, color: theme.textMuted }}>
                        {new Date(ri.completedAt).toLocaleDateString()} {new Date(ri.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                ))}
                <div style={styles.addSubItem}>
                  <input
                    type="text"
                    placeholder="Add reminder item..."
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
        {showNewReminder && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ ...styles.modal, background: theme.cardBg }}
            >
              <h2 style={{ ...styles.modalTitle, color: theme.text }}>New Reminder</h2>
              <input
                type="text"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Enter title..."
                style={{ ...styles.modalInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
                autoFocus
              />
              <div style={styles.modalActions}>
                <button onClick={() => setShowNewReminder(false)} style={{ ...styles.modalCancelBtn, background: theme.bgTertiary, color: theme.textSecondary }}>Cancel</button>
                <button onClick={createReminder} style={styles.modalConfirmBtn}>Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
