"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Folder, FolderPlus, Trash2, Edit2, Check, X, PanelLeftClose, PanelLeft } from "lucide-react";

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  children?: FolderItem[];
}

interface FolderSidebarProps {
  type: "recipe" | "checklist" | "reminder";
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onFoldersChange?: () => void;
}

export function FolderSidebar({ type, selectedFolderId, onSelectFolder, onFoldersChange }: FolderSidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderParentId, setNewFolderParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, [type]);

  const fetchFolders = async () => {
    try {
      const res = await fetch(`/api/folders?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setFolders(buildTree(data));
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const buildTree = (items: FolderItem[]): FolderItem[] => {
    const map = new Map<string, FolderItem>();
    const roots: FolderItem[] = [];

    items.forEach((item) => {
      map.set(item.id, { ...item, children: [] });
    });

    items.forEach((item) => {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const toggleExpand = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          type,
          parentId: newFolderParentId,
        }),
      });

      if (res.ok) {
        setNewFolderName("");
        setShowNewFolder(false);
        setNewFolderParentId(null);
        fetchFolders();
        onFoldersChange?.();
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleUpdateFolder = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });

      if (res.ok) {
        setEditingId(null);
        setEditingName("");
        fetchFolders();
        onFoldersChange?.();
      }
    } catch (error) {
      console.error("Failed to update folder:", error);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all its contents?")) return;

    try {
      await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (selectedFolderId === id) {
        onSelectFolder(null);
      }
      fetchFolders();
      onFoldersChange?.();
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  };

  const renderFolder = (folder: FolderItem, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;
    const isEditing = editingId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded-lg cursor-pointer group transition-colors ${
            isSelected ? "bg-[#006400]/10 text-[#006400]" : "hover:bg-stone-100 text-stone-700"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder.id);
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <Folder className="w-4 h-4 shrink-0" />

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateFolder(folder.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 px-1 py-0.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:border-[#006400]"
                autoFocus
              />
              <button onClick={() => handleUpdateFolder(folder.id)} className="p-0.5 text-[#006400]">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingId(null)} className="p-0.5 text-stone-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <span
                onClick={() => onSelectFolder(folder.id)}
                className="flex-1 text-sm truncate"
              >
                {folder.name}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewFolder(true);
                    setNewFolderParentId(folder.id);
                    setExpandedFolders((prev) => new Set(prev).add(folder.id));
                  }}
                  className="p-1 rounded hover:bg-stone-200"
                  title="Add subfolder"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(folder.id);
                    setEditingName(folder.name);
                  }}
                  className="p-1 rounded hover:bg-stone-200"
                  title="Rename"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
                  className="p-1 rounded hover:bg-rose-100 text-rose-500"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {folder.children!.map((child) => renderFolder(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-white border-r border-stone-200 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-medium text-stone-900 text-sm">Folders</h3>
              <button
                onClick={() => {
                  setShowNewFolder(true);
                  setNewFolderParentId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-[#006400]"
                title="New folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              <button
                onClick={() => onSelectFolder(null)}
                className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm transition-colors ${
                  selectedFolderId === null
                    ? "bg-[#006400]/10 text-[#006400]"
                    : "hover:bg-stone-100 text-stone-700"
                }`}
              >
                <Folder className="w-4 h-4" />
                All Items
              </button>

              <div className="mt-2">
                {folders.map((folder) => renderFolder(folder))}
              </div>

              {showNewFolder && (
                <div className="mt-2 p-2 bg-stone-50 rounded-lg">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") {
                        setShowNewFolder(false);
                        setNewFolderName("");
                      }
                    }}
                    placeholder="Folder name"
                    className="w-full px-2 py-1.5 text-sm bg-white border border-stone-300 rounded focus:outline-none focus:border-[#006400]"
                    autoFocus
                  />
                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={handleCreateFolder}
                      className="flex-1 py-1 text-xs bg-[#006400] text-white rounded hover:bg-[#228B22]"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowNewFolder(false);
                        setNewFolderName("");
                      }}
                      className="flex-1 py-1 text-xs bg-stone-200 text-stone-600 rounded hover:bg-stone-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 w-10 h-10 bg-white border border-stone-200 rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors"
      >
        {isOpen ? (
          <PanelLeftClose className="w-5 h-5 text-stone-600" />
        ) : (
          <PanelLeft className="w-5 h-5 text-stone-600" />
        )}
      </button>
    </>
  );
}

