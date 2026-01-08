"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { styles } from "@/lib/styles";
import { Icons } from "@/lib/icons";

export default function HomePage() {
  const router = useRouter();
  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [0.7, 0.95], {
    clamp: false
  });
  const headerBlur = useTransform(scrollY, [0, 100], [8, 16], {
    clamp: false
  });

  return (
    <div style={{
      ...styles.homeContainer,
      background: "radial-gradient(circle at top right, #1e293b 0%, #0f172a 100%)",
      color: "#f8fafc",
      transition: "background 0.5s ease"
    }}>
      {/* Decorative background elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.03, 0.06, 0.03],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1]
        }}
        style={{
          ...styles.bgDecor1,
          willChange: "transform, opacity"
        }}
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.03, 0.05, 0.03],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
          delay: 2
        }}
        style={{
          ...styles.bgDecor2,
          willChange: "transform, opacity"
        }}
      />

      <motion.header
        style={{
          ...styles.homeHeader,
          background: `rgba(15, 23, 42, ${headerOpacity})`,
          backdropFilter: `blur(${headerBlur}px)`,
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            ...styles.heroSection,
            willChange: "transform, opacity"
          }}
        >
          <div style={{
            ...styles.heroGlow,
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
          }} />
          <h1 style={{
            ...styles.heroTitle,
            color: "#f8fafc"
          }}>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                ...styles.heroTitleAccent,
                willChange: "transform, opacity"
              }}
            >
              Michael
            </motion.span>
            <br />
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{
                willChange: "transform, opacity"
              }}
            >
              Garisek
            </motion.span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
              ...styles.heroSubtitle,
              willChange: "transform, opacity"
            }}
          >
            Creative Developer & Digital Architect
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.9,
              duration: 0.8,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            style={{
              ...styles.heroDivider,
              willChange: "transform",
              transformOrigin: "left"
            }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: i * 0.15,
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              viewport={{
                once: true,
                margin: "-50px"
              }}
              whileHover={{
                y: -8,
                backgroundColor: "rgba(30, 41, 59, 0.9)",
                boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.5)",
                transition: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
              style={{
                ...styles.sectionCard,
                willChange: "transform, box-shadow, background-color"
              } as React.CSSProperties}
            >
              <span style={styles.sectionIcon}>{section.icon}</span>
              <h2 style={{
                ...styles.sectionTitle,
                color: "#f8fafc"
              }}>{section.title}</h2>
              <p style={{
                ...styles.sectionDesc,
                color: "#94a3b8"
              }}>{section.desc}</p>
              <span style={styles.comingSoon}>
                Explorer
              </span>
            </motion.div>
          ))}
        </div>
      </main>

      <footer style={{ ...styles.footer, borderTop: "1px solid rgba(51, 65, 85, 0.5)", background: "rgba(15, 23, 42, 0.5)" }}>
        <div style={styles.footerLine} />
        <p style={{ letterSpacing: "0.1em", fontWeight: 500 }}>© {new Date().getFullYear()} Michael Garisek • Crafted in 2026</p>
      </footer>
    </div>
  );
}
