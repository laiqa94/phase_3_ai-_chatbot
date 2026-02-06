"use client";

import { useState } from "react";

import { Navbar } from "@/components/Navbar";
import ClientWrapper from "@/components/ClientWrapper";
import { User } from "@/types/user";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // Mock user session for now - initialized synchronously
  const [user] = useState<User | null>({
    id: "1",
    email: "user@example.com",
    displayName: "User"
  });

  return (
    <div className="min-h-screen">
      <Navbar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
      <ClientWrapper />
    </div>
  );
}
