"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./globals.css";

// Types
type View = "home" | "login" | "dashboard" | "recipes" | "checklists" | "reminders";

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  type: string;
  children?: FolderType[];
}

interface ChecklistItemType {
  id: string;
  text: string;
  checked: boolean;
  completedAt: string | null;
  fileUrl: string | null;
  position: number;
}

interface ChecklistType {
  id: string;
  title: string;
  folderId: string | null;
  items: ChecklistItemType[];
}

interface ReminderItemType {
  id: string;
  text: string;
  checked: boolean;
  completedAt: string | null;
  fileUrl: string | null;
  position: number;
}

interface ReminderType {
  id: string;
  title: string;
  folderId: string | null;
  items: ReminderItemType[];
}

interface EmbeddedChecklistType {
  id: string;
  title: string;
  items: ChecklistItemType[];
}

interface RecipeType {
  id: string;
  title: string;
  description: string | null;
  folderId: string | null;
  fileUrl: string | null;
  embeddedChecklist: EmbeddedChecklistType | null;
}

// Icons as inline SVGs - all with proper viewBox for centering
const Icons = {
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  recipes: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  ),
  checklist: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  reminder: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  folder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  folderOpen: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v1" />
      <path d="M5 12h14l-2 7H7l-2-7z" />
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  sidebar: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  ),
  chevronRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  chevronDown: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  reset: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  back: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  sun: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
};

