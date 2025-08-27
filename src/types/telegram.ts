
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface UserData {
  id: number;
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
  isActive?: boolean;
}

export interface Subject {
  name: string;
  coefficient: number;
  grade?: number;
}

export interface Branch {
  name: string;
  subjects: Subject[];
}
