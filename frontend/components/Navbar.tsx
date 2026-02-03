"use client";

import Link from "next/link";
import { useState } from "react";

import type { User } from "@/types/user";

export function Navbar({ user }: { user?: User }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/login");
  }

  return (
    <header className="glass-effect border-b border-white/20">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="font-bold text-white text-xl floating">
          ✨ Todo
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/tasks" className="text-white/80 hover:text-white transition-colors duration-300 hover:scale-105">
            Tasks
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden lg:inline text-white/80 max-w-32 truncate">
                {user.displayName ?? user.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="glass-button rounded-lg px-4 py-2 text-white font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="glass-button rounded-lg px-4 py-2 text-white font-medium"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg glass-button text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 glass-effect">
          <nav className="px-4 py-4 space-y-4">
            <Link 
              href="/tasks" 
              className="block text-white/80 hover:text-white transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Tasks
            </Link>
            
            {user ? (
              <div className="space-y-4">
                <div className="text-sm text-white/70 truncate">
                  {user.displayName ?? user.email}
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="block w-full text-left glass-button rounded-lg px-4 py-3 text-white font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block glass-button rounded-lg px-4 py-3 text-white font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
