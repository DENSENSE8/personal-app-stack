"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "@/lib/icons";
import { styles } from "@/lib/styles";
import { FolderType } from "@/lib/types";
import { FolderPath } from "@/components/FolderPath";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthed, setIsAuthed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null);
  const folderMapRef = useRef<Record<string, FolderType>>({});

  const view = useMemo(() => {
    if (pathname.includes("recipes")) return "recipes";
    if (pathname.includes("checklists")) return "checklists";
    if (pathname.includes("reminders")) return "reminders";
    return "dashboard";
  }, [pathname]);

  const getCurrentType = useCallback(() => {
    if (view === "recipes") return "recipe";
    if (view === "checklists") return "checklist";
    if (view === "reminders") return "reminder";
    return null;
  }, [view]);

  const theme = useMemo(() => ({
    bg: darkMode ? "#0f172a" : "#ffffff",
    bgSecondary: darkMode ? "#1e293b" : "#f8fafc",
    bgTertiary: darkMode ? "#334155" : "#f1f5f9",
    text: darkMode ? "#f1f5f9" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    textMuted: darkMode ? "#64748b" : "#9ca3af",
    border: darkMode ? "#334155" : "#f1f5f9",
    borderLight: darkMode ? "#1e293b" : "#f8fafc",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "#334155" : "#f1f5f9",
    inputBg: darkMode ? "#1e293b" : "#f8fafc",
    inputBorder: darkMode ? "#475569" : "#e2e8f0",
    primary: "#059669",
    primaryLight: "#10b981",
    primaryGradient: "linear-gradient(135deg, #059669, #0d9488)",
    error: "#ef4444",
    errorBg: darkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
  }), [darkMode]);

  useEffect(() => {
    const auth = localStorage.getItem("isAdmin");
    if (auth !== "true" && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else if (auth === "true") {
      setIsAuthed(true);
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, [router, pathname]);

  const fetchFolders = useCallback(async () => {
    const type = getCurrentType();
    if (!type) return;
    try {
      const res = await fetch(`/api/folders?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
        const map: Record<string, FolderType> = {};
        data.forEach((f: FolderType) => { map[f.id] = f; });
        folderMapRef.current = map;
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [getCurrentType]);

  useEffect(() => {
    if (isAuthed && view !== "dashboard") {
      fetchFolders();
    }
  }, [isAuthed, view, fetchFolders]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const folderPath = useMemo(() => {
    const path: FolderType[] = [];
    if (selectedFolderId && folderMapRef.current[selectedFolderId]) {
      let current: FolderType | undefined = folderMapRef.current[selectedFolderId];
      while (current) {
        path.unshift(current);
        current = current.parentId ? folderMapRef.current[current.parentId] : undefined;
      }
    }
    return path;
  }, [selectedFolderId]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.push("/");
  };

  const deleteFolder = async (id: string) => {
    if (!confirm("Delete this folder and all its contents?")) return;
    try {
      await fetch(`/api/folders/${id}`, { method: "DELETE" });
      fetchFolders();
      if (selectedFolderId === id) setSelectedFolderId(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const updateFolder = async (id: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      const res = await fetch(`/api/folders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setEditingFolderId(null);
        fetchFolders();
      }
    } catch (error) {
      console.error("Error updating folder:", error);
    }
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (!isAuthed) return null;

  return (
    <AdminProvider 
      darkMode={darkMode} 
      setDarkMode={setDarkMode} 
      theme={theme} 
      folders={folders} 
      setFolders={setFolders} 
      selectedFolderId={selectedFolderId} 
      setSelectedFolderId={setSelectedFolderId}
    >
      <div style={{ ...styles.sectionContainer, background: theme.bgSecondary, color: theme.text }}>
        {/* Sidebar */}
        <motion.aside 
          initial={false}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          style={{ ...styles.sidebar, background: theme.cardBg, borderColor: theme.border }}
        >
          <div style={{ ...styles.sidebarHeader }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedFolderId(null)} 
                style={{ ...styles.navIconBtn, color: !selectedFolderId ? theme.primary : theme.textSecondary, background: !selectedFolderId ? `${theme.primary}10` : "transparent" }} 
                title="Root"
              >
                {Icons.folderOpen}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (selectedFolderId && folderMapRef.current[selectedFolderId]?.parentId) {
                    setSelectedFolderId(folderMapRef.current[selectedFolderId].parentId);
                  } else {
                    setSelectedFolderId(null);
                  }
                }}
                style={{ ...styles.navIconBtn, color: theme.textSecondary }}
                title="Back"
              >
                {Icons.back}
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 6px 15px rgba(5, 150, 105, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewFolder(true)} 
              style={styles.addFolderBtn}
            >
              {Icons.plus}
            </motion.button>
          </div>

          <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
            {[
              { id: "recipes", label: "Recipes", icon: Icons.recipes, path: "/admin/recipes" },
              { id: "checklists", label: "Checklists", icon: Icons.checklist, path: "/admin/checklists" },
              { id: "reminders", label: "Reminders", icon: Icons.reminders, path: "/admin/reminders" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedFolderId(null);
                  router.push(item.path);
                }}
                style={{
                  ...styles.folderItem,
                  background: view === item.id ? `${theme.primary}15` : "transparent",
                  color: view === item.id ? theme.primary : theme.textSecondary,
                  fontWeight: view === item.id ? 700 : 500,
                }}
              >
                <span style={{ fontSize: 20, display: "flex", opacity: view === item.id ? 1 : 0.7 }}>{item.icon}</span>
                <span>{item.label}</span>
                {view === item.id && (
                  <motion.div 
                    layoutId="activeNav"
                    style={{ marginLeft: "auto", width: 4, height: 16, borderRadius: 2, background: theme.primary }}
                  />
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, padding: "16px 12px 12px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Folders</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {folders
                .filter(f => f.parentId === selectedFolderId)
                .map((folder) => (
                <div key={folder.id}>
                  {editingFolderId === folder.id ? (
                    <input
                      type="text"
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={() => updateFolder(folder.id, editingFolderName)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateFolder(folder.id, editingFolderName);
                        if (e.key === "Escape") setEditingFolderId(null);
                      }}
                      autoFocus
                      style={{ ...styles.input, padding: "10px 16px", fontSize: 14, marginBottom: 4 }}
                    />
                  ) : (
                    <motion.button
                      whileHover={{ x: 4, background: theme.bgSecondary }}
                      onClick={() => setSelectedFolderId(folder.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ x: e.clientX, y: e.clientY, folderId: folder.id });
                      }}
                      style={{ 
                        ...styles.folderItem, 
                        background: "transparent", 
                        color: theme.text,
                      }}
                    >
                      <span style={{ color: theme.primary, opacity: 0.8 }}>{Icons.folder}</span>
                      <span className="truncate">{folder.name}</span>
                    </motion.button>
                  )}
                </div>
              ))}
              {folders.filter(f => f.parentId === selectedFolderId).length === 0 && (
                <div style={{ padding: "20px 12px", textAlign: "center", color: theme.textMuted, fontSize: 13, border: `1px dashed ${theme.border}`, borderRadius: 16 }}>
                  Empty folder
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: 24, borderTop: `1px solid ${theme.border}` }}>
            <FolderPath folderPath={folderPath} onFolderClick={setSelectedFolderId} />
            {selectedFolderId && (
              <motion.button 
                whileHover={{ background: theme.errorBg }}
                onClick={() => deleteFolder(selectedFolderId)} 
                style={{ ...styles.deleteFolderBtn, marginTop: 12, width: "100%" }}
              >
                {Icons.trash}
                <span>Delete current folder</span>
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showNewFolder && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ 
                  position: "absolute", 
                  bottom: 100, 
                  left: 16, 
                  right: 16, 
                  background: theme.cardBg, 
                  padding: 20, 
                  borderRadius: 24, 
                  boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
                  border: `1px solid ${theme.border}`,
                  zIndex: 100
                }}
              >
                <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>New Folder</h4>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  style={{ ...styles.input, padding: "12px 16px", fontSize: 14, marginBottom: 16 }}
                  autoFocus
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowNewFolder(false)} style={{ ...styles.backBtn, flex: 1, padding: 10 }}>Cancel</button>
                  <button 
                    onClick={() => {
                      const trimmedName = newFolderName.trim();
                      if (!trimmedName) return;
                      const type = getCurrentType();
                      fetch("/api/folders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: trimmedName, type, parentId: selectedFolderId }),
                      }).then(res => res.json()).then(data => {
                        setNewFolderName("");
                        setShowNewFolder(false);
                        setSelectedFolderId(data.id);
                        fetchFolders();
                      });
                    }} 
                    style={{ ...styles.addItemBtn, flex: 1, padding: 10, justifyContent: "center" }}
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: "fixed",
                top: contextMenu.y,
                left: contextMenu.x,
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 12,
                boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                zIndex: 2000,
                minWidth: 180,
                padding: 6,
              }}
            >
              <button
                onClick={() => {
                  const folder = folders.find(f => f.id === contextMenu.folderId);
                  if (folder) {
                    setEditingFolderId(folder.id);
                    setEditingFolderName(folder.name);
                    setContextMenu(null);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <span className="text-emerald-600">{Icons.edit}</span>
                <span>Rename</span>
              </button>
              <button
                onClick={() => {
                  deleteFolder(contextMenu.folderId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-red-600"
              >
                <span>{Icons.trash}</span>
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div style={{ ...styles.sectionMain, marginLeft: sidebarOpen ? 300 : 0 }}>
          <header style={{ ...styles.dashHeader, background: theme.cardBg, borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                style={{ ...styles.navIconBtn, color: theme.textSecondary, background: theme.bgTertiary }}
              >
                {sidebarOpen ? "«" : "»"}
              </button>
              <button onClick={() => router.push("/admin/dashboard")} style={styles.backBtn}>
                {Icons.back}
                <span>Dashboard</span>
              </button>
            </div>
            
            <h1 style={{ ...styles.dashName, fontSize: 24 }}>{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme} 
                style={{ ...styles.themeToggle, background: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.text }}
              >
                {darkMode ? Icons.sun : Icons.moon}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout} 
                style={{ ...styles.navIconBtn, border: `1.5px solid ${theme.error}`, color: theme.error }}
              >
                {Icons.logout}
              </motion.button>
            </div>
          </header>

          <main style={{ minHeight: "calc(100vh - 88px)" }}>
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
