"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";
import { useAdmin } from "@/context/AdminContext";

export default function DashboardPage() {
  const router = useRouter();
  const { theme, darkMode } = useAdmin();

  const categories = [
    { 
      id: "recipes", 
      title: "Recipe Collection", 
      icon: Icons.recipes, 
      desc: "Rich block-based recipes for the modern kitchen.", 
      color: "linear-gradient(135deg, #059669, #0d9488)",
      emoji: "👨‍🍳"
    }
  ];

  return (
    <div style={{ 
      ...styles.dashContainer, 
      background: darkMode ? "radial-gradient(circle at bottom right, #1e293b 0%, #0f172a 100%)" : "radial-gradient(circle at top left, #f8fafc 0%, #f1f5f9 100%)", 
      minHeight: "100vh",
      transition: "background 0.5s ease"
    }}>
      <div style={{...styles.dashBgPattern, opacity: darkMode ? 0.05 : 0.03}} />
      
      <main style={{...styles.dashMain, padding: "100px 32px"}}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <h1 style={{ ...styles.dashTitle, color: theme.textSecondary, fontSize: 18, letterSpacing: "0.2em", textTransform: "uppercase" }}>Control Center</h1>
          <motion.div 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 12 }}
          >
            <p style={{ ...styles.dashName, fontSize: 48, fontWeight: 900 }}>Michael Garisek</p>
            <span style={{ fontSize: 40, filter: "drop-shadow(0 10px 10px rgba(0,0,0,0.1))" }}>👨‍💻</span>
          </motion.div>
          <p style={{ ...styles.dashSubtext, color: theme.textSecondary, marginTop: 24, fontSize: 18 }}>Welcome to your digital workspace</p>
        </motion.div>

        <div style={{ 
          display: "flex", 
          justifyContent: "center",
          maxWidth: 1100,
          margin: "0 auto"
        }}>
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              whileHover={{ 
                y: -12, 
                scale: 1.02,
                boxShadow: darkMode ? "0 30px 60px -12px rgba(0, 0, 0, 0.5)" : "0 30px 60px -12px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => router.push(`/admin/${cat.id}`)}
              style={{ 
                ...styles.dashCard, 
                background: theme.cardBg, 
                border: `1px solid ${theme.cardBorder}`,
                padding: "60px 40px",
                maxWidth: 400,
                width: "100%"
              }}
            >
              <div style={{ 
                ...styles.cardIconWrap, 
                background: cat.color,
                width: 72,
                height: 72,
                borderRadius: 20,
              }}>
                <span style={{ fontSize: 28 }}>{cat.icon}</span>
              </div>
              <h3 style={{ ...styles.cardTitle, color: theme.text }}>{cat.title}</h3>
              <p style={{ ...styles.cardDesc, color: theme.textSecondary }}>{cat.desc}</p>
              
              <div style={{ 
                position: "absolute", 
                top: 24, 
                right: 24, 
                fontSize: 24, 
                opacity: 0.15,
                transform: "rotate(15deg)"
              }}>
                {cat.emoji}
              </div>
              
              <motion.div 
                className="mt-8 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm"
                whileHover={{ gap: 8 }}
              >
                Open Collection <Icons.back style={{ transform: "rotate(180deg)", fontSize: 12 }} />
              </motion.div>
            </motion.button>
          ))}
        </div>
      </main>
    </div>
  );
}
