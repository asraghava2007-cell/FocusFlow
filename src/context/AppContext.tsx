import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppState,
  ScreenTimeEntry,
  Task,
  TimerSessionRecord,
  TimerSettings
} from '../types';
import { loadFromStorage, saveToStorage, clearAllStorage, removeFromStorage } from '../utils/storage';
import { defaultSettings, generateSeedData } from '../utils/demoData';
import { usePomodoroTimer } from '../hooks/usePomodoroTimer';
import { getTodayDateString } from '../utils/time';

export type PageId = 'dashboard' | 'timer' | 'screentime' | 'analytics' | 'settings';

interface AppContextValue {
  // Navigation
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;

  // Settings
  settings: TimerSettings;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  toggleTheme: () => void;

  // Screen Time Data
  screenTimeEntries: ScreenTimeEntry[];
  addScreenTimeEntry: (entry: Omit<ScreenTimeEntry, 'id' | 'createdAt'>) => void;
  updateScreenTimeEntry: (id: string, updates: Partial<ScreenTimeEntry>) => void;
  deleteScreenTimeEntry: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: { title: string; description?: string; priority: Task['priority']; estimatedMinutes?: number }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Pomodoro
  pomodoroHistory: TimerSessionRecord[];
  timer: ReturnType<typeof usePomodoroTimer>;
  startTaskPomodoro: (task: Task) => void;

  // Daily Priorities & Streaks
  dailyPriorities: string[];
  addPriority: (text: string) => void;
  removePriority: (index: number) => void;
  streaks: AppState['streaks'];

  // Global Actions
  loadDemoData: () => void;
  resetAllData: () => void;
  fullAppState: AppState;
}

const AppContext = createContext<AppContextValue | null>(null);

