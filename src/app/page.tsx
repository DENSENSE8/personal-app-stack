"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  const theme = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#f1f5f9" : "#1f2937",
    textSecondary: darkMode ? "#94a3b8" : "#6b7280",
    cardBg: darkMode ? "#1e293b" : "#ffffff",
    cardBorder: darkMode ? "#334155" : "#e5e7eb",
    border: darkMode ? "#334155" : "#e5e7eb",
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

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
              whileHover={{ y: -10 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ 
                ...styles.sectionCard, 
                backgroundColor: theme.cardBg, 
                border: `1px solid ${theme.cardBorder}`,
                boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
              } as React.CSSProperties}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.05)"}
            >
              <span style={styles.sectionIcon}>{section.icon}</span>
              <h2 style={{ ...styles.sectionTitle, color: theme.text }}>{section.title}</h2>
              <p style={{ ...styles.sectionDesc, color: theme.textSecondary }}>{section.desc}</p>
              <span style={styles.comingSoon}>Coming Soon</span>
            </motion.div>
          ))}
        </div>
      </main>

      <footer style={{ ...styles.footer, color: "#9ca3af" }}>
        <div style={styles.footerLine} />
        <p>© {new Date().getFullYear()} Michael Garisek</p>
      </footer>
    </div>
  );
}
