// Updated types for Google Auth integration
export interface UserData {
  id: number; // Keep as number for compatibility with existing code
  name: string;
  username?: string;
  photo_url?: string;
  points: number;
  rank: number;
  timeSpent: number;
}

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