"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Hardcoded admin credentials
    if (username === "admin" && password === "admin") {
      // Set a simple cookie/localStorage flag for auth
      document.cookie = "admin_auth=true; path=/; max-age=86400";
      localStorage.setItem("isAdmin", "true");
      router.push("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
        
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Sign in to access the dashboard</p>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <a href="/" className="back-link">← Back to Portfolio</a>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .login-box {
          width: 100%;
          max-width: 380px;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 40px 32px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .login-icon {
          width: 64px;
          height: 64px;
          background: #006400;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          color: #006400;
          margin: 0 0 28px 0;
          font-size: 15px;
        }

        .login-form {
          text-align: left;
        }

        .login-error {
          background: #fff0f0;
          border: 1px solid #ffcdd2;
          color: #c62828;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 14px;
          font-size: 16px;
          border: 1px solid #d0d0d0;
          border-radius: 8px;
          background: #fff;
          color: #1a1a1a;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          border-color: #006400;
        }

        .form-group input::placeholder {
          color: #999;
        }

        .login-button {
          width: 100%;
          padding: 14px;
          font-size: 16px;
          font-weight: 600;
          background: #006400;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 8px;
          transition: background 0.2s;
        }

        .login-button:hover {
          background: #005000;
        }

        .back-link {
          display: inline-block;
          margin-top: 24px;
          color: #006400;
          text-decoration: none;
          font-size: 14px;
        }

        .back-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
