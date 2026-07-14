export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string; // URL or identifier
  totalStudyHours: number;
  longestStreak: number;
  currentStreak: number;
  lastStudiedDate: string | null; // YYYY-MM-DD
  createdAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  completed: boolean;
  completedAt?: string;
}

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: string;
  progress: number; // 0 to 100
  targetPercentage: number; // target e.g. 100
  hoursStudied: number;
  lastStudied: string | null; // YYYY-MM-DD HH:MM
  notes: string;
  archived: boolean;
  createdAt: string;
  milestones: Milestone[];
}

export interface StudySession {
  id: string;
  userId: string;
  skillId: string; // Reference to skill, or 'general'
  skillName: string;
  durationMinutes: number;
  type: 'study' | 'break';
  timestamp: string; // ISO String
  date: string; // YYYY-MM-DD
}

export interface DailyGoal {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string; // Lucide icon key
  unlocked: boolean;
  unlockedAt?: string;
  type: 'hours' | 'streak' | 'milestones' | 'sessions';
  targetValue: number;
}
