import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CircularTimer } from './CircularTimer';
import { Button } from '../ui/Button';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ListTodo
} from 'lucide-react';
import { PomodoroMode } from '../../types';
import { formatMinutes } from '../../utils/time';

export const PomodoroCard: React.FC = () => {
  const { timer, settings, updateSettings, tasks, pomodoroHistory } = useApp();
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState('');

  // Calculate today's focus stats
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayCompletedFocusSessions = pomodoroHistory.filter(
    s => s.date === todayDate && s.mode === 'focus'
  );
  const todayTotalFocusMinutes = todayCompletedFocusSessions.reduce(
    (sum, s) => sum + s.durationMinutes,
    0
  );

  // Request browser notifications
  const handleRequestNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateSettings({ notificationsEnabled: true });
    } else {
      updateSettings({ notificationsEnabled: false });
    }
  };

  const handleCustomTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTaskTitle.trim()) {
      timer.setTask(null, customTaskTitle.trim());
      setCustomTaskTitle('');
      setShowTaskSelector(false);
    }
  };

  return (
    <div className="w-full bg-midnight-card border border-white/[0.07] rounded-card p-6 sm:p-7 shadow-sm relative overflow-hidden">
      {/* Mode Switcher Tabs (Linear style segment control) */}
      <div className="flex items-center justify-center p-1 bg-midnight-bg rounded-xl border border-white/[0.06] mb-5 max-w-md mx-auto">
        {(['focus', 'shortBreak', 'longBreak'] as PomodoroMode[]).map(m => {
          const isActive = timer.mode === m;
          const labels: Record<PomodoroMode, string> = {
            focus: `Focus (${settings.focusDuration}m)`,
            shortBreak: `Short Break (${settings.shortBreakDuration}m)`,
            longBreak: `Long Break (${settings.longBreakDuration}m)`,
          };
          return (
            <button
              key={m}
              onClick={() => timer.switchMode(m)}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#1C1F27] text-white shadow-sm border border-white/10 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {labels[m]}
            </button>
          );
        })}
      </div>

      {/* Task Linkage Ribbon */}
      <div className="mb-3">
        {timer.activeTaskTitle ? (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded-md bg-lavender-400/10 text-lavender-400 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div className="truncate">
                <span className="text-[10px] text-midnight-muted block uppercase font-mono tracking-wider">Active Focus Context</span>
                <span className="text-xs font-medium text-white truncate block">
                  {timer.activeTaskTitle}
                </span>
              </div>
            </div>
            <button
              onClick={() => timer.setTask(null, null)}
              className="text-xs text-gray-400 hover:text-rose-400 transition-colors ml-2 shrink-0 underline"
            >
              Detach
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={() => setShowTaskSelector(prev => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-midnight-muted hover:text-lavender-300 transition-colors py-1 cursor-pointer"
            >
              <ListTodo className="w-3.5 h-3.5" />
              {showTaskSelector ? 'Close task picker' : '+ Assign task to session'}
            </button>
          </div>
        )}

        {/* Task Selector Form */}
        {showTaskSelector && !timer.activeTaskTitle && (
          <div className="mt-2.5 p-3 rounded-xl bg-midnight-bg border border-white/[0.08] animate-fade-in text-left">
            <span className="text-[11px] font-medium text-gray-300 block mb-2 font-mono uppercase tracking-wider">
              Select Pending Task:
            </span>
            
            {tasks.filter(t => !t.completed).length > 0 && (
              <div className="space-y-1 mb-2.5 max-h-32 overflow-y-auto pr-1">
                {tasks
                  .filter(t => !t.completed)
                  .map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                        timer.setTask(task.id, task.title);
                        setShowTaskSelector(false);
                      }}
                      className="w-full text-left p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-lavender-400/30 transition-all text-xs text-gray-200 flex items-center justify-between"
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="text-[10px] font-mono text-midnight-muted shrink-0 ml-2 uppercase">
                        {task.priority}
                      </span>
                    </button>
                  ))}
              </div>
            )}

            <form onSubmit={handleCustomTaskSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Or custom focus goal..."
                value={customTaskTitle}
                onChange={e => setCustomTaskTitle(e.target.value)}
                className="flex-1 bg-black/40 border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
              />
              <Button type="submit" size="sm" variant="secondary">
                Set
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Circular Timer Visual Centerpiece */}
      <CircularTimer
        mode={timer.mode}
        status={timer.status}
        remainingSeconds={timer.remainingSeconds}
        totalSeconds={timer.totalSeconds}
        sessionCycleIndex={timer.sessionCycleIndex}
        maxSessionsBeforeLongBreak={settings.longBreakInterval}
      />

      {/* Main Action Controls */}
      <div className="flex items-center justify-center gap-2.5 mt-5">
        {timer.status === 'running' ? (
          <Button
            size="md"
            variant="primary"
            onClick={timer.pauseTimer}
            icon={<Pause className="w-4 h-4 fill-current" />}
            className="w-32 bg-lavender-400 hover:bg-lavender-300 text-midnight-bg font-semibold"
          >
            Pause
          </Button>
        ) : timer.status === 'paused' ? (
          <Button
            size="md"
            variant="primary"
            onClick={timer.resumeTimer}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="w-32 bg-lavender-400 hover:bg-lavender-300 text-midnight-bg font-semibold"
          >
            Resume
          </Button>
        ) : (
          <Button
            size="md"
            variant="primary"
            onClick={timer.startTimer}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="w-32 bg-lavender-400 hover:bg-lavender-300 text-midnight-bg font-semibold"
          >
            Start
          </Button>
        )}

        <Button
          size="md"
          variant="secondary"
          onClick={timer.resetTimer}
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          title="Reset timer"
        >
          Reset
        </Button>

        <Button
          size="md"
          variant="secondary"
          onClick={timer.skipSession}
          icon={<SkipForward className="w-3.5 h-3.5" />}
          title="Skip session"
        >
          Skip
        </Button>
      </div>

      {/* Footer Controls: Audio, Notifications, Summary */}
      <div className="flex items-center justify-between pt-4 mt-5 border-t border-white/[0.06] text-xs text-midnight-muted">
        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute chimes' : 'Enable chimes'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-lavender-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span className="text-[11px] font-mono">{settings.soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>

          {/* Browser Notification toggle */}
          <button
            onClick={handleRequestNotifications}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            title="Desktop notifications"
          >
            <Bell
              className={`w-3.5 h-3.5 ${
                settings.notificationsEnabled ? 'text-lavender-400' : 'text-gray-500'
              }`}
            />
            <span className="text-[11px] font-mono">{settings.notificationsEnabled ? 'Alerts' : 'No Alerts'}</span>
          </button>
        </div>

        {/* Today's Focus Count */}
        <div className="flex items-center gap-1.5 text-gray-300 font-mono text-[11px]">
          <CheckCircle2 className="w-3 h-3 text-lavender-400" />
          <span>{todayCompletedFocusSessions.length} done</span>
          <span>•</span>
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{formatMinutes(todayTotalFocusMinutes)}</span>
        </div>
      </div>
    </div>
  );
};
