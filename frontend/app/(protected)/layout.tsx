"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { ClientWrapper } from "@/components/ClientWrapper";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Mock user session for now
    const mockUser = {
      id: "1",
      email: "user@example.com",
      displayName: "User"
    };
    
    setUser(mockUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          {children}
        </div>
      </main>
      <ClientWrapper />
    </div>
  );
}
