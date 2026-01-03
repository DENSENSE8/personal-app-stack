"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
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

  // Get current view from pathname
  const view = useMemo(() => {
    if (pathname.includes("recipes")) return "recipes";
    return "dashboard";
  }, [pathname]);

  const getCurrentType = useCallback(() => {
    if (view === "recipes") return "recipe";
    return null;
  }, [view]);

  const theme = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    bgSecondary: darkMode ? "#1e293b" : "#f9fafb",
    bgTertiary: darkMode ? "#334155" : "#f3f4f6",
    text: darkMode ? "#f1f5f9" : "#1f2937",
    textSecondary: darkMode ? "#94a3b8" : "#6b7280",
    textMuted: darkMode ? "#64748b" : "#9ca3af",
    border: darkMode ? "#334155" : "#e5e7eb",
    borderLight: darkMode ? "#1e293b" : "#f3f4f6",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "#334155" : "#e5e7eb",
    inputBg: darkMode ? "#1e293b" : "#f9fafb",
    inputBorder: darkMode ? "#475569" : "#e5e7eb",
    primary: "#059669",
    primaryLight: "#10b981",
    primaryGradient: "linear-gradient(135deg, #059669, #0d9488)",
    error: "#ef4444",
    errorBg: darkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
  };

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
    if (isAuthed && view === "recipes") {
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
    if (!confirm("Delete this folder?")) return;
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

  const moveFolder = async (folderId: string, newParentId: string | null) => {
    if (folderId === newParentId) return;
    try {
      await fetch(`/api/folders/${folderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: newParentId }),
      });
      setSelectedFolderId(newParentId);
      fetchFolders();
    } catch (error) {
      console.error("Error moving folder:", error);
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
      <div style={{ ...styles.sectionContainer, background: theme.bgSecondary }}>
        {/* Sidebar */}
        <div style={{ ...styles.sidebar, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", background: theme.cardBg, borderColor: theme.border }}>
          <div style={{ ...styles.sidebarHeader, borderColor: theme.border }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button 
                onClick={() => setSelectedFolderId(null)} 
                style={{ ...styles.navIconBtn, color: !selectedFolderId ? theme.primary : theme.textSecondary }} 
                title="Root"
              >
                {Icons.folderOpen}
              </button>
              <button
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
              </button>
            </div>
            <button onClick={() => setShowNewFolder(true)} style={styles.addFolderBtn}>
              {Icons.plus}
            </button>
          </div>

          {/* Navigation Section */}
          <div style={{ padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
            <button
              onClick={() => {
                setSelectedFolderId(null);
                router.push("/admin/recipes");
              }}
              style={{
                ...styles.folderItem,
                background: view === "recipes" ? "rgba(5, 150, 105, 0.1)" : "transparent",
                color: view === "recipes" ? theme.primary : theme.text,
                fontWeight: view === "recipes" ? 700 : 500,
                border: view === "recipes" ? `1px solid ${theme.primary}33` : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 18, display: "flex" }}>{Icons.recipes}</span>
              <span>Recipes</span>
            </button>
          </div>

          <div style={{ ...styles.folderList, paddingTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, padding: "0 8px 8px", textTransform: "uppercase", letterSpacing: 1 }}>Folders</div>
            {folders
              .filter(f => f.parentId === selectedFolderId)
              .map((folder) => (
              <div key={folder.id} style={styles.folderItemWrap}>
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
                    style={{ ...styles.miniInput, margin: 0, padding: "8px 12px", color: theme.text, background: theme.inputBg }}
                  />
                ) : (
                  <button
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", folder.id);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData("text/plain");
                      if (draggedId && draggedId !== folder.id) {
                        moveFolder(draggedId, folder.id);
                      }
                    }}
                    onClick={() => setSelectedFolderId(folder.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, folderId: folder.id });
                    }}
                    style={{ 
                      ...styles.folderItem, 
                      background: selectedFolderId === folder.id ? "linear-gradient(135deg, #059669, #0d9488)" : "transparent", 
                      color: selectedFolderId === folder.id ? "#fff" : theme.text, 
                      width: "100%", 
                      textAlign: "left" 
                    }}
                  >
                    {Icons.folder}
                    <span>{folder.name}</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={styles.sidebarFooter}>
            <FolderPath folderPath={folderPath} onFolderClick={setSelectedFolderId} />
            {selectedFolderId && (
              <button onClick={() => deleteFolder(selectedFolderId)} style={styles.deleteFolderBtn}>
                {Icons.trash}
                <span>Delete Folder</span>
              </button>
            )}
          </div>

          {showNewFolder && (
            <div style={{ ...styles.miniModal, background: theme.cardBg, border: `1px solid ${theme.border}` }}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                style={{ ...styles.miniInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
                autoFocus
              />
              <div style={styles.miniModalActions}>
                <button onClick={() => setShowNewFolder(false)} style={{ ...styles.miniCancelBtn, background: theme.bgTertiary, color: theme.textSecondary }}>Cancel</button>
                <button onClick={() => {
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
                }} style={styles.miniConfirmBtn}>Create</button>
              </div>
            </div>
          )}
        </div>

        {/* Context Menu for Folder Actions */}
        {contextMenu && (
          <div 
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              background: theme.cardBg,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              minWidth: 160,
              padding: 4,
            }}
            onClick={(e) => e.stopPropagation()}
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
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                color: theme.text,
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 4,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.bgTertiary}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {Icons.edit}
              <span>Rename</span>
            </button>
            <button
              onClick={() => {
                deleteFolder(contextMenu.folderId);
                setContextMenu(null);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                color: theme.error,
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 4,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = theme.errorBg}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {Icons.trash}
              <span>Delete</span>
            </button>
          </div>
        )}

        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)} 
          style={{ ...styles.sidebarToggle, left: sidebarOpen ? 24 : 24, background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textSecondary }}
        >
          {sidebarOpen ? "‹" : "›"}
        </button>

        <div style={{ ...styles.sectionMain, marginLeft: sidebarOpen ? 280 : 0 }}>
          <header style={{ ...styles.sectionHeader, background: theme.cardBg, borderColor: theme.border }}>
            <button onClick={() => router.push("/admin/dashboard")} style={styles.backBtn}>
              {Icons.back}
              <span>Dashboard</span>
            </button>
            <h1 style={styles.sectionPageTitle}>{view.charAt(0).toUpperCase() + view.slice(1)}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={toggleTheme} style={{ ...styles.themeToggle, background: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.text }}>
                {darkMode ? Icons.sun : Icons.moon}
              </button>
              <button onClick={handleLogout} style={styles.headerLogout}>
                {Icons.logout}
              </button>
            </div>
          </header>

          <main>
            {children}
          </main>
        </div>
      </div>
    </AdminProvider>
  );
}
