"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockTasks = [
      {
        id: 1,
        title: "Sample Task 1",
        description: "This is a sample task",
        completed: false,
        ownerId: 1
      },
      {
        id: 2,
        title: "Sample Task 2",
        description: "This is another sample task",
        completed: true,
        ownerId: 1
      }
    ];
    
    setTasks(mockTasks);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600">Overview of your tasks.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-zinc-600">Total</div>
          <div className="text-3xl font-semibold">{total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-zinc-600">Active</div>
          <div className="text-3xl font-semibold">{active}</div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-sm text-zinc-600">Completed</div>
          <div className="text-3xl font-semibold">{completed}</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="font-medium text-zinc-900">Quick actions</h2>
        <div className="mt-3 flex gap-3">
          <Link
            href="/tasks"
            className="bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800"
          >
            View tasks
          </Link>
          <Link
            href="/tasks?compose=1"
            className="border border-zinc-200 px-4 py-2 rounded-md hover:bg-zinc-50"
          >
            Add task
          </Link>
        </div>
      </div>
    </div>
  );
}
