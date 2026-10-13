import { useState, useEffect, useRef, useCallback } from 'react';
import { PomodoroMode, TimerStatus, TimerSettings, TimerSessionRecord } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { soundManager } from '../utils/sound';
import { getTodayDateString } from '../utils/time';
import confetti from 'canvas-confetti';

interface PersistedTimerState {
  mode: PomodoroMode;
  status: TimerStatus;
  targetEndTime: number | null; // epoch ms
  remainingSeconds: number;
  sessionCycleIndex: number; // 1 to longBreakInterval
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  lastUpdated: number;
}

const TIMER_STORAGE_KEY = 'pomodoro_active_state';

export function usePomodoroTimer(
  settings: TimerSettings,
  onSessionComplete: (record: TimerSessionRecord) => void
) {
  // Compute duration in seconds for any given mode
  const getDurationSeconds = useCallback((mode: PomodoroMode): number => {
    switch (mode) {
      case 'focus':
        return Math.max(1, Math.round(settings.focusDuration * 60));
      case 'shortBreak':
        return Math.max(1, Math.round(settings.shortBreakDuration * 60));
      case 'longBreak':
        return Math.max(1, Math.round(settings.longBreakDuration * 60));
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration]);

  // Restore persisted state or initialize fresh
  const [mode, setMode] = useState<PomodoroMode>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    return saved?.mode || 'focus';
  });

  const [status, setStatus] = useState<TimerStatus>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    if (!saved) return 'idle';
    if (saved.status === 'running' && saved.targetEndTime) {
      // Check if it already expired
      if (Date.now() >= saved.targetEndTime) {
        return 'idle'; // Expired while tab was closed
      }
      return 'running';
    }
    return saved.status;
  });

  const [sessionCycleIndex, setSessionCycleIndex] = useState<number>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    return saved?.sessionCycleIndex || 1;
  });

  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    return saved?.activeTaskId || null;
  });

  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    return saved?.activeTaskTitle || null;
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const saved = loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null);
    if (saved) {
      if (saved.status === 'running' && saved.targetEndTime) {
        const diff = Math.ceil((saved.targetEndTime - Date.now()) / 1000);
        return Math.max(0, diff);
      }
      if (saved.remainingSeconds > 0) {
        return saved.remainingSeconds;
      }
    }
    return Math.max(1, Math.round(settings.focusDuration * 60));
  });

  const targetEndTimeRef = useRef<number | null>(
    loadFromStorage<PersistedTimerState | null>(TIMER_STORAGE_KEY, null)?.targetEndTime || null
  );

  // Calculate total seconds for the current mode
  const totalSeconds = getDurationSeconds(mode);

  // Sync state to localStorage whenever critical values change
  const persistState = useCallback((
    curMode: PomodoroMode,
    curStatus: TimerStatus,
    curRemaining: number,
    curTarget: number | null,
    curCycle: number,
    taskId: string | null,
    taskTitle: string | null
  ) => {
    const data: PersistedTimerState = {
      mode: curMode,
      status: curStatus,
      remainingSeconds: curRemaining,
      targetEndTime: curTarget,
      sessionCycleIndex: curCycle,
      activeTaskId: taskId,
      activeTaskTitle: taskTitle,
      lastUpdated: Date.now()
    };
    saveToStorage(TIMER_STORAGE_KEY, data);
  }, []);

  // Completion audio and notifications
  const notifySessionCompletion = useCallback((finishedMode: PomodoroMode) => {
    // 1. Play sound if enabled
    if (settings.soundEnabled) {
      soundManager.play(settings.soundType, 0.6);
    }

    // 2. Trigger browser notification if allowed
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      const title = finishedMode === 'focus' ? '🎉 Focus Session Complete!' : '🔔 Break Finished!';
      const body = finishedMode === 'focus'
        ? 'Great job! Time to take a restorative breather.'
        : 'Break is over. Ready to dive back in?';
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // notification error
      }
    }

    // 3. Celebratory confetti if focus completed
    if (finishedMode === 'focus') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#38bdf8']
        });
      } catch {
        // confetti error
      }
    }
  }, [settings.soundEnabled, settings.soundType, settings.notificationsEnabled]);

  // Handle session transition when time expires
  const handleSessionComplete = useCallback(() => {
    const completedMode = mode;
    const completedMinutes = Math.round(totalSeconds / 60);

    // Save session record if it was a focus session
    if (completedMode === 'focus') {
      const record: TimerSessionRecord = {
        id: `pomo-${Date.now()}`,
        mode: 'focus',
        durationMinutes: completedMinutes,
        completedAt: new Date().toISOString(),
        date: getTodayDateString(),
        taskId: activeTaskId || undefined,
        taskTitle: activeTaskTitle || undefined
      };
      onSessionComplete(record);
    }

    notifySessionCompletion(completedMode);

    // Calculate next mode and cycle index
    let nextMode: PomodoroMode = 'focus';
    let nextCycle = sessionCycleIndex;

    if (completedMode === 'focus') {
      if (sessionCycleIndex >= settings.longBreakInterval) {
        nextMode = 'longBreak';
        nextCycle = 1;
      } else {
        nextMode = 'shortBreak';
        nextCycle = sessionCycleIndex + 1;
      }
    } else {
      nextMode = 'focus';
    }

    const nextDuration = getDurationSeconds(nextMode);
    const shouldAutoStart = nextMode === 'focus' ? settings.autoStartFocus : settings.autoStartBreaks;
    const nextStatus: TimerStatus = shouldAutoStart ? 'running' : 'idle';
    const nextTarget = shouldAutoStart ? Date.now() + nextDuration * 1000 : null;

    targetEndTimeRef.current = nextTarget;
    setMode(nextMode);
    setSessionCycleIndex(nextCycle);
    setRemainingSeconds(nextDuration);
    setStatus(nextStatus);

    persistState(nextMode, nextStatus, nextDuration, nextTarget, nextCycle, activeTaskId, activeTaskTitle);
  }, [
    mode,
    totalSeconds,
    activeTaskId,
    activeTaskTitle,
    onSessionComplete,
    notifySessionCompletion,
    sessionCycleIndex,
    settings.longBreakInterval,
    settings.autoStartFocus,
    settings.autoStartBreaks,
    getDurationSeconds,
    persistState
  ]);

  // Start timer
  const startTimer = useCallback(() => {
    soundManager.playClick();
    const durationToUse = remainingSeconds > 0 ? remainingSeconds : totalSeconds;
    const target = Date.now() + durationToUse * 1000;
    targetEndTimeRef.current = target;
    setStatus('running');
    setRemainingSeconds(durationToUse);
    persistState(mode, 'running', durationToUse, target, sessionCycleIndex, activeTaskId, activeTaskTitle);
  }, [remainingSeconds, totalSeconds, mode, sessionCycleIndex, activeTaskId, activeTaskTitle, persistState]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    soundManager.playClick();
    if (targetEndTimeRef.current) {
      const remaining = Math.max(0, Math.ceil((targetEndTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      targetEndTimeRef.current = null;
      setStatus('paused');
      persistState(mode, 'paused', remaining, null, sessionCycleIndex, activeTaskId, activeTaskTitle);
    }
  }, [mode, sessionCycleIndex, activeTaskId, activeTaskTitle, persistState]);

  // Resume timer
  const resumeTimer = useCallback(() => {
    startTimer();
  }, [startTimer]);

  // Reset current session timer
  const resetTimer = useCallback(() => {
    soundManager.playClick();
    targetEndTimeRef.current = null;
    const defaultSecs = getDurationSeconds(mode);
    setRemainingSeconds(defaultSecs);
    setStatus('idle');
    persistState(mode, 'idle', defaultSecs, null, sessionCycleIndex, activeTaskId, activeTaskTitle);
  }, [getDurationSeconds, mode, sessionCycleIndex, activeTaskId, activeTaskTitle, persistState]);

  // Skip to next session mode
  const skipSession = useCallback(() => {
    soundManager.playClick();
    targetEndTimeRef.current = null;
    let nextMode: PomodoroMode = 'focus';
    let nextCycle = sessionCycleIndex;

    if (mode === 'focus') {
      if (sessionCycleIndex >= settings.longBreakInterval) {
        nextMode = 'longBreak';
        nextCycle = 1;
      } else {
        nextMode = 'shortBreak';
        nextCycle = sessionCycleIndex + 1;
      }
    } else {
      nextMode = 'focus';
    }

    const nextDuration = getDurationSeconds(nextMode);
    targetEndTimeRef.current = null;
    setMode(nextMode);
    setSessionCycleIndex(nextCycle);
    setRemainingSeconds(nextDuration);
    setStatus('idle');
    persistState(nextMode, 'idle', nextDuration, null, nextCycle, activeTaskId, activeTaskTitle);
  }, [mode, sessionCycleIndex, settings.longBreakInterval, getDurationSeconds, activeTaskId, activeTaskTitle, persistState]);

  // Switch to specific mode manually
  const switchMode = useCallback((newMode: PomodoroMode) => {
    soundManager.playClick();
    targetEndTimeRef.current = null;
    const nextDuration = getDurationSeconds(newMode);
    setMode(newMode);
    setStatus('idle');
    setRemainingSeconds(nextDuration);
    persistState(newMode, 'idle', nextDuration, null, sessionCycleIndex, activeTaskId, activeTaskTitle);
  }, [getDurationSeconds, sessionCycleIndex, activeTaskId, activeTaskTitle, persistState]);

  // Set linked task
  const setTask = useCallback((taskId: string | null, taskTitle: string | null) => {
    setActiveTaskId(taskId);
    setActiveTaskTitle(taskTitle);
    persistState(mode, status, remainingSeconds, targetEndTimeRef.current, sessionCycleIndex, taskId, taskTitle);
  }, [mode, status, remainingSeconds, sessionCycleIndex, persistState]);

  // Check and recalculate tick
  const tick = useCallback(() => {
    if (status !== 'running' || !targetEndTimeRef.current) return;

    const remaining = Math.ceil((targetEndTimeRef.current - Date.now()) / 1000);
    if (remaining <= 0) {
      setRemainingSeconds(0);
      targetEndTimeRef.current = null;
      handleSessionComplete();
    } else {
      setRemainingSeconds(remaining);
    }
  }, [status, handleSessionComplete]);

  // High-frequency interval (250ms) to ensure timely ticks without drift
  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      tick();
    }, 250);

    return () => clearInterval(interval);
  }, [status, tick]);

  // Recalculate immediately on tab visibility change or window focus!
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'running') {
        tick();
      }
    };

    const handleFocus = () => {
      if (status === 'running') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [status, tick]);

  // Handle case where settings durations change while idle
  useEffect(() => {
    if (status === 'idle') {
      const freshSecs = getDurationSeconds(mode);
      setRemainingSeconds(freshSecs);
    }
  }, [settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, mode, status, getDurationSeconds]);

  return {
    mode,
    status,
    remainingSeconds,
    totalSeconds,
    sessionCycleIndex,
    activeTaskId,
    activeTaskTitle,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipSession,
    switchMode,
    setTask
  };
}
