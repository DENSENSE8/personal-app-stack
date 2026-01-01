"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/checklists");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/30"
          >
            <LogIn className="w-8 h-8 text-stone-950" />
          </motion.div>
          <h1 className="text-3xl font-bold text-stone-100">Welcome Back</h1>
          <p className="text-stone-400 mt-2">Sign in to your account</p>
        </div>

        <Card hover={false} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-[38px] w-5 h-5 text-stone-500" />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-[38px] w-5 h-5 text-stone-500" />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pl-10"
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-800 text-center">
            <p className="text-stone-400 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-amber-500 hover:text-amber-400 font-medium"
              >
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

