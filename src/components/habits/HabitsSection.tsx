import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatMinutes } from '../../utils/time';
import { Button } from '../ui/Button';
import {
  Flame,
  Target,
  Sparkles,
  Heart,
  Plus,
  Trash2,
  CheckCircle2,
  Coffee,
  Info
} from 'lucide-react';

export const HabitsSection: React.FC = () => {
  const {
    settings,
    updateSettings,
    streaks,
    dailyPriorities,
    addPriority,
    removePriority,
    screenTimeEntries,
    pomodoroHistory
  } = useApp();

  const [newPriorityText, setNewPriorityText] = useState('');
  const [completedPriorities, setCompletedPriorities] = useState<Record<number, boolean>>({});

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayScreenEntries = screenTimeEntries.filter(e => e.date === todayDate);
  const totalScreenMinutes = todayScreenEntries.reduce((sum, e) => sum + e.durationMinutes, 0);

  const todayPomoSessions = pomodoroHistory.filter(p => p.date === todayDate && p.mode === 'focus');
  const focusedMinutes = todayPomoSessions.reduce((sum, p) => sum + p.durationMinutes, 0);

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriorityText.trim()) {
      addPriority(newPriorityText);
      setNewPriorityText('');
    }
  };

  const togglePriorityDone = (index: number) => {
    setCompletedPriorities(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getEncouragingMessage = () => {
    if (focusedMinutes >= settings.dailyFocusGoal) {
      return 'Target achieved. You have honored your deep work rhythm today. Disconnect and recharge without guilt.';
    }
    if (totalScreenMinutes > settings.dailyScreenTimeGoal) {
      return 'Screen time is slightly beyond your target today. Remember that awareness is key—take a quiet eye break, hydrate, and recalibrate.';
    }
    if (focusedMinutes > 0) {
      return 'Positive momentum underway. Consistent 25-minute intervals build sustainable cognitive focus.';
    }
    return 'Ready whenever you are. A calm, focused session begins with a single deliberate interval.';
  };

  return (
    <div className="space-y-5">
      {/* Non-judgmental positive reflection card */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-lavender-400/10 border border-lavender-400/20 text-lavender-300 shrink-0 mt-0.5">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-lavender-300 font-mono">
                Healthy Digital Habits
              </span>
              <span className="text-xs text-midnight-muted">• Non-judgmental insight</span>
            </div>
            <p className="text-sm text-gray-200 font-medium leading-relaxed">
              {getEncouragingMessage()}
            </p>
            <div className="flex items-center gap-4 mt-2.5 text-[11px] text-midnight-muted font-mono">
              <span className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-lavender-400" />
                Regular 5m breathers preserve mental stamina
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Targets & Streaks */}
        <div className="lg:col-span-6 space-y-5">
          {/* Target Settings Card */}
          <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-lavender-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Daily Target Controls</h3>
              </div>
              <span className="text-[11px] text-midnight-muted font-mono">Adjustable</span>
            </div>

            <div className="space-y-4">
              {/* Daily Focus Goal slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-gray-300">Daily Focus Target</span>
                  <span className="text-lavender-300 font-semibold">
                    {formatMinutes(settings.dailyFocusGoal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="480"
                  step="15"
                  value={settings.dailyFocusGoal}
                  onChange={e => updateSettings({ dailyFocusGoal: parseInt(e.target.value, 10) })}
                  className="w-full accent-lavender-400 cursor-pointer h-1.5 bg-[#252833] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-midnight-muted mt-1 font-mono">
                  <span>30m</span>
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>

              {/* Daily Screen-Time Limit slider */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-gray-300">Daily Screen-Time Budget</span>
                  <span className="text-blue-300 font-semibold">
                    {formatMinutes(settings.dailyScreenTimeGoal)}
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="720"
                  step="30"
                  value={settings.dailyScreenTimeGoal}
                  onChange={e => updateSettings({ dailyScreenTimeGoal: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-400 cursor-pointer h-1.5 bg-[#252833] rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-midnight-muted mt-1 font-mono">
                  <span>1 hr</span>
                  <span>6 hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>
            </div>

            {/* Streak & Consistency Card */}
            <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between p-3.5 rounded-xl bg-midnight-bg border border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <span className="text-[11px] text-midnight-muted block">Focus Streak</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {streaks.currentStreak} Days Consecutive
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-midnight-muted block font-mono">Best Record</span>
                <span className="text-xs font-mono font-semibold text-gray-300">
                  {streaks.longestStreak} days
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Methodology Card */}
          <div className="bg-midnight-card border border-white/[0.07] rounded-card p-4 text-xs text-midnight-muted space-y-1.5">
            <div className="flex items-center gap-2 text-gray-300 font-medium text-xs">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              <span>Transparent Measurement Methodology</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              FocusFlow measures conscious intentionality. Time is recorded either during your Pomodoro timer intervals or through deliberate user logging—never through background system spying.
            </p>
          </div>
        </div>

        {/* Right Column: Daily Intentions Checklist */}
        <div className="lg:col-span-6 bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06] mb-3.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lavender-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Daily Intentions</h3>
              </div>
              <span className="text-xs text-midnight-muted font-mono">
                {Object.values(completedPriorities).filter(Boolean).length}/{dailyPriorities.length} done
              </span>
            </div>

            {/* Priority list */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {dailyPriorities.length === 0 ? (
                <div className="text-center py-6 text-xs text-midnight-muted">
                  No intentions set for today yet. Add one below!
                </div>
              ) : (
                dailyPriorities.map((item, index) => {
                  const isDone = !!completedPriorities[index];
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-white/[0.01] border-white/[0.03] text-gray-500'
                          : 'bg-midnight-bg border-white/[0.04] text-gray-200 hover:border-white/[0.08]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => togglePriorityDone(index)}
                          className="cursor-pointer text-gray-500 hover:text-lavender-400 shrink-0"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              isDone ? 'text-emerald-400 fill-emerald-400/20' : 'text-gray-600'
                            }`}
                          />
                        </button>
                        <span className={`text-xs truncate ${isDone ? 'line-through text-gray-500' : ''}`}>
                          {item}
                        </span>
                      </div>

                      <button
                        onClick={() => removePriority(index)}
                        className="text-gray-500 hover:text-rose-400 p-1 rounded ml-2 shrink-0 transition-colors"
                        title="Remove intention"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add priority input */}
          <form onSubmit={handleAddPriority} className="mt-3.5 pt-3.5 border-t border-white/[0.06] flex gap-2">
            <input
              type="text"
              placeholder="Add an intention for today..."
              value={newPriorityText}
              onChange={e => setNewPriorityText(e.target.value)}
              className="flex-1 bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
            />
            <Button type="submit" size="sm" variant="secondary" icon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
