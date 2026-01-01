"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Plus, Trash2, ChevronUp, ChevronDown, LogOut, CheckSquare, ChefHat, Calendar, GripVertical } from "lucide-react";
import { Button, Card, Input, Modal, Checkbox } from "@/components/ui";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Task {
  id?: string;
  description: string;
  completed: boolean;
  priority: number;
}

interface Checklist {
  id: string;
  title: string;
  date: string;
  tasks: Task[];
}

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  prepTime?: number | null;
  servings?: number | null;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [checklistsRes, recipesRes] = await Promise.all([
        fetch("/api/checklists"),
        fetch("/api/recipes"),
      ]);

      if (checklistsRes.ok) {
        const data = await checklistsRes.json();
        setChecklists(data);
      }

      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;

    const res = await fetch("/api/checklists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newChecklistTitle,
        date: new Date().toISOString().split("T")[0],
        tasks: [],
      }),
    });

    if (res.ok) {
      setNewChecklistTitle("");
      setChecklistModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    await fetch(`/api/checklists/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddTask = async (checklistId: string) => {
    if (!newTaskText.trim()) return;

    await fetch(`/api/checklists/${checklistId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: newTaskText,
        priority: 0,
      }),
    });

    setNewTaskText("");
    fetchData();
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    fetchData();
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchData();
  };

  const handleMoveTask = async (checklistId: string, taskId: string, direction: "up" | "down") => {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return;

    const taskIndex = checklist.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const newIndex = direction === "up" ? taskIndex - 1 : taskIndex + 1;
    if (newIndex < 0 || newIndex >= checklist.tasks.length) return;

    const newTasks = [...checklist.tasks];
    [newTasks[taskIndex], newTasks[newIndex]] = [newTasks[newIndex], newTasks[taskIndex]];

    await Promise.all(
      newTasks.map((task, index) =>
        fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: index }),
        })
      )
    );

    fetchData();
  };

  const handleReorderTasks = async (checklistId: string, newOrder: Task[]) => {
    setChecklists((prev) =>
      prev.map((c) =>
        c.id === checklistId ? { ...c, tasks: newOrder } : c
      )
    );

    await Promise.all(
      newOrder.map((task, index) =>
        task.id &&
        fetch(`/api/tasks/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority: index }),
        })
      )
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-pulse text-stone-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Dashboard</h1>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-stone-600"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#006400]" />
                <h2 className="text-lg font-semibold text-stone-900">Checklists</h2>
              </div>
              <Button size="sm" onClick={() => setChecklistModalOpen(true)}>
                <Plus className="w-4 h-4" />
                New
              </Button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {checklists.length === 0 ? (
                  <Card hover={false} className="p-8 text-center">
                    <CheckSquare className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-500">No checklists yet</p>
                  </Card>
                ) : (
                  checklists.map((checklist) => (
                    <motion.div
                      key={checklist.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Card hover={false} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-medium text-stone-900">{checklist.title}</h3>
                            <p className="text-xs text-stone-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(checklist.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteChecklist(checklist.id)}
                            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <Reorder.Group
                          axis="y"
                          values={checklist.tasks}
                          onReorder={(newOrder) => handleReorderTasks(checklist.id, newOrder)}
                          className="space-y-2"
                        >
                          {checklist.tasks.map((task) => (
                            <Reorder.Item
                              key={task.id || task.description}
                              value={task}
                              className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg group"
                            >
                              <GripVertical className="w-4 h-4 text-stone-300 cursor-grab" />
                              <Checkbox
                                checked={task.completed}
                                onChange={(checked) => task.id && handleToggleTask(task.id, checked)}
                              />
                              <span
                                className={`flex-1 text-sm ${
                                  task.completed ? "text-stone-400 line-through" : "text-stone-700"
                                }`}
                              >
                                {task.description}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => task.id && handleMoveTask(checklist.id, task.id, "up")}
                                  className="p-1 rounded hover:bg-stone-200 text-stone-400"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => task.id && handleMoveTask(checklist.id, task.id, "down")}
                                  className="p-1 rounded hover:bg-stone-200 text-stone-400"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => task.id && handleDeleteTask(task.id)}
                                  className="p-1 rounded hover:bg-rose-100 text-rose-400"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>

                        <div className="flex gap-2 mt-3">
                          <Input
                            value={editingChecklist?.id === checklist.id ? newTaskText : ""}
                            onChange={(e) => {
                              setEditingChecklist(checklist);
                              setNewTaskText(e.target.value);
                            }}
                            onFocus={() => setEditingChecklist(checklist)}
                            placeholder="Add task..."
                            className="flex-1 py-2 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTask(checklist.id);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddTask(checklist.id)}
                            disabled={!newTaskText.trim() || editingChecklist?.id !== checklist.id}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-5 h-5 text-[#006400]" />
              <h2 className="text-lg font-semibold text-stone-900">Recipes</h2>
            </div>

            <div className="space-y-4">
              {recipes.length === 0 ? (
                <Card hover={false} className="p-8 text-center">
                  <ChefHat className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500">No recipes yet</p>
                </Card>
              ) : (
                recipes.map((recipe) => (
                  <Card key={recipe.id} hover={false} className="p-4">
                    <h3 className="font-medium text-stone-900">{recipe.title}</h3>
                    {recipe.description && (
                      <p className="text-sm text-stone-500 mt-1">{recipe.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-stone-400">
                      {recipe.prepTime && <span>{recipe.prepTime} min</span>}
                      {recipe.servings && <span>{recipe.servings} servings</span>}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <Modal
        isOpen={checklistModalOpen}
        onClose={() => setChecklistModalOpen(false)}
        title="New Checklist"
      >
        <form onSubmit={handleCreateChecklist} className="space-y-4">
          <Input
            label="Title"
            value={newChecklistTitle}
            onChange={(e) => setNewChecklistTitle(e.target.value)}
            placeholder="My Checklist"
            required
          />
          <Button type="submit" className="w-full">
            Create Checklist
          </Button>
        </form>
      </Modal>
    </div>
  );
}

