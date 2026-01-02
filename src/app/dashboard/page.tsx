"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.push("/login");
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    document.cookie = "admin_auth=; path=/; max-age=0";
    router.push("/");
  }

  if (!isAuthed) {
    return null;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome Back, Michael Garisek!</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <p>Use the menu below to navigate your personal dashboard.</p>
        
        <div className="dashboard-cards">
          <a href="/dashboard/recipes" className="dashboard-card">
            <div className="card-icon">🍳</div>
            <h3>Recipes</h3>
            <p>Manage your recipes</p>
          </a>
          
          <a href="/dashboard/checklists" className="dashboard-card">
            <div className="card-icon">✓</div>
            <h3>Checklists</h3>
            <p>Track your tasks</p>
          </a>
          
          <a href="/dashboard/reminders" className="dashboard-card">
            <div className="card-icon">🔔</div>
            <h3>Reminders</h3>
            <p>Set reminders</p>
          </a>
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #f9f9f9;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .dashboard-header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          padding: 20px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .dashboard-header h1 {
          font-size: 24px;
          font-weight: 700;
          color: #006400;
          margin: 0;
        }

        .logout-btn {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid #dc2626;
          color: #dc2626;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: #dc2626;
          color: #fff;
        }

        .dashboard-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px;
          text-align: center;
        }

        .dashboard-main > p {
          color: #666;
          font-size: 16px;
          margin-bottom: 40px;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }

        .dashboard-card {
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 32px 24px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .dashboard-card:hover {
          border-color: #006400;
          box-shadow: 0 4px 12px rgba(0,100,0,0.1);
        }

        .card-icon {
          font-size: 36px;
          margin-bottom: 16px;
        }

        .dashboard-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px 0;
        }

        .dashboard-card p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
