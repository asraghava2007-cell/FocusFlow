import React from 'react';
import { useApp } from '../../context/AppContext';
import { Monitor, Flame, CheckCircle, Target, ArrowUpRight } from 'lucide-react';
import { formatMinutes } from '../../utils/time';

export const OverviewCards: React.FC = () => {
  const { screenTimeEntries, pomodoroHistory, settings, timer, setCurrentPage } = useApp();

  const todayDate = new Date().toISOString().slice(0, 10);

  // 1. Total Screen Time Today
  const todayScreenEntries = screenTimeEntries.filter(e => e.date === todayDate);
  const totalScreenMinutes = todayScreenEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

  // 2. Focused Time Today
  const todayPomoSessions = pomodoroHistory.filter(p => p.date === todayDate && p.mode === 'focus');
  let focusedMinutes = todayPomoSessions.reduce((sum, p) => sum + p.durationMinutes, 0);

  if (timer.status === 'running' && timer.mode === 'focus') {
    const elapsedMinutes = Math.floor((timer.totalSeconds - timer.remainingSeconds) / 60);
    focusedMinutes += Math.max(0, elapsedMinutes);
  }

  // 3. Sessions Completed Today
  const sessionsCount = todayPomoSessions.length;

  // 4. Daily Goals Progress
  const screenTimeGoalMinutes = settings.dailyScreenTimeGoal || 360;
  const screenTimePct = Math.min(100, Math.round((totalScreenMinutes / screenTimeGoalMinutes) * 100));

  const focusGoalMinutes = settings.dailyFocusGoal || 150;
  const focusPct = Math.min(100, Math.round((focusedMinutes / focusGoalMinutes) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Total Screen Time */}
      <div
        onClick={() => setCurrentPage('screentime')}
        className="group relative p-4 sm:p-5 rounded-card bg-midnight-card border border-white/[0.07] hover:border-white/[0.12] transition-all duration-150 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-midnight-muted">Total Screen Time</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Monitor className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {formatMinutes(totalScreenMinutes)}
          </span>
          <span className="text-[11px] text-midnight-muted">today</span>
        </div>
        {/* Progress against limit */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[11px] text-midnight-muted mb-1 font-mono">
            <span>Budget: {formatMinutes(screenTimeGoalMinutes)}</span>
            <span className={screenTimePct > 100 ? 'text-amber-400' : 'text-gray-300'}>
              {screenTimePct}%
            </span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                screenTimePct > 100 ? 'bg-amber-400' : 'bg-blue-400'
              }`}
              style={{ width: `${Math.min(100, screenTimePct)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Focused Time */}
      <div
        onClick={() => setCurrentPage('timer')}
        className="group relative p-4 sm:p-5 rounded-card bg-midnight-card border border-white/[0.07] hover:border-lavender-400/30 transition-all duration-150 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-midnight-muted">Deep Focus Time</span>
          <div className="p-1.5 rounded-lg bg-lavender-400/10 text-lavender-400 border border-lavender-400/20">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {formatMinutes(focusedMinutes)}
          </span>
          <span className="text-[11px] text-lavender-300 font-mono">deep work</span>
        </div>
        {/* Progress against target */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[11px] text-midnight-muted mb-1 font-mono">
            <span>Goal: {formatMinutes(focusGoalMinutes)}</span>
            <span className="text-lavender-300 font-semibold">{focusPct}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className="h-full rounded-full bg-lavender-400 transition-all duration-500"
              style={{ width: `${focusPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: Sessions Completed */}
      <div
        onClick={() => setCurrentPage('timer')}
        className="group relative p-4 sm:p-5 rounded-card bg-midnight-card border border-white/[0.07] hover:border-white/[0.12] transition-all duration-150 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-midnight-muted">Completed Sessions</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {sessionsCount}
          </span>
          <span className="text-[11px] text-midnight-muted font-mono">Pomodoros</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-midnight-muted font-mono">
          <span>{sessionsCount * settings.focusDuration}m standard target</span>
          <span className="text-emerald-400 flex items-center gap-0.5">
            Tracked <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Card 4: Daily Goal Status */}
      <div
        onClick={() => setCurrentPage('settings')}
        className="group relative p-4 sm:p-5 rounded-card bg-midnight-card border border-white/[0.07] hover:border-white/[0.12] transition-all duration-150 shadow-sm cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-medium text-midnight-muted">Goal Completion</span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-mono">
            {focusPct}%
          </span>
          <span className="text-[11px] text-midnight-muted">today</span>
        </div>
        <div className="mt-2.5">
          <div className="flex justify-between text-[11px] text-midnight-muted mb-1 font-mono">
            <span>
              {focusedMinutes >= focusGoalMinutes ? 'Goal met' : `${focusGoalMinutes - focusedMinutes}m remaining`}
            </span>
            <span className="text-gray-300">{focusedMinutes}/{focusGoalMinutes}m</span>
          </div>
          <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                focusPct >= 100 ? 'bg-emerald-400' : 'bg-lavender-400'
              }`}
              style={{ width: `${Math.min(100, focusPct)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
