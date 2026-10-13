import React from 'react';
import { PomodoroCard } from '../components/timer/PomodoroCard';
import { useApp } from '../context/AppContext';
import { formatMinutes, formatDateDisplay } from '../utils/time';
import { CheckCircle, Clock, Shield, Sparkles, Compass } from 'lucide-react';

export const FocusTimerPage: React.FC = () => {
  const { pomodoroHistory } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center max-w-lg mx-auto pb-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
          Deep Focus Environment
        </h1>
        <p className="text-xs text-midnight-muted">
          Rhythmic interval system with timestamp delta tracking resilient to background tab throttling.
        </p>
      </div>

      {/* Main centerpiece Pomodoro Card */}
      <div className="max-w-xl mx-auto">
        <PomodoroCard />
      </div>

      {/* Principles Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-lavender-400/10 text-lavender-400 shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white mb-0.5">Single-Task Scope</h3>
            <p className="text-[11px] text-midnight-muted leading-relaxed">
              Anchor one discrete task per Pomodoro to preserve uninterrupted flow state.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white mb-0.5">Restorative Pauses</h3>
            <p className="text-[11px] text-midnight-muted leading-relaxed">
              Step away during short breaks. Hydrate, breathe deeply, and relax your eyes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-card bg-midnight-card border border-white/[0.07] flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white mb-0.5">Wall-Clock Invariance</h3>
            <p className="text-[11px] text-midnight-muted leading-relaxed">
              Precision timestamps prevent timer drift even when switching tabs or sleeping windows.
            </p>
          </div>
        </div>
      </div>

      {/* Completed Sessions Table */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-lavender-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Completed Sessions</h3>
          </div>
          <span className="text-xs text-midnight-muted font-mono">
            {pomodoroHistory.length} total recorded
          </span>
        </div>

        {pomodoroHistory.length === 0 ? (
          <div className="text-center py-6 text-xs text-midnight-muted">
            No completed sessions recorded yet. Start your first session above!
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {pomodoroHistory.slice(0, 8).map(session => (
              <div
                key={session.id}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                  <div>
                    <span className="font-medium text-white block text-xs">
                      {session.taskTitle || 'Dedicated Deep Work Block'}
                    </span>
                    <span className="text-[10px] text-midnight-muted font-mono">
                      {formatDateDisplay(session.date)} • {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-lavender-300 font-semibold text-xs">
                    {formatMinutes(session.durationMinutes)}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
