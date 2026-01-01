"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, CheckSquare, ChefHat, User, LogOut, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/checklists", label: "Checklists", icon: CheckSquare },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
];

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-stone-950" />
            </div>
            <span className="font-bold text-lg text-stone-100">AppStack</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(link.href)
                      ? "text-amber-400"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                    }
                  `}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </span>
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-amber-500/10 border border-amber-500/20 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-stone-400">{session.user?.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-medium rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                Sign in
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-stone-800"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive(link.href)
                        ? "bg-amber-500/10 text-amber-400"
                        : "text-stone-400 hover:bg-stone-800"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-4 mt-4 border-t border-stone-800">
                {session ? (
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-stone-950 text-sm font-medium rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

