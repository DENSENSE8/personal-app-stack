"use client";

import { motion } from "framer-motion";
import { CheckSquare, ChefHat, Search, Upload, ArrowRight, Sparkles } from "lucide-react";
import { Button, Card } from "@/components/ui";
import Link from "next/link";
import { useSession } from "next-auth/react";

const features = [
  {
    icon: CheckSquare,
    title: "Daily Checklists",
    description: "Organize your tasks with dated checklists and reminders. Track progress with visual indicators.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: ChefHat,
    title: "Recipe Collection",
    description: "Store your favorite recipes with ingredients, tags, and beautiful images.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find anything instantly with autocomplete powered by Redis caching.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    icon: Upload,
    title: "Image Uploads",
    description: "Add photos to your recipes with Vercel Blob storage integration.",
    color: "from-purple-500 to-pink-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen">
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              Your personal productivity hub
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-stone-100 mb-6 tracking-tight">
              Organize.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                Create.
              </span>{" "}
              Thrive.
            </h1>

            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-10">
              A beautiful personal app stack for managing your daily checklists, recipes, and more.
              Built with Next.js, Neon DB, Redis, and Vercel Blob.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <>
                  <Link href="/checklists">
                    <Button size="lg">
                      <CheckSquare className="w-5 h-5" />
                      View Checklists
                    </Button>
                  </Link>
                  <Link href="/recipes">
                    <Button variant="secondary" size="lg">
                      <ChefHat className="w-5 h-5" />
                      Browse Recipes
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/register">
                    <Button size="lg">
                      Get Started Free
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button variant="secondary" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-stone-950/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-stone-400 max-w-xl mx-auto">
              A complete toolkit for personal organization, powered by modern technology.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={itemVariants}>
                  <Card className="p-6 h-full">
                    <div
                      className={`
                        inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4
                        bg-gradient-to-br ${feature.color} shadow-lg
                      `}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-stone-100 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-stone-400">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">
              Built with modern tech
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Next.js", "Tailwind CSS", "Framer Motion", "Prisma", "Neon DB", "Upstash Redis", "Vercel Blob", "NextAuth.js"].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-stone-800/50 border border-stone-700 rounded-lg text-sm text-stone-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-stone-500 text-sm">
          Built with Next.js and deployed on Vercel
        </div>
      </footer>
    </div>
  );
}
