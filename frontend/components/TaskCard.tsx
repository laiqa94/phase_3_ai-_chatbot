"use client";

import type { Task } from "@/types/task";

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggleComplete?: (taskId: number | string, nextCompleted: boolean) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number | string) => void;
}) {
  const isCompleted = task.completed;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <input
              aria-label={isCompleted ? "Mark task as incomplete" : "Mark task as complete"}
              type="checkbox"
              checked={isCompleted}
              onChange={() => onToggleComplete?.(task.id, !isCompleted)}
              className="h-4 w-4"
            />
            <h3 className={`truncate font-medium ${isCompleted ? "line-through text-zinc-500" : "text-zinc-900"}`}>
              {task.title}
            </h3>
          </div>

          {task.description ? (
            <p className="mt-2 text-sm text-zinc-600">{task.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(task)}
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(task.id)}
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
