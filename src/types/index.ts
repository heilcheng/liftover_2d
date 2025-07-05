export interface Habit {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'custom';
  createdAt: Date;
  completedDates: string[]; // ISO date strings
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // ISO date string
  completed: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface ContributionData {
  date: string;
  count: number;
  habits: string[]; // habit IDs completed on this date
}

export interface AppStats {
  totalHabits: number;
  activeHabits: number;
  totalCompletions: number;
  currentDate: string;
  weeklyProgress: number;
  monthlyProgress: number;
}

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  streak: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddHabit: undefined;
  HabitDetail: { habitId: string };
  Stats: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
}; 