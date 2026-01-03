"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const theme = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    bgSecondary: darkMode ? "#1e293b" : "#f9fafb",
    text: darkMode ? "#f1f5f9" : "#1f2937",
    textSecondary: darkMode ? "#94a3b8" : "#6b7280",
    border: darkMode ? "#334155" : "#e5e7eb",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "#334155" : "#e5e7eb",
    inputBg: darkMode ? "#1e293b" : "#f9fafb",
    inputBorder: darkMode ? "#475569" : "#e5e7eb",
    errorBg: darkMode ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
    error: "#ef4444",
    primary: "#059669",
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (username === "admin" && password === "admin") {
      localStorage.setItem("isAdmin", "true");
      router.push("/admin/dashboard");
    } else {
      setLoginError("Invalid username or password");
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("theme", !darkMode ? "dark" : "light");
  };

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

        <button onClick={() => router.push("/")} style={{ ...styles.backToHome, color: theme.primary }}>
          ← Back to Portfolio
        </button>
      </div>
    </div>
  );
}

