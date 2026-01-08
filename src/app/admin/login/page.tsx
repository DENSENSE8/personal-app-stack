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

  return (
    <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)" }}>
      <div style={styles.loginBgDecor} />
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 24, padding: 48, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #059669, #10b981)", marginBottom: 24, boxShadow: "0 20px 40px -10px rgba(5, 150, 105, 0.3)" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: 0, marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ fontSize: 16, color: "#94a3b8", margin: 0 }}>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ marginBottom: 32 }}>
          {loginError && <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#ef4444", padding: "12px 16px", borderRadius: 12, marginBottom: 24, fontSize: 14 }}>{loginError}</div>}

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{ width: "100%", padding: "16px 20px", border: "2px solid #475569", borderRadius: 16, background: "#1e293b", color: "#f1f5f9", fontSize: 16, outline: "none", transition: "all 0.3s ease" }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ width: "100%", padding: "16px 20px", border: "2px solid #475569", borderRadius: 16, background: "#1e293b", color: "#f1f5f9", fontSize: 16, outline: "none", transition: "all 0.3s ease" }}
            />
          </div>

          <button type="submit" style={{ width: "100%", padding: "16px 32px", background: "linear-gradient(135deg, #059669, #10b981)", border: "none", color: "#fff", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease" }}>
            Sign In
          </button>
        </form>

        <button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "#059669", fontSize: 16, fontWeight: 600, cursor: "pointer", padding: "8px 0" }}>
          ← Back to Portfolio
        </button>
      </div>
    </div>
  );
}

