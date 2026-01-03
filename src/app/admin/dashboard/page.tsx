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

  return (
    <div style={{ ...styles.dashContainer, background: darkMode ? "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" : "linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #ecfdf5 100%)", minHeight: "100vh" }}>
      <div style={styles.dashBgPattern} />
      
      <main style={styles.dashMain}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ ...styles.dashTitle, color: theme.textSecondary }}>Welcome Back,</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <p style={styles.dashName}>Michael Garisek!</p>
            <span style={{ fontSize: 28 }}>👨‍🍳</span>
          </div>
          <p style={{ ...styles.dashSubtext, color: theme.textSecondary, marginTop: 16 }}>Your recipe collection awaits</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push("/admin/recipes")}
            style={{ ...styles.dashCard, background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, maxWidth: 400 }}
          >
            <div style={{ ...styles.cardIconWrap, background: "linear-gradient(135deg, #059669, #0d9488)" }}>
              {Icons.recipes}
            </div>
            <h3 style={{ ...styles.cardTitle, color: theme.text }}>Recipe Collection</h3>
            <p style={{ ...styles.cardDesc, color: theme.textSecondary }}>Create, organize, and manage your favorite recipes with rich content blocks</p>
          </motion.button>
        </div>
      </main>
    </div>
  );
}

