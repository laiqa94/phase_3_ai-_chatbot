"use client";

import Link from "next/link";
import { useState } from "react";

export function Navbar({ user }: { user?: any }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/login");
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/dashboard" className="font-bold text-gray-900 text-xl">
          📝 Todo App
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/tasks" className="text-gray-600 hover:text-gray-900">
            Tasks
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-sm">
                {user.displayName || user.email}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
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

      {isMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="px-4 py-4 space-y-4">
            <Link 
              href="/tasks" 
              className="block text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Tasks
            </Link>
            
            {user ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  {user.displayName || user.email}
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="block w-full text-left bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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
