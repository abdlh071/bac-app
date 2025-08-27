/**
 * Represents the application's user profile, stored in the public.users table.
 */
export interface AppUser {
  id: string; // User ID from Supabase Auth (UUID)
  name: string;
  username?: string;
  photo_url?: string;
  points: number;
  rank: number;
  time_spent: number;
  email?: string;
}

/**
 * Represents a task that a user can complete.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'subscription' | 'daily' | 'link' | 'level' | 'tdl';
  url?: string;
  completed: boolean;
  unlock_condition?: number;
}
