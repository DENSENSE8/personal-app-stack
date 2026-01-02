"use client";

import { useState, useEffect } from "react";

type View = "home" | "login" | "dashboard" | "recipes" | "checklists" | "reminders";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [isAuthed, setIsAuthed] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("isAdmin");
    if (auth === "true") {
      setIsAuthed(true);
    }
  }, []);

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
  }

  function goTo(newView: View) {
    if (newView === "dashboard" || newView === "recipes" || newView === "checklists" || newView === "reminders") {
      if (!isAuthed) {
        setView("login");
        return;
      }
    }
    setView(newView);
  }

  // HOME VIEW
  if (view === "home") {
    return (
      <div style={styles.container}>
        <header style={styles.homeHeader}>
          <button onClick={() => goTo("login")} style={styles.adminLink}>
            Admin
          </button>
        </header>

        <main style={styles.homeMain}>
          <h1 style={styles.heroTitle}>Michael Garisek</h1>
          <p style={styles.heroSubtitle}>Portfolio</p>

          <div style={styles.sectionGrid}>
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Projects</h2>
              <p style={styles.sectionDesc}>Coming soon</p>
            </div>
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>About</h2>
              <p style={styles.sectionDesc}>Coming soon</p>
            </div>
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Contact</h2>
              <p style={styles.sectionDesc}>Coming soon</p>
            </div>
          </div>
        </main>

        <footer style={styles.footer}>
          © {new Date().getFullYear()} Michael Garisek
        </footer>
      </div>
    );
  }

  // LOGIN VIEW
  if (view === "login") {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <div style={styles.loginIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          
          <h1 style={styles.loginTitle}>Admin Login</h1>
          <p style={styles.loginSubtitle}>Sign in to access the dashboard</p>

          <form onSubmit={handleLogin}>
            {loginError && <div style={styles.errorBox}>{loginError}</div>}

            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.loginButton}>
              Sign In
            </button>
          </form>

          <button onClick={() => setView("home")} style={styles.backLink}>
            ← Back to Portfolio
          </button>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW
  if (view === "dashboard") {
    return (
      <div style={styles.dashboardContainer}>
        <header style={styles.dashboardHeader}>
          <h1 style={styles.dashboardTitle}>Welcome Back, Michael Garisek!</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </header>

        <main style={styles.dashboardMain}>
          <p style={styles.dashboardSubtext}>Select a section to manage:</p>

          <div style={styles.cardGrid}>
            <button onClick={() => goTo("recipes")} style={styles.dashCard}>
              <span style={styles.cardEmoji}>🍳</span>
              <h3 style={styles.cardTitle}>Recipes</h3>
              <p style={styles.cardDesc}>Manage your recipes</p>
            </button>

            <button onClick={() => goTo("checklists")} style={styles.dashCard}>
              <span style={styles.cardEmoji}>✓</span>
              <h3 style={styles.cardTitle}>Checklists</h3>
              <p style={styles.cardDesc}>Track your tasks</p>
            </button>

            <button onClick={() => goTo("reminders")} style={styles.dashCard}>
              <span style={styles.cardEmoji}>🔔</span>
              <h3 style={styles.cardTitle}>Reminders</h3>
              <p style={styles.cardDesc}>Set reminders</p>
            </button>
          </div>
        </main>
      </div>
    );
  }

  // RECIPES VIEW
  if (view === "recipes") {
    return (
      <div style={styles.pageContainer}>
        <header style={styles.pageHeader}>
          <button onClick={() => goTo("dashboard")} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>Recipes</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </header>
        <main style={styles.pageMain}>
          <div style={styles.placeholder}>
            <span style={{ fontSize: 48 }}>🍳</span>
            <h2>Your Recipes</h2>
            <p>Recipe management coming soon...</p>
          </div>
        </main>
      </div>
    );
  }

  // CHECKLISTS VIEW
  if (view === "checklists") {
    return (
      <div style={styles.pageContainer}>
        <header style={styles.pageHeader}>
          <button onClick={() => goTo("dashboard")} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>Checklists</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </header>
        <main style={styles.pageMain}>
          <div style={styles.placeholder}>
            <span style={{ fontSize: 48 }}>✓</span>
            <h2>Your Checklists</h2>
            <p>Checklist management coming soon...</p>
          </div>
        </main>
      </div>
    );
  }

  // REMINDERS VIEW
  if (view === "reminders") {
    return (
      <div style={styles.pageContainer}>
        <header style={styles.pageHeader}>
          <button onClick={() => goTo("dashboard")} style={styles.backBtn}>← Back</button>
          <h1 style={styles.pageTitle}>Reminders</h1>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </header>
        <main style={styles.pageMain}>
          <div style={styles.placeholder}>
            <span style={{ fontSize: 48 }}>🔔</span>
            <h2>Your Reminders</h2>
            <p>Reminder management coming soon...</p>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

const styles: Record<string, React.CSSProperties> = {
  // Global
  container: {
    minHeight: "100vh",
    background: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },

  // Home
  homeHeader: {
    position: "fixed" as const,
    top: 0,
    right: 0,
    padding: 24,
  },
  adminLink: {
    background: "none",
    border: "none",
    color: "#006400",
    fontSize: 14,
    cursor: "pointer",
    textDecoration: "none",
  },
  homeMain: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: 0,
    textAlign: "center" as const,
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#006400",
    marginTop: 12,
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 24,
    marginTop: 48,
    maxWidth: 700,
    width: "100%",
  },
  sectionCard: {
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: 32,
    textAlign: "center" as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: 0,
  },
  sectionDesc: {
    color: "#006400",
    marginTop: 8,
    fontSize: 14,
  },
  footer: {
    textAlign: "center" as const,
    padding: 24,
    color: "#999",
    fontSize: 14,
  },

  // Login
  loginContainer: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
    padding: 20,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  loginBox: {
    width: "100%",
    maxWidth: 380,
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: "40px 32px",
    textAlign: "center" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  loginIcon: {
    width: 64,
    height: 64,
    background: "#006400",
    borderRadius: 16,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  loginSubtitle: {
    color: "#006400",
    margin: "0 0 28px 0",
    fontSize: 15,
  },
  errorBox: {
    background: "#fff0f0",
    border: "1px solid #ffcdd2",
    color: "#c62828",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 16,
    textAlign: "left" as const,
  },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 16,
    border: "1px solid #d0d0d0",
    borderRadius: 8,
    background: "#fff",
    color: "#1a1a1a",
    boxSizing: "border-box" as const,
    outline: "none",
  },
  loginButton: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    fontWeight: 600,
    background: "#006400",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    marginTop: 8,
  },
  backLink: {
    display: "inline-block",
    marginTop: 24,
    color: "#006400",
    fontSize: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
  },

  // Dashboard
  dashboardContainer: {
    minHeight: "100vh",
    background: "#f9f9f9",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  dashboardHeader: {
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#006400",
    margin: 0,
  },
  logoutBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid #dc2626",
    color: "#dc2626",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  dashboardMain: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 24px",
    textAlign: "center" as const,
  },
  dashboardSubtext: {
    color: "#666",
    fontSize: 16,
    marginBottom: 40,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 24,
  },
  dashCard: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    padding: "32px 24px",
    cursor: "pointer",
    textAlign: "center" as const,
    transition: "all 0.2s",
  },
  cardEmoji: {
    fontSize: 36,
    display: "block",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#1a1a1a",
    margin: "0 0 8px 0",
  },
  cardDesc: {
    fontSize: 14,
    color: "#666",
    margin: 0,
  },

  // Subpages (Recipes, Checklists, Reminders)
  pageContainer: {
    minHeight: "100vh",
    background: "#f9f9f9",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  pageHeader: {
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    padding: "10px 20px",
    background: "transparent",
    border: "1px solid #006400",
    color: "#006400",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#006400",
    margin: 0,
  },
  pageMain: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "48px 24px",
  },
  placeholder: {
    textAlign: "center" as const,
    padding: 48,
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: 12,
  },
};
