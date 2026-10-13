export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerSettings {
  focusDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // sessions before long break
  soundEnabled: boolean;
  soundType: 'zen' | 'bell' | 'marimba' | 'digital';
  notificationsEnabled: boolean;
  dailyScreenTimeGoal: number; // in minutes (e.g. 360 = 6 hours)
  dailyFocusGoal: number; // in minutes (e.g. 180 = 3 hours)
  theme: 'dark' | 'light';
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface TimerSessionRecord {
  id: string;
  mode: PomodoroMode;
  durationMinutes: number;
  completedAt: string; // ISO string
  date: string; // YYYY-MM-DD
  taskId?: string;
  taskTitle?: string;
}

export type ScreenTimeCategory = 'study' | 'coding' | 'entertainment' | 'social' | 'other';

export interface ScreenTimeEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: ScreenTimeCategory;
  durationMinutes: number;
  description: string;
  source: 'manual' | 'pomodoro';
  createdAt: string; // ISO string
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedMinutes?: number;
  completedMinutes: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface DailyGoalProgress {
  date: string; // YYYY-MM-DD
  screenTimeMinutes: number;
  focusMinutes: number;
  sessionsCompleted: number;
}

export interface AppState {
  settings: TimerSettings;
  screenTimeEntries: ScreenTimeEntry[];
  tasks: Task[];
  pomodoroHistory: TimerSessionRecord[];
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string;
  };
  dailyPriorities: string[];
}
