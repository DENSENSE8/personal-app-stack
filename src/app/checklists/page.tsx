"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, Modal } from "@/components/ui";
import { ChecklistForm } from "@/components/features";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Task {
  id?: string;
  description: string;
  completed: boolean;
  priority: number;
  reminderDate?: string | null;
}

interface Checklist {
  id: string;
  title: string;
  date: string;
  tasks: Task[];
}

export default function ChecklistsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchChecklists = useCallback(async () => {
    try {
      const res = await fetch(`/api/checklists?date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setChecklists(data);
      }
    } catch (error) {
      console.error("Failed to fetch checklists:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetchChecklists();
    }
  }, [status, router, fetchChecklists]);

  const handleCreate = async (data: { title: string; date: string; tasks: Task[] }) => {
    const res = await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: data.title,
        date: data.date,
        tasks: data.tasks.map((t) => ({
          description: t.description,
          priority: t.priority,
          reminderDate: t.reminderDate,
        })),
      }),
    });

    if (res.ok) {
      setModalOpen(false);
      fetchChecklists();
    }
  };

  const handleUpdate = async (data: { title: string; date: string; tasks: Task[] }) => {
    if (!editingChecklist) return;

    const res = await fetch(`/api/checklists/${editingChecklist.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: data.title, date: data.date }),
    });

    if (res.ok) {
      setEditingChecklist(null);
      fetchChecklists();
    }
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    fetchChecklists();
  };

  const handleTaskDelete = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchChecklists();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/checklists/${id}`, { method: "DELETE" });
    fetchChecklists();
  };

  const navigateDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-stone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stone-100">Checklists</h1>
          <p className="text-stone-400 mt-1">Organize your daily tasks and reminders</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Checklist
        </Button>
      </div>

      <div className="flex items-center justify-center gap-4 mb-8">
        <button
          onClick={() => navigateDate(-1)}
          className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-stone-800/50 rounded-lg">
          <Calendar className="w-4 h-4 text-amber-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-stone-200 text-sm focus:outline-none"
          />
        </div>
        <button
          onClick={() => navigateDate(1)}
          className="p-2 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="popLayout">
        {checklists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Calendar className="w-16 h-16 text-stone-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-400">No checklists for this date</h3>
            <p className="text-stone-500 mt-1">Create one to get started</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {checklists.map((checklist, index) => {
              const completedCount = checklist.tasks.filter((t) => t.completed).length;
              const progress = checklist.tasks.length > 0
                ? (completedCount / checklist.tasks.length) * 100
                : 0;

              return (
                <motion.div
                  key={checklist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover={false} className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-stone-100">
                          {checklist.title}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {completedCount} / {checklist.tasks.length} completed
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChecklist(checklist)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(checklist.id)}
                          className="text-rose-400 hover:text-rose-300"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                      />
                    </div>

                    <div className="space-y-2">
                      {checklist.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-800/50 transition-colors"
                        >
                          <button
                            onClick={() => handleTaskToggle(task.id, !task.completed)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              task.completed
                                ? "bg-amber-500 border-amber-500"
                                : "border-stone-600 hover:border-stone-500"
                            }`}
                          >
                            {task.completed && (
                              <svg className="w-3 h-3 text-stone-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${
                              task.completed ? "text-stone-500 line-through" : "text-stone-200"
                            }`}
                          >
                            {task.description}
                          </span>
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="p-1 rounded hover:bg-rose-500/10 text-stone-600 hover:text-rose-400 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Checklist"
        size="lg"
      >
        <ChecklistForm
          initialDate={selectedDate}
          onSubmit={handleCreate}
          submitLabel="Create Checklist"
        />
      </Modal>

      <Modal
        isOpen={!!editingChecklist}
        onClose={() => setEditingChecklist(null)}
        title="Edit Checklist"
        size="lg"
      >
        {editingChecklist && (
          <ChecklistForm
            initialTitle={editingChecklist.title}
            initialDate={editingChecklist.date.split("T")[0]}
            initialTasks={editingChecklist.tasks}
            onSubmit={handleUpdate}
            onTaskToggle={handleTaskToggle}
            onTaskDelete={handleTaskDelete}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  );
}

