"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { scrollY } = useScroll();
  
  const headerOpacity = useTransform(scrollY, [0, 100], [0.5, 0.9]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 12]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") setDarkMode(true);
  }, []);

  const theme = {
    bg: darkMode ? "#0f172a" : "#ffffff",
    text: darkMode ? "#f8fafc" : "#0f172a",
    textSecondary: darkMode ? "#94a3b8" : "#64748b",
    cardBg: darkMode ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
    cardBorder: darkMode ? "rgba(51, 65, 85, 0.5)" : "rgba(226, 232, 240, 0.8)",
    border: darkMode ? "#334155" : "#e2e8f0",
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return (
    <div style={{ 
      ...styles.homeContainer, 
      background: darkMode ? "radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)" : "radial-gradient(circle at top left, #ffffff 0%, #f0fdf4 100%)",
      color: theme.text,
      transition: "background 0.5s ease"
    }}>
      {/* Decorative background elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={styles.bgDecor1} 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.08, 0.05],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={styles.bgDecor2} 
      />

      <motion.header 
        style={{
          ...styles.homeHeader,
          background: darkMode ? `rgba(15, 23, 42, ${headerOpacity})` : `rgba(255, 255, 255, ${headerOpacity})`,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: darkMode ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme} 
            style={{ 
              ...styles.themeToggle, 
              background: theme.cardBg, 
              border: `1px solid ${theme.border}`, 
              color: theme.text,
              boxShadow: "none"
            }}
          >
            {darkMode ? Icons.sun : Icons.moon}
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/login")}
            style={styles.adminLink}
          >
            Admin Portal
          </motion.button>
        </div>
      </motion.header>

      <main style={styles.homeMain}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={styles.heroSection}
        >
          <div style={{...styles.heroGlow, background: darkMode ? "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)" : styles.heroGlow.background}} />
          <h1 style={{ ...styles.heroTitle, color: theme.text }}>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={styles.heroTitleAccent}
            >
              Michael
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Garisek
            </motion.span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            style={{...styles.heroSubtitle, color: darkMode ? theme.textSecondary : styles.heroSubtitle.color}}
          >
            Creative Developer & Digital Architect
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={styles.heroDivider} 
          />
        </motion.div>

        <div style={styles.sectionsGrid}>
          {[
            { title: "Portfolio", icon: "💎", desc: "A curated collection of digital experiences and experiments built with precision." },
            { title: "Journal", icon: "📓", desc: "Thoughts on design, engineering, and the future of creative technology." },
            { title: "Connect", icon: "🤝", desc: "Looking for a partner in building something extraordinary? Let's talk." },
          ].map((section, i) => (
            <motion.div 
              key={section.title} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -12, 
                backgroundColor: darkMode ? "rgba(30, 41, 59, 0.9)" : "rgba(255, 255, 255, 1)",
                boxShadow: darkMode ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 25px 50px -12px rgba(0, 0, 0, 0.1)"
              }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{ 
                ...styles.sectionCard, 
                backgroundColor: theme.cardBg, 
                border: `1px solid ${theme.cardBorder}`,
              } as React.CSSProperties}
            >
              <span style={styles.sectionIcon}>{section.icon}</span>
              <h2 style={{ ...styles.sectionTitle, color: theme.text }}>{section.title}</h2>
              <p style={{ ...styles.sectionDesc, color: theme.textSecondary }}>{section.desc}</p>
              <span style={{
                ...styles.comingSoon,
                background: darkMode ? "rgba(16, 185, 129, 0.1)" : styles.comingSoon.background,
                color: darkMode ? "#10b981" : styles.comingSoon.color,
                borderColor: darkMode ? "rgba(16, 185, 129, 0.2)" : styles.comingSoon.borderColor,
              }}>
                Explorer
              </span>
            </motion.div>
          ))}
        </div>
      </main>

      <footer style={{ ...styles.footer, borderTop: `1px solid ${theme.border}`, background: darkMode ? "rgba(15, 23, 42, 0.5)" : "rgba(255, 255, 255, 0.3)" }}>
        <div style={styles.footerLine} />
        <p style={{ letterSpacing: "0.1em", fontWeight: 500 }}>© {new Date().getFullYear()} Michael Garisek • Crafted in 2026</p>
      </footer>
    </div>
  );
}