export default function App() {
  const [view, setView] = useState<View>("home");
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [fabOpen, setFabOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Data states
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [checklists, setChecklists] = useState<ChecklistType[]>([]);
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [recipes, setRecipes] = useState<RecipeType[]>([]);
  
  // Modal states
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showNewItem, setShowNewItem] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Check auth and theme on mount
  useEffect(() => {
    const auth = localStorage.getItem("isAdmin");
    if (auth === "true") {
      setIsAuthed(true);
    }
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  // Toggle theme function
  function toggleTheme() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }

  // Theme colors
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

  // Get current section type
  const getCurrentType = useCallback(() => {
    if (view === "recipes") return "recipe";
    if (view === "checklists") return "checklist";
    if (view === "reminders") return "reminder";
    return null;
  }, [view]);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    const type = getCurrentType();
    if (!type) return;
    
    try {
      const res = await fetch(`/api/folders?type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setFolders(data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, [getCurrentType]);

  // Fetch items based on view
  const fetchItems = useCallback(async () => {
    const type = getCurrentType();
    if (!type) return;

    try {
      if (view === "reminders" && !selectedFolderId) {
        // Fetch all for consolidated view
        const [remRes, checkRes, recRes] = await Promise.all([
          fetch("/api/reminders"),
          fetch("/api/checklists"),
          fetch("/api/recipes"),
        ]);
        if (remRes.ok) setReminders(await remRes.json());
        if (checkRes.ok) setChecklists(await checkRes.json());
        if (recRes.ok) setRecipes(await recRes.json());
      } else {
        const endpoint = type === "recipe" ? "recipes" : type === "checklist" ? "checklists" : "reminders";
        const url = selectedFolderId 
          ? `/api/${endpoint}?folderId=${selectedFolderId}`
          : `/api/${endpoint}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (type === "recipe") setRecipes(data);
          else if (type === "checklist") setChecklists(data);
          else setReminders(data);
        }
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  }, [view, getCurrentType, selectedFolderId]);

  // Fetch data when view changes
  useEffect(() => {
    if (["recipes", "checklists", "reminders"].includes(view)) {
      fetchFolders();
      fetchItems();
    }
  }, [view, selectedFolderId, fetchFolders, fetchItems]);

  // Handlers
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAdmin", "true");
      setIsAuthed(true);
      setView("dashboard");
      setUsername("");
      setPassword("");
    } else {
      setLoginError("Invalid username or password");
    }
  }

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    setIsAuthed(false);
    setView("home");
    setFabOpen(false);
  }

  function goTo(newView: View) {
    if (["dashboard", "recipes", "checklists", "reminders"].includes(newView)) {
      if (!isAuthed) {
        setView("login");
        return;
      }
    }
    setView(newView);
    setFabOpen(false);
    setSelectedFolderId(null);
  }

  async function createFolder() {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      alert("Please enter a folder name");
      return;
    }
    const type = getCurrentType();
    if (!type) {
      console.error("No type available for folder creation");
      return;
    }

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, type }),
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("Folder created:", data);
        setNewFolderName("");
        setShowNewFolder(false);
        await fetchFolders();
      } else {
        const errorData = await res.json();
        console.error("Failed to create folder:", errorData);
        alert("Failed to create folder: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder. Check console for details.");
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm("Delete this folder?")) return;
    
    try {
      await fetch(`/api/folders/${id}`, { method: "DELETE" });
      fetchFolders();
      if (selectedFolderId === id) setSelectedFolderId(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }

  async function updateFolder(id: string, newName: string) {
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
  }

  async function createItem() {
    if (!newItemTitle.trim()) return;
    const type = getCurrentType();
    if (!type) return;

    try {
      const endpoint = type === "recipe" ? "recipes" : type === "checklist" ? "checklists" : "reminders";
      const res = await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: newItemTitle, 
          folderId: selectedFolderId,
        }),
      });
      
      if (res.ok) {
        setNewItemTitle("");
        setShowNewItem(false);
        fetchItems();
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  }

  async function toggleChecklistItem(checklistId: string, itemId: string, checked: boolean) {
    try {
      await fetch(`/api/checklists/${checklistId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !checked }),
      });
      fetchItems();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  }

  async function toggleReminderItem(reminderId: string, itemId: string, checked: boolean) {
    try {
      await fetch(`/api/reminders/${reminderId}/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !checked }),
      });
      fetchItems();
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  }

  async function addSubItem(parentId: string, text: string) {
    const type = getCurrentType();
    if (!type || !text.trim()) return;

    try {
      const endpoint = type === "checklist" 
        ? `/api/checklists/${parentId}/items`
        : `/api/reminders/${parentId}/items`;
      
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      fetchItems();
    } catch (error) {
      console.error("Error adding sub-item:", error);
    }
  }

  async function deleteItem(id: string) {
    const type = getCurrentType();
    if (!type) return;
    if (!confirm("Delete this item?")) return;

    try {
      const endpoint = type === "recipe" ? "recipes" : type === "checklist" ? "checklists" : "reminders";
      await fetch(`/api/${endpoint}/${id}`, { method: "DELETE" });
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  async function resetChecklist(id: string) {
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
      fetchItems();
    } catch (error) {
      console.error("Error resetting checklist:", error);
    }
  }

  // ==================== VIEWS ====================

  // HOME VIEW
  if (view === "home") {
  return (
      <div style={{ ...styles.homeContainer, background: darkMode ? "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)" : "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)" }}>
        {/* Decorative background elements */}
        <div style={styles.bgDecor1} />
        <div style={styles.bgDecor2} />
        <div style={styles.bgDecor3} />

        <header style={styles.homeHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={toggleTheme} style={{ ...styles.themeToggle, background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.text }}>
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <button onClick={() => goTo("login")} style={styles.adminLink}>
              Admin →
            </button>
            </div>
        </header>

        <main style={styles.homeMain}>
          <div style={styles.heroSection}>
            <div style={styles.heroGlow} />
            <h1 style={{ ...styles.heroTitle, color: theme.text }}>
              <span style={styles.heroTitleAccent}>Michael</span>
              <br />
              Garisek
            </h1>
            <p style={styles.heroSubtitle}>Creative Developer & Designer</p>
            <div style={styles.heroDivider} />
          </div>

          <div style={styles.sectionsGrid}>
            {[
              { title: "Projects", icon: "💻", desc: "Explore my latest work and experiments" },
              { title: "About", icon: "👤", desc: "Learn more about my journey and skills" },
              { title: "Contact", icon: "✉️", desc: "Let's create something amazing together" },
            ].map((section, i) => (
              <motion.div 
                key={section.title} 
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ ...styles.sectionCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
              >
                <span style={styles.sectionIcon}>{section.icon}</span>
                <h2 style={{ ...styles.sectionTitle, color: theme.text }}>{section.title}</h2>
                <p style={{ ...styles.sectionDesc, color: theme.textSecondary }}>{section.desc}</p>
                <span style={styles.comingSoon}>Coming Soon</span>
              </motion.div>
            ))}
          </div>
        </main>

        <footer style={{ ...styles.footer, color: theme.textMuted }}>
          <div style={styles.footerLine} />
          <p>© {new Date().getFullYear()} Michael Garisek</p>
        </footer>
      </div>
    );
  }

  // LOGIN VIEW
  if (view === "login") {
    return (
      <div style={{ ...styles.loginContainer, background: darkMode ? "#0f172a" : "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)" }}>
        <div style={styles.loginBgDecor} />
        <div style={{ ...styles.loginBox, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
          <div style={styles.loginHeader}>
            <button onClick={toggleTheme} style={{ ...styles.themeToggle, background: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.text, position: "absolute", top: 16, right: 16 }}>
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <div style={styles.loginIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 style={{ ...styles.loginTitle, color: theme.text }}>Welcome Back</h1>
            <p style={{ ...styles.loginSubtitle, color: theme.textSecondary }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} style={styles.loginForm}>
            {loginError && <div style={{ ...styles.errorBox, background: theme.errorBg, borderColor: theme.error }}>{loginError}</div>}

            <div style={styles.inputGroup}>
              <label style={{ ...styles.inputLabel, color: theme.text }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{ ...styles.input, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={{ ...styles.inputLabel, color: theme.text }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ ...styles.input, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
              />
            </div>

            <button type="submit" style={styles.loginButton}>
                      Sign In
            </button>
          </form>

          <button onClick={() => setView("home")} style={{ ...styles.backToHome, color: theme.primary }}>
            ← Back to Portfolio
          </button>
            </div>
        </div>
    );
  }

  // DASHBOARD VIEW
  if (view === "dashboard") {
    return (
      <div style={{ ...styles.dashContainer, background: darkMode ? "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" : "linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)" }}>
        <div style={styles.dashBgPattern} />
        
        <header style={{ ...styles.dashHeader, background: darkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)", borderColor: theme.border }}>
          <div>
            <h1 style={{ ...styles.dashTitle, color: theme.textSecondary }}>Welcome Back,</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <p style={styles.dashName}>Michael Garisek!</p>
              <span style={{ fontSize: 28 }}>👋</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={toggleTheme} style={{ ...styles.themeToggle, background: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.text }}>
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              {Icons.logout}
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main style={styles.dashMain}>
          <p style={{ ...styles.dashSubtext, color: theme.textSecondary }}>What would you like to manage today?</p>

          <div style={styles.dashCards}>
            {[
              { view: "recipes" as View, icon: Icons.recipes, title: "Recipes", desc: "Manage your favorite recipes", color: "#059669" },
              { view: "checklists" as View, icon: Icons.checklist, title: "Checklists", desc: "Track tasks and to-dos", color: "#0d9488" },
              { view: "reminders" as View, icon: Icons.reminder, title: "Reminders", desc: "Never forget important things", color: "#14b8a6" },
            ].map((card, i) => (
              <motion.button
                key={card.view}
                whileHover={{ y: -10, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => goTo(card.view)}
                style={{ ...styles.dashCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
              >
                <div style={{ ...styles.cardIconWrap, background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)` }}>
                  {card.icon}
                </div>
                <h3 style={{ ...styles.cardTitle, color: theme.text }}>{card.title}</h3>
                <p style={{ ...styles.cardDesc, color: theme.textSecondary }}>{card.desc}</p>
              </motion.button>
            ))}
          </div>
        </main>

        {/* FAB Menu - Recipes at top, Reminders at bottom */}
        <div style={styles.fabContainer}>
          {fabOpen && (
            <div style={styles.fabMenu}>
              <button onClick={() => goTo("recipes")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.recipes}
                <span>Recipes</span>
              </button>
              <button onClick={() => goTo("checklists")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.checklist}
                <span>Checklists</span>
              </button>
              <button onClick={() => goTo("reminders")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.reminder}
                <span>Reminders</span>
              </button>
            </div>
          )}
          <button onClick={() => setFabOpen(!fabOpen)} style={styles.fabButton}>
            {fabOpen ? Icons.close : Icons.menu}
          </button>
        </div>
      </div>
    );
  }

  // SECTION VIEWS (Recipes, Checklists, Reminders)
  const currentType = getCurrentType();
  const currentTitle = view === "recipes" ? "Recipes" : view === "checklists" ? "Checklists" : "Reminders";
  const currentItems = view === "recipes" ? recipes : view === "checklists" ? checklists : reminders;

  return (
    <div style={{ ...styles.sectionContainer, background: theme.bgSecondary }}>
      {/* Sidebar */}
      <div style={{ ...styles.sidebar, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", background: theme.cardBg, borderColor: theme.border }}>
        <div style={{ ...styles.sidebarHeader, borderColor: theme.border }}>
          <h2 style={{ ...styles.sidebarTitle, color: theme.text }}>Folders</h2>
          <button onClick={() => setShowNewFolder(true)} style={styles.addFolderBtn}>
            {Icons.plus}
          </button>
        </div>

        <div style={styles.folderList}>
          <button
            onClick={() => setSelectedFolderId(null)}
            style={{ ...styles.folderItem, background: !selectedFolderId ? "linear-gradient(135deg, #059669, #0d9488)" : "transparent", color: !selectedFolderId ? "#fff" : theme.text }}
          >
            {Icons.folderOpen}
            <span>All {currentTitle}</span>
          </button>
          
          {folders.map((folder) => (
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
                  style={{ ...styles.miniInput, margin: 0, padding: "8px 12px" }}
                />
              ) : (
                <button
                  onClick={() => setSelectedFolderId(folder.id)}
                  onDoubleClick={() => {
                    setEditingFolderId(folder.id);
                    setEditingFolderName(folder.name);
                  }}
                  style={{ ...styles.folderItem, background: selectedFolderId === folder.id ? "linear-gradient(135deg, #059669, #0d9488)" : "transparent", color: selectedFolderId === folder.id ? "#fff" : theme.text }}
                >
                  {Icons.folder}
                  <span>{folder.name}</span>
                </button>
              )}
              <button onClick={() => deleteFolder(folder.id)} style={{ ...styles.folderDeleteBtn, color: theme.textMuted }}>
                {Icons.trash}
              </button>
            </div>
          ))}
        </div>

        {/* New Folder Modal */}
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
              <button onClick={createFolder} style={styles.miniConfirmBtn}>Create</button>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ ...styles.sidebarToggle, left: sidebarOpen ? 260 : 0, background: theme.cardBg, border: `1px solid ${theme.border}`, color: theme.textSecondary }}>
        {sidebarOpen ? "‹" : "›"}
      </button>

      {/* Main Content */}
      <div style={{ ...styles.sectionMain, marginLeft: sidebarOpen ? 280 : 0 }}>
        <header style={{ ...styles.sectionHeader, background: theme.cardBg, borderColor: theme.border }}>
          <button onClick={() => goTo("dashboard")} style={styles.backBtn}>
            {Icons.back}
            <span>Dashboard</span>
          </button>
          <h1 style={styles.sectionPageTitle}>{currentTitle}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={toggleTheme} style={{ ...styles.themeToggle, background: theme.bgSecondary, border: `1px solid ${theme.border}`, color: theme.text }}>
              {darkMode ? Icons.sun : Icons.moon}
            </button>
            <button onClick={handleLogout} style={styles.headerLogout}>
              {Icons.logout}
            </button>
          </div>
        </header>

        <div style={styles.sectionContent}>
          {view === "reminders" && !selectedFolderId ? (
            <div style={styles.consolidatedGrid}>
              {/* Checklists - Left */}
              <div style={styles.col}>
                <h3 style={{ ...styles.colTitle, color: theme.text }}>Checklists</h3>
                <div style={styles.itemsList}>
                  {checklists.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id}
                      style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    >
                      <div style={styles.itemHeader}>
                        <h3 style={{ ...styles.itemTitle, color: theme.text, fontSize: 16 }}>{item.title}</h3>
                        <div style={styles.itemActions}>
                          <button onClick={() => resetChecklist(item.id)} style={{ ...styles.itemActionBtn, width: 28, height: 28, background: theme.bgTertiary, color: theme.textSecondary }} title="Reset">
                            {Icons.reset}
                          </button>
                          <button onClick={() => deleteItem(item.id)} style={{ ...styles.itemActionBtn, width: 28, height: 28, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                            {Icons.trash}
                          </button>
                        </div>
                      </div>
                      <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                        {item.items.map((task) => (
                          <div key={task.id} style={styles.subItem}>
                            <button
                              onClick={() => toggleChecklistItem(item.id, task.id, task.checked)}
                              style={{ ...styles.checkbox, width: 20, height: 20, background: task.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${task.checked ? "transparent" : theme.border}` }}
                            >
                              {task.checked && Icons.check}
                            </button>
                            <span style={{ ...styles.subItemText, fontSize: 13, textDecoration: task.checked ? "line-through" : "none", color: task.checked ? theme.textMuted : theme.text }}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Reminders - Middle */}
              <div style={styles.col}>
                <h3 style={{ ...styles.colTitle, color: theme.text }}>Reminders</h3>
                <div style={styles.itemsList}>
                  {reminders.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id}
                      style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    >
                      <div style={styles.itemHeader}>
                        <h3 style={{ ...styles.itemTitle, color: theme.text, fontSize: 16 }}>{item.title}</h3>
                        <div style={styles.itemActions}>
                          <button onClick={() => deleteItem(item.id)} style={{ ...styles.itemActionBtn, width: 28, height: 28, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                            {Icons.trash}
                          </button>
                        </div>
                      </div>
                      <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                        {item.items.map((ri) => (
                          <div key={ri.id} style={styles.subItem}>
                            <button
                              onClick={() => toggleReminderItem(item.id, ri.id, ri.checked)}
                              style={{ ...styles.checkbox, width: 20, height: 20, background: ri.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${ri.checked ? "transparent" : theme.border}` }}
                            >
                              {ri.checked && Icons.check}
                            </button>
                            <span style={{ ...styles.subItemText, fontSize: 13, textDecoration: ri.checked ? "line-through" : "none", color: ri.checked ? theme.textMuted : theme.text }}>
                              {ri.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recipes - Right */}
              <div style={styles.col}>
                <h3 style={{ ...styles.colTitle, color: theme.text }}>Recipes</h3>
                <div style={styles.itemsList}>
                  {recipes.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={item.id}
                      style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    >
                      <div style={styles.itemHeader}>
                        <h3 style={{ ...styles.itemTitle, color: theme.text, fontSize: 16 }}>{item.title}</h3>
                        <div style={styles.itemActions}>
                          <button onClick={() => deleteItem(item.id)} style={{ ...styles.itemActionBtn, width: 28, height: 28, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                            {Icons.trash}
                          </button>
                        </div>
                      </div>
                      {item.description && (
                        <p style={{ ...styles.recipeDesc, fontSize: 13, color: theme.textSecondary }}>{item.description}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.contentHeader}>
                <h2 style={{ ...styles.contentTitle, color: theme.text }}>
                  {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : `All ${currentTitle}`}
                </h2>
                <button onClick={() => setShowNewItem(true)} style={styles.addItemBtn}>
                  {Icons.plus}
                  <span>Add {view === "recipes" ? "Recipe" : view === "checklists" ? "Checklist" : "Reminder"}</span>
                </button>
              </div>

              {/* Items List */}
              <div style={styles.itemsList}>
                {currentItems.length === 0 ? (
                  <div style={{ ...styles.emptyState, background: theme.cardBg, borderColor: theme.border }}>
                    <span style={styles.emptyIcon}>📁</span>
                    <p style={{ color: theme.textSecondary }}>No items yet. Create your first one!</p>
                  </div>
                ) : (
                  currentItems.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={item.id} 
                      style={{ ...styles.itemCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}
                    >
                  <div style={styles.itemHeader}>
                    <h3 style={{ ...styles.itemTitle, color: theme.text }}>{item.title}</h3>
                    <div style={styles.itemActions}>
                      {view === "checklists" && (
                        <button onClick={() => resetChecklist(item.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: theme.textSecondary }} title="Reset">
                          {Icons.reset}
                        </button>
                      )}
                      <button onClick={() => deleteItem(item.id)} style={{ ...styles.itemActionBtn, background: theme.bgTertiary, color: "#ef4444" }} title="Delete">
                        {Icons.trash}
                      </button>
                    </div>
                  </div>

                  {/* Sub-items for Checklists */}
                  {view === "checklists" && (item as ChecklistType).items && (
                    <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                      {(item as ChecklistType).items.map((task) => (
                        <div key={task.id} style={styles.subItem}>
                          <button
                            onClick={() => toggleChecklistItem(item.id, task.id, task.checked)}
                            style={{ ...styles.checkbox, background: task.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${task.checked ? "transparent" : theme.border}` }}
                          >
                            {task.checked && Icons.check}
                          </button>
                          <span style={{ ...styles.subItemText, textDecoration: task.checked ? "line-through" : "none", color: task.checked ? theme.textMuted : theme.text }}>
                            {task.text}
                </span>
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addSubItem(item.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
            </div>
        </div>
                  )}

                  {/* Sub-items for Reminders */}
                  {view === "reminders" && (item as ReminderType).items && (
                    <div style={{ ...styles.subItemsList, borderColor: theme.borderLight }}>
                      {(item as ReminderType).items.map((ri) => (
                        <div key={ri.id} style={styles.subItem}>
                          <button
                            onClick={() => toggleReminderItem(item.id, ri.id, ri.checked)}
                            style={{ ...styles.checkbox, background: ri.checked ? "linear-gradient(135deg, #059669, #0d9488)" : theme.cardBg, border: `2px solid ${ri.checked ? "transparent" : theme.border}` }}
                          >
                            {ri.checked && Icons.check}
                          </button>
                          <span style={{ ...styles.subItemText, textDecoration: ri.checked ? "line-through" : "none", color: ri.checked ? theme.textMuted : theme.text }}>
                            {ri.text}
                          </span>
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addSubItem(item.id, (e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Recipe description */}
                  {view === "recipes" && (item as RecipeType).description && (
                    <p style={{ ...styles.recipeDesc, color: theme.textSecondary }}>{(item as RecipeType).description}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>

    {/* New Item Modal */}
      <AnimatePresence>
        {showNewItem && (
          <div style={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{ ...styles.modal, background: theme.cardBg }}
            >
              <h2 style={{ ...styles.modalTitle, color: theme.text }}>New {view === "recipes" ? "Recipe" : view === "checklists" ? "Checklist" : "Reminder"}</h2>
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="Enter title..."
                style={{ ...styles.modalInput, background: theme.inputBg, border: `2px solid ${theme.inputBorder}`, color: theme.text }}
                autoFocus
              />
              <div style={styles.modalActions}>
                <button onClick={() => setShowNewItem(false)} style={{ ...styles.modalCancelBtn, background: theme.bgTertiary, color: theme.textSecondary }}>Cancel</button>
                <button onClick={createItem} style={styles.modalConfirmBtn}>Create</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAB - Recipes at top, Reminders at bottom */}
      <div style={styles.fabContainer}>
        <AnimatePresence>
          {fabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              style={styles.fabMenu}
            >
              <button onClick={() => goTo("recipes")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.recipes}
                <span>Recipes</span>
              </button>
              <button onClick={() => goTo("checklists")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.checklist}
                <span>Checklists</span>
              </button>
              <button onClick={() => goTo("reminders")} style={{ ...styles.fabMenuItem, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.text }}>
                {Icons.reminder}
                <span>Reminders</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setFabOpen(!fabOpen)} 
          style={styles.fabButton}
        >
          {fabOpen ? Icons.close : Icons.menu}
        </motion.button>
      </div>
    </div>
  </div>
);
}

// ==================== STYLES ====================
const styles: Record<string, React.CSSProperties> = {
  // Theme Toggle
  themeToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 12,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  // Home
  homeContainer: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)",
    position: "relative",
    overflow: "hidden",
  },
  bgDecor1: {
    position: "absolute",
    top: -200,
    right: -200,
    width: 500,
    height: 500,
    background: "radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  bgDecor2: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 400,
    height: 400,
    background: "radial-gradient(circle, rgba(20, 184, 166, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
  },
  bgDecor3: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    height: 800,
    background: "radial-gradient(circle, rgba(5, 150, 105, 0.03) 0%, transparent 50%)",
    borderRadius: "50%",
  },
  homeHeader: {
    position: "fixed",
    top: 0,
    right: 0,
    padding: 24,
    zIndex: 100,
  },
  adminLink: {
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    padding: "10px 20px",
    borderRadius: 25,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
  },
  homeMain: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px 40px",
    position: "relative",
    zIndex: 1,
  },
  heroSection: {
    textAlign: "center",
    marginBottom: 60,
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 300,
    height: 300,
    background: "radial-gradient(circle, rgba(5, 150, 105, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(40px)",
  },
  heroTitle: {
    fontSize: "clamp(48px, 10vw, 80px)",
    fontWeight: 800,
    color: "#1f2937",
    margin: 0,
    lineHeight: 1.1,
    position: "relative",
  },
  heroTitleAccent: {
    background: "linear-gradient(135deg, #059669, #0d9488)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#059669",
    marginTop: 16,
    fontWeight: 500,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroDivider: {
    width: 60,
    height: 4,
    background: "linear-gradient(90deg, #059669, #14b8a6)",
    margin: "24px auto 0",
    borderRadius: 2,
  },
  sectionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    maxWidth: 960,
    width: "100%",
  },
  sectionCard: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    textAlign: "center",
    border: "1px solid #e5e7eb",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease-out forwards",
  },
  sectionIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 8px",
  },
  sectionDesc: {
    color: "#6b7280",
    fontSize: 14,
    margin: "0 0 16px",
    lineHeight: 1.6,
  },
  comingSoon: {
    display: "inline-block",
    background: "linear-gradient(135deg, #059669, #0d9488)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 16px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    textAlign: "center",
    padding: 32,
    color: "#9ca3af",
    fontSize: 14,
    position: "relative",
    zIndex: 1,
  },
  footerLine: {
    width: 40,
    height: 2,
    background: "linear-gradient(90deg, #059669, #14b8a6)",
    margin: "0 auto 16px",
    borderRadius: 1,
  },

  // Login
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  loginBgDecor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
  },
  loginBox: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 25px 50px -12px rgba(5, 150, 105, 0.15)",
    position: "relative",
    zIndex: 1,
  },
  loginHeader: {
    textAlign: "center",
    marginBottom: 32,
  },
  loginIcon: {
    width: 72,
    height: 72,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    borderRadius: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    boxShadow: "0 10px 30px rgba(5, 150, 105, 0.3)",
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  loginSubtitle: {
    color: "#6b7280",
    marginTop: 8,
    fontSize: 15,
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  errorBox: {
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    border: "1px solid #fecaca",
    color: "#dc2626",
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    textAlign: "center",
    fontWeight: 500,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    padding: "14px 16px",
    fontSize: 16,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    background: "#f9fafb",
    color: "#1f2937",
    outline: "none",
    transition: "all 0.2s",
  },
  loginButton: {
    padding: 16,
    fontSize: 16,
    fontWeight: 600,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    marginTop: 8,
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
    transition: "all 0.3s",
  },
  backToHome: {
    display: "block",
    textAlign: "center",
    marginTop: 24,
    color: "#059669",
    fontSize: 14,
    fontWeight: 500,
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  // Dashboard
  dashContainer: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)",
    position: "relative",
    overflow: "hidden",
  },
  dashBgPattern: {
    position: "absolute",
    inset: 0,
    background: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23059669' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E\")",
    opacity: 0.8,
  },
  dashHeader: {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(5, 150, 105, 0.1)",
    padding: "24px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  dashTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: "#6b7280",
    margin: 0,
  },
  dashName: {
    fontSize: 28,
    fontWeight: 700,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    background: "transparent",
    border: "2px solid #ef4444",
    color: "#ef4444",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  dashMain: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: "60px 24px 120px",
    position: "relative",
    zIndex: 1,
  },
  dashSubtext: {
    color: "#6b7280",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 48,
  },
  dashCards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
  },
  dashCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 32,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.3s ease",
    animation: "slideUp 0.5s ease-out forwards",
    position: "relative",
    overflow: "hidden",
  },
  cardIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    color: "#fff",
    boxShadow: "0 10px 30px rgba(5, 150, 105, 0.2)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 8px",
  },
  cardDesc: {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
  },

  // FAB
  fabContainer: {
    position: "fixed",
    bottom: 32,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  fabMenu: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    animation: "slideUp 0.3s ease-out",
  },
  fabMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 24px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    cursor: "pointer",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transition: "all 0.2s",
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 30px rgba(5, 150, 105, 0.4)",
    transition: "all 0.3s",
  },

  // Section pages
  sectionContainer: {
    minHeight: "100vh",
    background: "#f9fafb",
    display: "flex",
    position: "relative",
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    zIndex: 50,
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: 24,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  addFolderBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  folderList: {
    flex: 1,
    padding: 16,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  folderItemWrap: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  folderItem: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    border: "none",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  folderDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.2s",
  },
  miniModal: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    background: "#fff",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    border: "1px solid #e5e7eb",
  },
  miniInput: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 14,
    border: "2px solid #e5e7eb",
    borderRadius: 10,
    outline: "none",
    marginBottom: 12,
    boxSizing: "border-box",
  },
  miniModalActions: {
    display: "flex",
    gap: 8,
  },
  miniCancelBtn: {
    flex: 1,
    padding: 10,
    background: "#f3f4f6",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#6b7280",
    cursor: "pointer",
  },
  miniConfirmBtn: {
    flex: 1,
    padding: 10,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
  },
  sidebarToggle: {
    position: "fixed",
    top: "50%",
    transform: "translateY(-50%)",
    width: 24,
    height: 48,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderLeft: "none",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    zIndex: 51,
    fontSize: 16,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "left 0.3s ease",
  },
  sectionMain: {
    flex: 1,
    transition: "margin-left 0.3s ease",
    minHeight: "100vh",
  },
  sectionHeader: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 40,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "transparent",
    border: "2px solid #059669",
    color: "#059669",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  sectionPageTitle: {
    fontSize: 24,
    fontWeight: 700,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    margin: 0,
  },
  headerLogout: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "transparent",
    border: "2px solid #ef4444",
    color: "#ef4444",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionContent: {
    padding: 32,
    maxWidth: 900,
    margin: "0 auto",
  },
  contentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  },
  addItemBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    color: "#fff",
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  emptyState: {
    textAlign: "center",
    padding: 60,
    background: "#fff",
    borderRadius: 16,
    border: "2px dashed #e5e7eb",
  },
  emptyIcon: {
    fontSize: 48,
    display: "block",
    marginBottom: 16,
  },
  itemCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #e5e7eb",
    transition: "all 0.2s",
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  },
  itemActions: {
    display: "flex",
    gap: 8,
  },
  itemActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "#f3f4f6",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  subItemsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingTop: 8,
    borderTop: "1px solid #f3f4f6",
  },
  subItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    border: "2px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#fff",
    flexShrink: 0,
  },
  subItemText: {
    flex: 1,
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: "#9ca3af",
    marginLeft: 8,
  },
  addSubItem: {
    paddingTop: 8,
  },
  subItemInput: {
    width: "100%",
    padding: "10px 14px",
    fontSize: 14,
    border: "2px dashed #e5e7eb",
    borderRadius: 8,
    outline: "none",
    background: "#f9fafb",
    boxSizing: "border-box",
  },
  recipeDesc: {
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 1.6,
    margin: 0,
  },
  consolidatedGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 32,
    alignItems: "start",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  colTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 200,
    padding: 24,
  },
  modal: {
    background: "#fff",
    borderRadius: 20,
    padding: 32,
    maxWidth: 400,
    width: "100%",
    animation: "slideUp 0.3s ease-out",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 24px",
  },
  modalInput: {
    width: "100%",
    padding: "14px 16px",
    fontSize: 16,
    border: "2px solid #e5e7eb",
    borderRadius: 12,
    outline: "none",
    marginBottom: 24,
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    padding: 14,
    background: "#f3f4f6",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    color: "#6b7280",
    cursor: "pointer",
  },
  modalConfirmBtn: {
    flex: 1,
    padding: 14,
    background: "linear-gradient(135deg, #059669, #0d9488)",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(5, 150, 105, 0.3)",
  },
};
