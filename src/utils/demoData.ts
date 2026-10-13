import { ScreenTimeEntry, Task, TimerSessionRecord, TimerSettings } from '../types';
import { getTodayDateString } from './time';

export const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  soundType: 'zen',
  notificationsEnabled: false,
  dailyScreenTimeGoal: 360, // 6 hours
  dailyFocusGoal: 150, // 2.5 hours
  theme: 'dark',
  autoStartBreaks: false,
  autoStartFocus: false,
};

export function generateSeedData(): {
  screenTimeEntries: ScreenTimeEntry[];
  tasks: Task[];
  pomodoroHistory: TimerSessionRecord[];
  dailyPriorities: string[];
} {
  const today = getTodayDateString();
  const d = new Date();

  // Helper to get formatted date string for offset days
  const getDateStr = (offsetDays: number) => {
    const target = new Date(d);
    target.setDate(target.getDate() - offsetDays);
    const y = target.getFullYear();
    const m = (target.getMonth() + 1).toString().padStart(2, '0');
    const day = target.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const tasks: Task[] = [
    {
      id: 'task-1',
      title: 'Architect FocusFlow notification pipeline',
      description: 'Implement browser notification requests and sound synthesized cues',
      priority: 'high',
      estimatedMinutes: 50,
      completedMinutes: 50,
      completed: true,
      createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    },
    {
      id: 'task-2',
      title: 'Refactor analytics aggregation and charts',
      description: 'Ensure accurate breakdowns for last 7 and 30 days',
      priority: 'high',
      estimatedMinutes: 50,
      completedMinutes: 25,
      completed: false,
      createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
      id: 'task-3',
      title: 'Write technical documentation for timer drift prevention',
      description: 'Document timestamp target delta vs interval ticks',
      priority: 'medium',
      estimatedMinutes: 25,
      completedMinutes: 0,
      completed: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: 'task-4',
      title: 'Review weekly screen-time habits',
      description: 'Cut down recreational scrolling by 20%',
      priority: 'low',
      estimatedMinutes: 15,
      completedMinutes: 15,
      completed: true,
      createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      completedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    }
  ];

  const pomodoroHistory: TimerSessionRecord[] = [
    // Today
    {
      id: 'pomo-today-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 150 * 60000).toISOString(),
      date: today,
      taskId: 'task-1',
      taskTitle: 'Architect FocusFlow notification pipeline'
    },
    {
      id: 'pomo-today-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 110 * 60000).toISOString(),
      date: today,
      taskId: 'task-1',
      taskTitle: 'Architect FocusFlow notification pipeline'
    },
    {
      id: 'pomo-today-3',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      date: today,
      taskId: 'task-2',
      taskTitle: 'Refactor analytics aggregation and charts'
    },
    // Yesterday
    {
      id: 'pomo-yest-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(1)}T10:30:00Z`,
      date: getDateStr(1),
      taskTitle: 'Codebase review'
    },
    {
      id: 'pomo-yest-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(1)}T11:15:00Z`,
      date: getDateStr(1),
      taskTitle: 'Codebase review'
    },
    {
      id: 'pomo-yest-3',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(1)}T14:20:00Z`,
      date: getDateStr(1),
      taskTitle: 'UI component library'
    },
    {
      id: 'pomo-yest-4',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(1)}T15:05:00Z`,
      date: getDateStr(1),
      taskTitle: 'UI component library'
    },
    // 2 days ago
    {
      id: 'pomo-2d-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(2)}T09:30:00Z`,
      date: getDateStr(2),
      taskTitle: 'Database design'
    },
    {
      id: 'pomo-2d-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(2)}T10:15:00Z`,
      date: getDateStr(2),
      taskTitle: 'Database design'
    },
    // 3 days ago
    {
      id: 'pomo-3d-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(3)}T11:00:00Z`,
      date: getDateStr(3),
      taskTitle: 'Sprint planning'
    },
    {
      id: 'pomo-3d-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(3)}T13:45:00Z`,
      date: getDateStr(3),
      taskTitle: 'Sprint planning'
    },
    {
      id: 'pomo-3d-3',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(3)}T14:30:00Z`,
      date: getDateStr(3),
      taskTitle: 'Code optimization'
    },
    // 4 days ago
    {
      id: 'pomo-4d-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(4)}T10:00:00Z`,
      date: getDateStr(4),
      taskTitle: 'Research and prototyping'
    },
    {
      id: 'pomo-4d-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(4)}T11:00:00Z`,
      date: getDateStr(4),
      taskTitle: 'Research and prototyping'
    },
    // 5 days ago
    {
      id: 'pomo-5d-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(5)}T15:00:00Z`,
      date: getDateStr(5),
      taskTitle: 'Bug fixing'
    },
    // 6 days ago
    {
      id: 'pomo-6d-1',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(6)}T10:30:00Z`,
      date: getDateStr(6),
      taskTitle: 'Weekly retrospective'
    },
    {
      id: 'pomo-6d-2',
      mode: 'focus',
      durationMinutes: 25,
      completedAt: `${getDateStr(6)}T11:20:00Z`,
      date: getDateStr(6),
      taskTitle: 'Weekly retrospective'
    }
  ];

  const screenTimeEntries: ScreenTimeEntry[] = [
    // Today
    {
      id: 'st-today-1',
      date: today,
      category: 'coding',
      durationMinutes: 135,
      description: 'Developing React components & Vite configuration',
      source: 'manual',
      createdAt: `${today}T12:00:00Z`
    },
    {
      id: 'st-today-2',
      date: today,
      category: 'study',
      durationMinutes: 45,
      description: 'Reading Web Audio API and Notification specs',
      source: 'manual',
      createdAt: `${today}T13:00:00Z`
    },
    {
      id: 'st-today-3',
      date: today,
      category: 'entertainment',
      durationMinutes: 50,
      description: 'Listening to instrumental soundtrack & lunch break video',
      source: 'manual',
      createdAt: `${today}T14:30:00Z`
    },
    {
      id: 'st-today-4',
      date: today,
      category: 'social',
      durationMinutes: 25,
      description: 'Quick check of team Slack and Discord discussions',
      source: 'manual',
      createdAt: `${today}T16:00:00Z`
    },

    // Yesterday
    {
      id: 'st-1d-1',
      date: getDateStr(1),
      category: 'coding',
      durationMinutes: 180,
      description: 'Frontend core features and styling',
      source: 'manual',
      createdAt: `${getDateStr(1)}T11:00:00Z`
    },
    {
      id: 'st-1d-2',
      date: getDateStr(1),
      category: 'study',
      durationMinutes: 60,
      description: 'Algorithm optimization patterns',
      source: 'manual',
      createdAt: `${getDateStr(1)}T15:00:00Z`
    },
    {
      id: 'st-1d-3',
      date: getDateStr(1),
      category: 'entertainment',
      durationMinutes: 60,
      description: 'Tech documentary on streaming',
      source: 'manual',
      createdAt: `${getDateStr(1)}T20:00:00Z`
    },
    {
      id: 'st-1d-4',
      date: getDateStr(1),
      category: 'social',
      durationMinutes: 30,
      description: 'X / LinkedIn updates',
      source: 'manual',
      createdAt: `${getDateStr(1)}T21:00:00Z`
    },

    // 2 days ago
    {
      id: 'st-2d-1',
      date: getDateStr(2),
      category: 'coding',
      durationMinutes: 120,
      description: 'Database schema and migrations',
      source: 'manual',
      createdAt: `${getDateStr(2)}T10:00:00Z`
    },
    {
      id: 'st-2d-2',
      date: getDateStr(2),
      category: 'study',
      durationMinutes: 45,
      description: 'System design case study',
      source: 'manual',
      createdAt: `${getDateStr(2)}T14:00:00Z`
    },
    {
      id: 'st-2d-3',
      date: getDateStr(2),
      category: 'entertainment',
      durationMinutes: 80,
      description: 'Gaming session',
      source: 'manual',
      createdAt: `${getDateStr(2)}T19:00:00Z`
    },
    {
      id: 'st-2d-4',
      date: getDateStr(2),
      category: 'other',
      durationMinutes: 30,
      description: 'General system maintenance',
      source: 'manual',
      createdAt: `${getDateStr(2)}T21:30:00Z`
    },

    // 3 days ago
    {
      id: 'st-3d-1',
      date: getDateStr(3),
      category: 'coding',
      durationMinutes: 160,
      description: 'Sprint issue resolutions',
      source: 'manual',
      createdAt: `${getDateStr(3)}T10:00:00Z`
    },
    {
      id: 'st-3d-2',
      date: getDateStr(3),
      category: 'study',
      durationMinutes: 75,
      description: 'TypeScript 5.6 features review',
      source: 'manual',
      createdAt: `${getDateStr(3)}T13:00:00Z`
    },
    {
      id: 'st-3d-3',
      date: getDateStr(3),
      category: 'social',
      durationMinutes: 40,
      description: 'Productivity communities',
      source: 'manual',
      createdAt: `${getDateStr(3)}T18:00:00Z`
    },

    // 4 days ago
    {
      id: 'st-4d-1',
      date: getDateStr(4),
      category: 'coding',
      durationMinutes: 110,
      description: 'API endpoint stress testing',
      source: 'manual',
      createdAt: `${getDateStr(4)}T11:00:00Z`
    },
    {
      id: 'st-4d-2',
      date: getDateStr(4),
      category: 'entertainment',
      durationMinutes: 90,
      description: 'YouTube tutorials & podcasts',
      source: 'manual',
      createdAt: `${getDateStr(4)}T16:00:00Z`
    },

    // 5 days ago
    {
      id: 'st-5d-1',
      date: getDateStr(5),
      category: 'coding',
      durationMinutes: 140,
      description: 'Bug fixing and PR reviews',
      source: 'manual',
      createdAt: `${getDateStr(5)}T10:00:00Z`
    },
    {
      id: 'st-5d-2',
      date: getDateStr(5),
      category: 'social',
      durationMinutes: 50,
      description: 'Tech forums & networking',
      source: 'manual',
      createdAt: `${getDateStr(5)}T17:00:00Z`
    },

    // 6 days ago
    {
      id: 'st-6d-1',
      date: getDateStr(6),
      category: 'study',
      durationMinutes: 90,
      description: 'Weekly reading: Clean Architecture',
      source: 'manual',
      createdAt: `${getDateStr(6)}T09:00:00Z`
    },
    {
      id: 'st-6d-2',
      date: getDateStr(6),
      category: 'coding',
      durationMinutes: 130,
      description: 'Prototyping timer components',
      source: 'manual',
      createdAt: `${getDateStr(6)}T14:00:00Z`
    },
    {
      id: 'st-6d-3',
      date: getDateStr(6),
      category: 'entertainment',
      durationMinutes: 70,
      description: 'Movie night',
      source: 'manual',
      createdAt: `${getDateStr(6)}T20:00:00Z`
    }
  ];

  const dailyPriorities: string[] = [
    'Complete deep work session before noon',
    'Keep social media usage under 30 minutes',
    'Take a 5-minute movement break between Pomodoros',
    'Review screen-time totals before concluding evening'
  ];

  return { screenTimeEntries, tasks, pomodoroHistory, dailyPriorities };
}
