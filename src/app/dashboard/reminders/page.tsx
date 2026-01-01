"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, Clock, Video, X, Calendar } from "lucide-react";
import { FolderSidebar } from "@/components/dashboard/FolderSidebar";

interface ReminderItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt: string | null;
  priority: number;
  fileUrl: string | null;
}

interface Reminder {
  id: string;
  title: string;
  dueDate: string | null;
  folderId: string | null;
  items: ReminderItem[];
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  const fetchReminders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolderId) params.set("folderId", selectedFolderId);

      const res = await fetch(`/api/reminders?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReminders(data);
      }
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedFolderId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;

    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newReminderTitle,
        folderId: selectedFolderId,
      }),
    });

    if (res.ok) {
      setNewReminderTitle("");
      fetchReminders();
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    await fetch(`/api/reminders/${id}`, { method: "DELETE" });
    fetchReminders();
  };

  const handleResetReminder = async (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    await Promise.all(
      reminder.items.map((item) =>
        fetch(`/api/reminders/${id}/items/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: false, completedAt: null }),
        })
      )
    );
    fetchReminders();
  };

  const handleAddItem = async (reminderId: string, text: string) => {
    if (!text.trim()) return;

    await fetch(`/api/reminders/${reminderId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, priority: 0 }),
    });
    fetchReminders();
  };

  const handleToggleItem = async (reminderId: string, itemId: string, completed: boolean) => {
    await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      }),
    });
    fetchReminders();
  };

  const handleUpdateItem = async (reminderId: string, itemId: string, text: string) => {
    await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setEditingItemId(null);
    fetchReminders();
  };

  const handleDeleteItem = async (reminderId: string, itemId: string) => {
    await fetch(`/api/reminders/${reminderId}/items/${itemId}`, { method: "DELETE" });
    fetchReminders();
  };

  const handleFileUpload = async (reminderId: string, itemId: string, file: File) => {
    setUploadingItemId(itemId);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const { url } = await res.json();
        await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: url }),
        });
        fetchReminders();
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploadingItemId(null);
    }
  };

  const handleRemoveFile = async (reminderId: string, itemId: string) => {
    await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: null }),
    });
    fetchReminders();
  };

  const formatCompletedTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      <FolderSidebar
        type="reminder"
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onFoldersChange={fetchReminders}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 mb-6">Reminders</h2>

          <form onSubmit={handleCreateReminder} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newReminderTitle}
              onChange={(e) => setNewReminderTitle(e.target.value)}
              placeholder="New reminder name..."
              className="flex-1 px-4 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#006400]/50 focus:border-[#006400]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#006400] hover:bg-[#228B22] text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading...</div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500">No reminders yet. Create one above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {reminders.map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-stone-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-stone-900">{reminder.title}</h3>
                        {reminder.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                            <Calendar className="w-3 h-3" />
                            Due: {new Date(reminder.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleResetReminder(reminder.id)}
                          className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
                          title="Reset all"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(reminder.id)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-rose-500"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {reminder.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-stone-50 group"
                        >
                          <button
                            onClick={() => handleToggleItem(reminder.id, item.id, !item.completed)}
                            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                              item.completed
                                ? "bg-[#006400] border-[#006400]"
                                : "border-stone-300 hover:border-stone-400"
                            }`}
                          >
                            {item.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {editingItemId === item.id ? (
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleUpdateItem(reminder.id, item.id, editingText);
                                  if (e.key === "Escape") setEditingItemId(null);
                                }}
                                onBlur={() => handleUpdateItem(reminder.id, item.id, editingText)}
                                className="w-full px-2 py-1 text-sm border border-stone-300 rounded focus:outline-none focus:border-[#006400]"
                                autoFocus
                              />
                            ) : (
                              <span
                                onClick={() => {
                                  setEditingItemId(item.id);
                                  setEditingText(item.text);
                                }}
                                className={`text-sm cursor-text ${
                                  item.completed ? "text-stone-400 line-through" : "text-stone-700"
                                }`}
                              >
                                {item.text}
                              </span>
                            )}

                            {item.completedAt && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
                                <Clock className="w-3 h-3" />
                                {formatCompletedTime(item.completedAt)}
                              </div>
                            )}

                            {item.fileUrl && (
                              <div className="mt-2 relative">
                                <video
                                  src={item.fileUrl}
                                  controls
                                  className="w-full max-w-xs rounded-lg"
                                />
                                <button
                                  onClick={() => handleRemoveFile(reminder.id, item.id)}
                                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!item.fileUrl && (
                              <label className="p-1.5 rounded hover:bg-stone-200 text-stone-400 cursor-pointer">
                                <input
                                  type="file"
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(reminder.id, item.id, file);
                                  }}
                                />
                                {uploadingItemId === item.id ? (
                                  <span className="w-4 h-4 border-2 border-stone-300 border-t-[#006400] rounded-full animate-spin block" />
                                ) : (
                                  <Video className="w-4 h-4" />
                                )}
                              </label>
                            )}
                            <button
                              onClick={() => handleDeleteItem(reminder.id, item.id)}
                              className="p-1.5 rounded hover:bg-rose-100 text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Add item..."
                        className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg placeholder-stone-400 focus:outline-none focus:border-[#006400]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddItem(reminder.id, e.currentTarget.value);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

