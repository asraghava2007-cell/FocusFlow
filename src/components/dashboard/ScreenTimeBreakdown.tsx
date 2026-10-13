import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenTimeCategory } from '../../types';
import { formatMinutes, getPastDates, formatDateDisplay, getTodayDateString } from '../../utils/time';
import { CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Plus, BarChart2, PieChart, Layers, ShieldCheck, Trash2 } from 'lucide-react';
import { LogScreenTimeModal } from '../screentime/LogScreenTimeModal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

type TimeRangeFilter = 'today' | '7days' | '30days';

export const ScreenTimeBreakdown: React.FC = () => {
  const { screenTimeEntries, deleteScreenTimeEntry } = useApp();
  const [filter, setFilter] = useState<TimeRangeFilter>('7days');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const todayStr = getTodayDateString();

  // Filter entries based on range
  const filteredEntries = useMemo(() => {
    if (filter === 'today') {
      return screenTimeEntries.filter(e => e.date === todayStr);
    }
    const days = filter === '7days' ? 7 : 30;
    const pastDates = new Set(getPastDates(days));
    return screenTimeEntries.filter(e => pastDates.has(e.date));
  }, [screenTimeEntries, filter, todayStr]);

  // Aggregate category stats
  const categoryStats = useMemo(() => {
    const cats: Record<ScreenTimeCategory, { totalMinutes: number; count: number; manual: number; pomodoro: number }> = {
      study: { totalMinutes: 0, count: 0, manual: 0, pomodoro: 0 },
      coding: { totalMinutes: 0, count: 0, manual: 0, pomodoro: 0 },
      entertainment: { totalMinutes: 0, count: 0, manual: 0, pomodoro: 0 },
      social: { totalMinutes: 0, count: 0, manual: 0, pomodoro: 0 },
      other: { totalMinutes: 0, count: 0, manual: 0, pomodoro: 0 },
    };

    filteredEntries.forEach(entry => {
      if (cats[entry.category]) {
        cats[entry.category].totalMinutes += entry.durationMinutes;
        cats[entry.category].count += 1;
        if (entry.source === 'pomodoro') {
          cats[entry.category].pomodoro += entry.durationMinutes;
        } else {
          cats[entry.category].manual += entry.durationMinutes;
        }
      }
    });

    const overallTotal = Object.values(cats).reduce((sum, c) => sum + c.totalMinutes, 0);

    return {
      byCategory: cats,
      overallTotal,
      list: (Object.keys(cats) as ScreenTimeCategory[]).map(catKey => ({
        category: catKey,
        ...cats[catKey],
        percentage: overallTotal > 0 ? Math.round((cats[catKey].totalMinutes / overallTotal) * 100) : 0
      }))
    };
  }, [filteredEntries]);

  // Daily Chart Data for the selected range
  const chartData = useMemo(() => {
    const days = filter === 'today' ? 1 : filter === '7days' ? 7 : 30;
    const dates = getPastDates(days);

    return dates.map(dateKey => {
      const dayEntries = screenTimeEntries.filter(e => e.date === dateKey);
      const coding = dayEntries.filter(e => e.category === 'coding').reduce((s, e) => s + e.durationMinutes, 0);
      const study = dayEntries.filter(e => e.category === 'study').reduce((s, e) => s + e.durationMinutes, 0);
      const entertainment = dayEntries.filter(e => e.category === 'entertainment').reduce((s, e) => s + e.durationMinutes, 0);
      const social = dayEntries.filter(e => e.category === 'social').reduce((s, e) => s + e.durationMinutes, 0);
      const other = dayEntries.filter(e => e.category === 'other').reduce((s, e) => s + e.durationMinutes, 0);
      const total = coding + study + entertainment + social + other;

      return {
        date: dateKey,
        label: formatDateDisplay(dateKey),
        totalHours: +(total / 60).toFixed(1),
        totalMinutes: total,
        coding,
        study,
        entertainment,
        social,
        other
      };
    });
  }, [screenTimeEntries, filter]);

  const categoryColors: Record<ScreenTimeCategory, string> = {
    coding: '#A78BFA', // Soft lavender
    study: '#60A5FA',
    entertainment: '#FBBF24',
    social: '#F87171',
    other: '#94A3B8'
  };

  return (
    <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">Screen-Time Breakdown</h2>
            <span className="text-[11px] text-lavender-300 font-mono bg-lavender-400/10 px-2 py-0.5 rounded-md border border-lavender-400/20">
              {formatMinutes(categoryStats.overallTotal)}
            </span>
          </div>
          <p className="text-xs text-midnight-muted mt-0.5">
            Conscious manual records and Pomodoro session breakdown
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Pills */}
          <div className="flex items-center p-0.5 bg-midnight-bg rounded-xl border border-white/[0.06] text-xs">
            {(['today', '7days', '30days'] as TimeRangeFilter[]).map(r => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  filter === r
                    ? 'bg-[#1C1F27] text-white border border-white/10 shadow-sm font-semibold'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7days' ? '7 Days' : '30 Days'}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsLogModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Entry
          </Button>
        </div>
      </div>

      {/* Main Grid: Chart & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Usage Timeline Chart */}
        <div className="lg:col-span-7 bg-midnight-bg rounded-xl p-4 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-lavender-400" />
              Usage Timeline (Hours)
            </span>
            <span className="text-[11px] text-midnight-muted font-mono">
              Avg: {(categoryStats.overallTotal / (chartData.length * 60 || 1)).toFixed(1)} hrs/day
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#1C1F27] border border-white/10 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                          <div className="font-semibold text-white border-b border-white/10 pb-1 mb-1 font-mono">
                            {data.label}
                          </div>
                          <div className="text-lavender-300 font-mono font-medium">
                            Total: {formatMinutes(data.totalMinutes)} ({data.totalHours}h)
                          </div>
                          {data.coding > 0 && <div className="text-gray-400">Coding: {formatMinutes(data.coding)}</div>}
                          {data.study > 0 && <div className="text-gray-400">Study: {formatMinutes(data.study)}</div>}
                          {data.entertainment > 0 && <div className="text-gray-400">Entertainment: {formatMinutes(data.entertainment)}</div>}
                          {data.social > 0 && <div className="text-gray-400">Social: {formatMinutes(data.social)}</div>}
                          {data.other > 0 && <div className="text-gray-400">Other: {formatMinutes(data.other)}</div>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="totalHours" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.date === todayStr ? '#A78BFA' : '#3B82F6'}
                      fillOpacity={entry.date === todayStr ? 0.95 : 0.6}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Category Distribution */}
        <div className="lg:col-span-5 bg-midnight-bg rounded-xl p-4 border border-white/[0.05] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-lavender-400" />
                Category Share
              </span>
              <span className="text-[11px] text-midnight-muted font-mono">
                {categoryStats.overallTotal > 0 ? '100%' : '0m'}
              </span>
            </div>

            {/* Distribution Stack Bar */}
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden flex mb-4">
              {categoryStats.list.map(c => {
                if (c.percentage === 0) return null;
                return (
                  <div
                    key={c.category}
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${c.percentage}%`,
                      backgroundColor: categoryColors[c.category]
                    }}
                    title={`${c.category}: ${c.percentage}%`}
                  />
                );
              })}
            </div>

            {/* Category breakdown list */}
            <div className="space-y-1.5">
              {categoryStats.list.map(item => (
                <div
                  key={item.category}
                  className="flex items-center justify-between text-xs p-1.5 px-2 rounded-lg bg-white/[0.02] border border-white/[0.02]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: categoryColors[item.category] }}
                    />
                    <span className="capitalize text-gray-300 font-medium text-xs">{item.category}</span>
                  </div>

                  <div className="flex items-center gap-2.5 font-mono text-[11px]">
                    <span className="text-midnight-muted">{formatMinutes(item.totalMinutes)}</span>
                    <span className="w-8 text-right font-semibold text-gray-300">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="mt-3 pt-2.5 border-t border-white/[0.04] flex items-center gap-2 text-[11px] text-midnight-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-lavender-400 shrink-0" />
            <span>Telemetry stays in local storage. No background agents.</span>
          </div>
        </div>
      </div>

      {/* Recent Entries Table for Selected Range */}
      <div className="mt-5 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-lavender-400" />
            Activity Log ({filteredEntries.length})
          </span>
          <span className="text-[11px] text-midnight-muted font-mono">Recent entries</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-6 rounded-xl bg-midnight-bg border border-white/[0.04]">
            <p className="text-xs text-midnight-muted">No activity entries recorded for this period.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsLogModalOpen(true)}
              className="mt-2 text-xs"
            >
              + Log First Entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-midnight-muted border-b border-white/[0.05]">
                <tr>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium text-right">Duration</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredEntries.slice(0, 6).map(entry => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-2">
                      <CategoryBadge category={entry.category} />
                    </td>
                    <td className="py-2 text-gray-200 max-w-xs truncate text-xs">
                      {entry.description || <span className="text-midnight-muted italic">No notes</span>}
                    </td>
                    <td className="py-2">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        entry.source === 'pomodoro'
                          ? 'bg-lavender-400/10 text-lavender-300 border border-lavender-400/20'
                          : 'bg-white/[0.04] text-gray-400 border border-white/[0.08]'
                      }`}>
                        {entry.source === 'pomodoro' ? 'Pomodoro' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-2 text-midnight-muted font-mono text-[11px]">
                      {formatDateDisplay(entry.date)}
                    </td>
                    <td className="py-2 text-right font-mono font-medium text-white text-xs">
                      {formatMinutes(entry.durationMinutes)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => deleteScreenTimeEntry(entry.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-all p-1 rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Modal */}
      <LogScreenTimeModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
};
