"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";

import { useToast } from "@/components/ToastHost";

import { ParamsClient } from "./paramsClient";

type LoginResponse = {
  accessToken: string;
  expiresAt?: string;
  user: { id: string; email: string; displayName?: string };
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-pattern flex items-center justify-center p-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent, next: string | null) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(errorData.message || "Login failed");
      }

      // Process the response to ensure the cookie is set
      const data = await response.json();

      // Store token and user ID in localStorage for client-side use
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
      }
      if (data.user?.id) {
        localStorage.setItem('user_id', data.user.id.toString());
      }

      toast.success("Logged in.");
      router.replace(next ?? "/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ParamsClient>
      {(next) => (
        <div className="w-full max-w-md">
          <div className="glass-effect rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-white/80">Sign in to your account</p>
            </div>

            <form onSubmit={(e) => onSubmit(e, next)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-lg border border-white/20 bg-white/10 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 rounded-lg border border-white/20 bg-white/10 px-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent backdrop-blur-sm"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm border border-white/30 mt-6"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

              {error ? (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              ) : null}
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/80 text-sm">
                Don't have an account?{" "}
                <Link className="text-white font-medium hover:underline" href="/register">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </ParamsClient>
  );
}

