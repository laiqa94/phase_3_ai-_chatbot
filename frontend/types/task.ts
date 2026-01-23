export type Task = {
  id: number | string; // Backend returns number, but keeping flexibility
  title: string;
  description?: string;
  completed: boolean; // Backend returns 'completed' as boolean
  ownerId: number;
  createdAt?: string;
  updatedAt?: string;
  dueDate?: string;
  priority?: string;
  metadata?: Record<string, unknown>;
  labels?: string[];
};
