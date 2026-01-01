"use client";

import { motion } from "framer-motion";
import { ChefHat, CheckSquare, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    href: "/dashboard/recipes",
    title: "Recipes",
    description: "Manage your recipe collection",
    icon: ChefHat,
  },
  {
    href: "/dashboard/checklists",
    title: "Checklists",
    description: "Organize your tasks and to-dos",
    icon: CheckSquare,
  },
  {
    href: "/dashboard/reminders",
    title: "Reminders",
    description: "Keep track of important items",
    icon: Bell,
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-stone-900 mb-2">Dashboard</h2>
        <p className="text-stone-500">Select a section to get started</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={section.href}
                className="block p-6 bg-white border border-stone-200 rounded-xl hover:border-[#006400]/30 hover:shadow-lg hover:shadow-[#006400]/5 transition-all group"
              >
                <div className="w-12 h-12 bg-[#006400]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#006400] transition-colors">
                  <Icon className="w-6 h-6 text-[#006400] group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-stone-500 mb-4">{section.description}</p>
                <div className="flex items-center text-[#006400] text-sm font-medium">
                  Open
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
