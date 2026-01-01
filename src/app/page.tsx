"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const sections = [
  { id: "projects", title: "Projects", description: "Coming soon" },
  { id: "about", title: "About", description: "Coming soon" },
  { id: "contact", title: "Contact", description: "Coming soon" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 right-0 p-6 z-50">
        <Link
          href="/login"
          className="text-sm text-[#006400] hover:underline transition-all"
        >
          Admin
        </Link>
      </header>

      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold text-stone-900 tracking-tight text-center"
        >
          Michael Garisek
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-xl text-[#006400] text-center"
        >
          Portfolio
        </motion.p>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="text-center p-8 border border-stone-200 rounded-lg hover:border-[#006400]/30 transition-colors"
            >
              <h2 className="text-2xl font-semibold text-stone-800 mb-2">
                {section.title}
              </h2>
              <p className="text-[#006400]">{section.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-8 text-center text-stone-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Michael Garisek</p>
      </footer>
    </div>
  );
}