const RESET_KEY = 'progress_reset_to_zero_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Page Navigation
  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as PageId;
      if (['dashboard', 'timer', 'screentime', 'analytics', 'settings'].includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  });

  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  // Execute one-time hard reset to 0 if not already executed
  if (typeof window !== 'undefined') {
    const hasReset = loadFromStorage<boolean>(RESET_KEY, false);
    if (!hasReset) {
      removeFromStorage('screen_time_entries');
      removeFromStorage('tasks');
      removeFromStorage('pomodoro_history');
      removeFromStorage('daily_priorities');
      removeFromStorage('streaks');
      removeFromStorage('pomodoro_active_state');
      saveToStorage(RESET_KEY, true);
    }
  }

  // Settings state
  const [settings, setSettings] = useState<TimerSettings>(() => {
    return loadFromStorage<TimerSettings>('settings', defaultSettings);
  });

  // Screen-time entries state — strictly starts at 0 entries
  const [screenTimeEntries, setScreenTimeEntries] = useState<ScreenTimeEntry[]>(() => {
    return loadFromStorage<ScreenTimeEntry[]>('screen_time_entries', []);
  });

  // Tasks state — strictly starts at 0 tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    return loadFromStorage<Task[]>('tasks', []);
  });

  // Pomodoro history state — strictly starts at 0 completed sessions
  const [pomodoroHistory, setPomodoroHistory] = useState<TimerSessionRecord[]>(() => {
    return loadFromStorage<TimerSessionRecord[]>('pomodoro_history', []);
  });

  // Daily priorities state — strictly starts at 0 priorities
  const [dailyPriorities, setDailyPriorities] = useState<string[]>(() => {
    return loadFromStorage<string[]>('daily_priorities', []);
  });

  // Streaks state — strictly starts at 0
  const [streaks, setStreaks] = useState<AppState['streaks']>(() => {
    return loadFromStorage<AppState['streaks']>('streaks', {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: getTodayDateString()
    });
  });

  // Sync settings to localStorage and DOM theme class
  useEffect(() => {
    saveToStorage('settings', settings);
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [settings]);

  // Sync other items to storage
  useEffect(() => {
    saveToStorage('screen_time_entries', screenTimeEntries);
  }, [screenTimeEntries]);

  useEffect(() => {
    saveToStorage('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage('pomodoro_history', pomodoroHistory);
  }, [pomodoroHistory]);

  useEffect(() => {
    saveToStorage('daily_priorities', dailyPriorities);
  }, [dailyPriorities]);

  useEffect(() => {
    saveToStorage('streaks', streaks);
  }, [streaks]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  }, []);

  // Update streaks whenever a focus session or action completes
  const updateStreakForActivity = useCallback(() => {
    const today = getTodayDateString();
    setStreaks(prev => {
      if (prev.lastActiveDate === today && prev.currentStreak > 0) return prev;
      
      const last = new Date(prev.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

      let newCurrent = prev.currentStreak;
      if (diffDays === 1 || prev.currentStreak === 0) {
        newCurrent += 1;
      } else if (diffDays > 1) {
        newCurrent = 1;
      }

      const newLongest = Math.max(prev.longestStreak, newCurrent);
      return {
        currentStreak: newCurrent,
        longestStreak: newLongest,
        lastActiveDate: today
      };
    });
  }, []);

  // Session completion callback
  const handleSessionComplete = useCallback((record: TimerSessionRecord) => {
    setPomodoroHistory(prev => [record, ...prev]);

    // Also add an automated screen-time entry for this focus session
    const pomoEntry: ScreenTimeEntry = {
      id: `st-pomo-${record.id}`,
      date: record.date,
      category: 'coding', // default focus category
      durationMinutes: record.durationMinutes,
      description: record.taskTitle ? `Pomodoro: ${record.taskTitle}` : 'Completed Pomodoro session',
      source: 'pomodoro',
      createdAt: record.completedAt
    };
    setScreenTimeEntries(prev => [pomoEntry, ...prev]);

    // If attached to a task, increment task minutes
    if (record.taskId) {
      setTasks(prev =>
        prev.map(t =>
          t.id === record.taskId
            ? { ...t, completedMinutes: t.completedMinutes + record.durationMinutes }
            : t
        )
      );
    }

    updateStreakForActivity();
  }, [updateStreakForActivity]);

  // Initialize Pomodoro timer hook
  const timer = usePomodoroTimer(settings, handleSessionComplete);

  // Screen Time Actions
  const addScreenTimeEntry = useCallback((entry: Omit<ScreenTimeEntry, 'id' | 'createdAt'>) => {
    const newEntry: ScreenTimeEntry = {
      ...entry,
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    setScreenTimeEntries(prev => [newEntry, ...prev]);
    updateStreakForActivity();
  }, [updateStreakForActivity]);

  const updateScreenTimeEntry = useCallback((id: string, updates: Partial<ScreenTimeEntry>) => {
    setScreenTimeEntries(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const deleteScreenTimeEntry = useCallback((id: string) => {
    setScreenTimeEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  // Task Actions
  const addTask = useCallback((taskData: { title: string; description?: string; priority: Task['priority']; estimatedMinutes?: number }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      estimatedMinutes: taskData.estimatedMinutes,
      completedMinutes: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    if (timer.activeTaskId === id) {
      timer.setTask(null, null);
    }
  }, [timer]);

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined
          };
        }
        return t;
      })
    );
  }, []);

  // Start Pomodoro directly linked to a specific task
  const startTaskPomodoro = useCallback((task: Task) => {
    timer.setTask(task.id, task.title);
    setCurrentPage('timer');
    if (timer.status !== 'running') {
      timer.startTimer();
    }
  }, [timer]);

  // Priorities
  const addPriority = useCallback((text: string) => {
    if (!text.trim()) return;
    setDailyPriorities(prev => [...prev, text.trim()]);
  }, []);

  const removePriority = useCallback((index: number) => {
    setDailyPriorities(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Demo data and Reset
  const loadDemoData = useCallback(() => {
    const seed = generateSeedData();
    setScreenTimeEntries(seed.screenTimeEntries);
    setTasks(seed.tasks);
    setPomodoroHistory(seed.pomodoroHistory);
    setDailyPriorities(seed.dailyPriorities);
    setStreaks({
      currentStreak: 5,
      longestStreak: 12,
      lastActiveDate: getTodayDateString()
    });
  }, []);

  const resetAllData = useCallback(() => {
    clearAllStorage();
    saveToStorage(RESET_KEY, true);
    setScreenTimeEntries([]);
    setTasks([]);
    setPomodoroHistory([]);
    setDailyPriorities([]);
    setSettings(defaultSettings);
    setStreaks({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: getTodayDateString()
    });
    timer.resetTimer();
  }, [timer]);

  const fullAppState: AppState = useMemo(() => ({
    settings,
    screenTimeEntries,
    tasks,
    pomodoroHistory,
    streaks,
    dailyPriorities
  }), [settings, screenTimeEntries, tasks, pomodoroHistory, streaks, dailyPriorities]);

  const value: AppContextValue = {
    currentPage,
    setCurrentPage,
    settings,
    updateSettings,
    toggleTheme,
    screenTimeEntries,
    addScreenTimeEntry,
    updateScreenTimeEntry,
    deleteScreenTimeEntry,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    pomodoroHistory,
    timer,
    startTaskPomodoro,
    dailyPriorities,
    addPriority,
    removePriority,
    streaks,
    loadDemoData,
    resetAllData,
    fullAppState
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
