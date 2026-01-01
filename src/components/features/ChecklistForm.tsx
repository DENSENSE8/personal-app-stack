"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, GripVertical, Bell, Trash2, Calendar } from "lucide-react";
import { Button, Input, Checkbox, Card } from "@/components/ui";

interface Task {
  id?: string;
  description: string;
  completed: boolean;
  priority: number;
  reminderDate?: string | null;
}

interface ChecklistFormProps {
  initialTitle?: string;
  initialDate?: string;
  initialTasks?: Task[];
  onSubmit: (data: { title: string; date: string; tasks: Task[] }) => Promise<void>;
  onTaskToggle?: (taskId: string, completed: boolean) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  submitLabel?: string;
}

export function ChecklistForm({
  initialTitle = "",
  initialDate = new Date().toISOString().split("T")[0],
  initialTasks = [],
  onSubmit,
  onTaskToggle,
  onTaskDelete,
  submitLabel = "Save Checklist",
}: ChecklistFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        description: newTask.trim(),
        completed: false,
        priority: tasks.length,
        reminderDate: null,
      },
    ]);
    setNewTask("");
  };

  const toggleTask = async (index: number) => {
    const task = tasks[index];
    const updated = [...tasks];
    updated[index] = { ...task, completed: !task.completed };
    setTasks(updated);

    if (task.id && onTaskToggle) {
      await onTaskToggle(task.id, !task.completed);
    }
  };

  const deleteTask = async (index: number) => {
    const task = tasks[index];
    setTasks(tasks.filter((_, i) => i !== index));

    if (task.id && onTaskDelete) {
      await onTaskDelete(task.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({ title: title.trim(), date, tasks });
    } finally {
      setLoading(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Checklist"
          required
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {tasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>Progress</span>
            <span>{completedCount} / {tasks.length} completed</span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full bg-[#006400]"
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">Tasks</label>

        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id || `new-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              layout
            >
              <Card hover={false} className="p-3 flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-stone-300 cursor-grab" />
                <Checkbox
                  checked={task.completed}
                  onChange={() => toggleTask(index)}
                />
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? "text-stone-400 line-through" : "text-stone-700"
                  }`}
                >
                  {task.description}
                </span>
                {task.reminderDate && (
                  <Bell className="w-4 h-4 text-[#006400]" />
                )}
                <button
                  type="button"
                  onClick={() => deleteTask(index)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-stone-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={addTask}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        <Calendar className="w-4 h-4" />
        {submitLabel}
      </Button>
    </form>
  );
}
