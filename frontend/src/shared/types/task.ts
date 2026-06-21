export type TaskStatus = 'todo' | 'pending' | 'completed' | 'overdue';
export type TaskPriority = 'none' | 'low' | 'medium' | 'high';
export type TaskRange = 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
}

export interface QuickTask {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}
