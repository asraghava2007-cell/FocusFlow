import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatMinutes, getPastDates, formatDateDisplay } from '../utils/time';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Award,
  Zap,
  Target,
  BarChart3,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScreenTimeCategory, ScreenTimeEntry, TimerSessionRecord } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { screenTimeEntries, pomodoroHistory, settings } = useApp();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  const daysCount = timeRange === 'week' ? 7 : 30;
  const pastDatesList: string[] = useMemo(() => getPastDates(daysCount), [daysCount]);
  const dateSet = useMemo(() => new Set<string>(pastDatesList), [pastDatesList]);

  // Filter entries in range
  const filteredScreenEntries: ScreenTimeEntry[] = useMemo(() => {
    return screenTimeEntries.filter((e: ScreenTimeEntry) => dateSet.has(e.date));
  }, [screenTimeEntries, dateSet]);

  const filteredPomoSessions: TimerSessionRecord[] = useMemo(() => {
    return pomodoroHistory.filter((p: TimerSessionRecord) => dateSet.has(p.date) && p.mode === 'focus');
  }, [pomodoroHistory, dateSet]);

  // Aggregate metrics
  const totalScreenMinutes = filteredScreenEntries.reduce((s: number, e: ScreenTimeEntry) => s + e.durationMinutes, 0);
  const totalFocusMinutes = filteredPomoSessions.reduce((s: number, p: TimerSessionRecord) => s + p.durationMinutes, 0);
  const totalSessionsCount = filteredPomoSessions.length;

  const averageSessionDuration = totalSessionsCount > 0
    ? Math.round(totalFocusMinutes / totalSessionsCount)
    : settings.focusDuration;

  // Day-by-day metrics
  const dailyMetrics = useMemo(() => {
    return pastDatesList.map((dateStr: string) => {
      const dayScreen = screenTimeEntries
        .filter((e: ScreenTimeEntry) => e.date === dateStr)
        .reduce((sum: number, e: ScreenTimeEntry) => sum + e.durationMinutes, 0);

      const dayPomo = pomodoroHistory
        .filter((p: TimerSessionRecord) => p.date === dateStr && p.mode === 'focus');

      const dayFocus = dayPomo.reduce((sum: number, p: TimerSessionRecord) => sum + p.durationMinutes, 0);
      const daySessions = dayPomo.length;

      return {
        date: dateStr,
        label: formatDateDisplay(dateStr),
        screenHours: +(dayScreen / 60).toFixed(1),
        focusHours: +(dayFocus / 60).toFixed(1),
        screenMinutes: dayScreen,
        focusMinutes: dayFocus,
        sessionsCount: daySessions,
        metGoal: dayFocus >= settings.dailyFocusGoal
      };
    });
  }, [pastDatesList, screenTimeEntries, pomodoroHistory, settings.dailyFocusGoal]);

  // Most Productive Day
  const mostProductiveDay = useMemo(() => {
    if (dailyMetrics.length === 0) return null;
    let maxDay = dailyMetrics[0];
    dailyMetrics.forEach(m => {
      if (m.focusMinutes > maxDay.focusMinutes) {
        maxDay = m;
      }
    });
    return maxDay.focusMinutes > 0 ? maxDay : null;
  }, [dailyMetrics]);

  // Goal Completion Rate
  const daysWithActivity = dailyMetrics.filter(m => m.focusMinutes > 0 || m.screenMinutes > 0).length;
  const daysMetGoal = dailyMetrics.filter(m => m.metGoal).length;
  const goalCompletionRate = daysWithActivity > 0 ? Math.round((daysMetGoal / daysWithActivity) * 100) : 0;

  // Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<ScreenTimeCategory, number> = {
      coding: 0,
      study: 0,
      entertainment: 0,
      social: 0,
      other: 0
    };

    filteredScreenEntries.forEach((e: ScreenTimeEntry) => {
      if (counts[e.category] !== undefined) {
        counts[e.category] += e.durationMinutes;
      }
    });

    const colors: Record<ScreenTimeCategory, string> = {
      coding: '#A78BFA',
      study: '#60A5FA',
      entertainment: '#FBBF24',
      social: '#F87171',
      other: '#94A3B8'
    };

    return (Object.keys(counts) as ScreenTimeCategory[])
      .map(cat => ({
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: counts[cat],
        color: colors[cat]
      }))
      .filter(item => item.value > 0);
  }, [filteredScreenEntries]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lavender-400" />
            Performance & Habit Analytics
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Empirical telemetry on focus blocks, screen habits, and goals
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center p-0.5 bg-midnight-card rounded-xl border border-white/[0.08] text-xs">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              timeRange === 'week'
                ? 'bg-[#242833] text-white border border-white/10 shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Weekly (7 Days)
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              timeRange === 'month'
                ? 'bg-[#242833] text-white border border-white/10 shadow-sm font-semibold'
                : 'text-gray-400 hover:text-gray-200 border border-transparent'
            }`}
          >
            Monthly (30 Days)
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-midnight-muted font-medium">Total Focus Time</span>
            <div className="p-1.5 rounded-lg bg-lavender-400/10 text-lavender-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {formatMinutes(totalFocusMinutes)}
          </div>
          <div className="text-[11px] text-midnight-muted mt-1 font-mono">
            {totalSessionsCount} completed blocks
          </div>
        </div>

        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-midnight-muted font-medium">Avg Session Length</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {averageSessionDuration} mins
          </div>
          <div className="text-[11px] text-midnight-muted mt-1 font-mono">
            Per completed interval
          </div>
        </div>

        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-midnight-muted font-medium">Top Productive Day</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono truncate">
            {mostProductiveDay ? mostProductiveDay.label : 'None yet'}
          </div>
          <div className="text-[11px] text-midnight-muted mt-1 font-mono">
            {mostProductiveDay ? `${formatMinutes(mostProductiveDay.focusMinutes)} focused` : 'No intervals recorded'}
          </div>
        </div>

        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-midnight-muted font-medium">Goal Success Rate</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {goalCompletionRate}%
          </div>
          <div className="text-[11px] text-midnight-muted mt-1 font-mono">
            {daysMetGoal} of {daysWithActivity || 1} active days met goal
          </div>
        </div>
      </div>

      {/* Main Charts: Focus vs Screen Time by Day */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Trend Area Chart */}
        <div className="lg:col-span-8 bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-white/[0.06]">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lavender-400" />
                Focus Time vs Screen Time Trends
              </h3>
              <p className="text-xs text-midnight-muted mt-0.5">
                Comparing deep focus blocks with aggregate screen time
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-lavender-300">
                <span className="w-2 h-2 rounded-full bg-lavender-400" /> Focus Time
              </span>
              <span className="flex items-center gap-1.5 text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" /> Screen Time
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="screenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#5A6072"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                />
                <YAxis
                  stroke="#5A6072"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                  tickFormatter={val => `${val}h`}
                />
                <Tooltip
                  cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#1C1F27] border border-white/10 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white border-b border-white/10 pb-1 mb-1 font-mono">
                            {d.label}
                          </div>
                          <div className="text-lavender-300 font-medium">
                            Focus: {formatMinutes(d.focusMinutes)} ({d.focusHours}h)
                          </div>
                          <div className="text-blue-300 font-medium">
                            Total Screen: {formatMinutes(d.screenMinutes)} ({d.screenHours}h)
                          </div>
                          <div className="text-midnight-muted font-mono text-[11px]">
                            Sessions: {d.sessionsCount} Pomodoro blocks
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="screenHours"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#screenGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="focusHours"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="lg:col-span-4 bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-3 border-b border-white/[0.06]">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Layers className="w-4 h-4 text-lavender-400" />
                Category Distribution
              </h3>
              <span className="text-xs text-midnight-muted font-mono">
                {timeRange === 'week' ? '7d' : '30d'}
              </span>
            </div>

            {categoryData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-center p-4">
                <Sparkles className="w-5 h-5 text-gray-600 mb-1.5" />
                <p className="text-xs text-midnight-muted">No categorized time logged for this period.</p>
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={76}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#1C1F27" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0];
                          return (
                            <div className="bg-[#1C1F27] border border-white/10 rounded-xl p-2 text-xs text-white">
                              <span className="font-semibold">{d.name}</span>: {formatMinutes(d.value as number)}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Legend Table */}
          <div className="space-y-1 pt-2.5 border-t border-white/[0.05] text-xs">
            {categoryData.map(c => {
              const totalVal = categoryData.reduce((acc, curr) => acc + curr.value, 0);
              const pct = totalVal > 0 ? Math.round((c.value / totalVal) * 100) : 0;
              return (
                <div key={c.name} className="flex items-center justify-between text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs">{c.name}</span>
                  </div>
                  <div className="font-mono text-midnight-muted text-[11px]">
                    {formatMinutes(c.value)} ({pct}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
