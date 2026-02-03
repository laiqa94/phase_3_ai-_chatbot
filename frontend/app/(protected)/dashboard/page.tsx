import Link from "next/link";

import { apiFetchServer } from "@/lib/apiServer";
import type { Task } from "@/types/task";

export default async function DashboardPage() {
  // MVP: derive counts from tasks list. If backend provides a summary endpoint later,
  // swap to that without changing UI.
  // NOTE: API path shape may differ; adjust to real backend when known.
  const tasks = await apiFetchServer<Task[]>("/api/me/tasks", {
    method: "GET",
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;

  return (
    <div className="grid gap-4 sm:gap-6 p-4 sm:p-0">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">Overview of your tasks.</p>
      </div>

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <StatCard label="Total" value={total} href="/tasks?status=all" />
        <StatCard label="Active" value={active} href="/tasks?status=pending" />
        <StatCard label="Completed" value={completed} href="/tasks?status=completed" />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
        <h2 className="font-medium text-zinc-900 text-center sm:text-left">Quick actions</h2>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Link
            href="/tasks"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 text-center transition-colors"
          >
            View tasks
          </Link>
          <Link
            href="/tasks?compose=1"
            className="rounded-md border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 text-center transition-colors"
          >
            Add task
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 hover:bg-zinc-50 transition-colors shadow-sm hover:shadow-md">
      <div className="text-center">
        <div className="text-sm text-zinc-600">{label}</div>
        <div className="mt-1 text-2xl sm:text-3xl font-semibold text-zinc-900">{value}</div>
      </div>
    </Link>
  );
}
