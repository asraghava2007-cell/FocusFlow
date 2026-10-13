import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { exportStateToJson, exportDataToCsv } from '../utils/exportData';
import { soundManager } from '../utils/sound';
import {
  SlidersHorizontal,
  Moon,
  Sun,
  Volume2,
  Bell,
  Download,
  Trash2,
  Clock,
  Target,
  Sparkles,
  Check
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    fullAppState,
    loadDemoData,
    resetAllData
  } = useApp();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const showSaveSuccess = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleTestSound = (type: typeof settings.soundType) => {
    soundManager.play(type, 0.6);
  };

  const handleBrowserNotificationToggle = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    if (!settings.notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        updateSettings({ notificationsEnabled: true });
        new Notification('FocusFlow Notifications Enabled', {
          body: 'You will receive subtle notifications when sessions complete.'
        });
      } else {
        alert('Browser notification permission was denied.');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
    }
    showSaveSuccess();
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-lavender-400" />
            Preferences & Settings
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Configure timer rhythms, notification preferences, targets, and data backup
          </p>
        </div>

        {saveToast && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            Saved
          </div>
        )}
      </div>

      {/* 1. Appearance & Theme */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-0.5">
          Appearance & Theme
        </h2>
        <p className="text-xs text-midnight-muted mb-4">Select your interface visual theme</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              updateSettings({ theme: 'dark' });
              showSaveSuccess();
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              settings.theme === 'dark'
                ? 'bg-lavender-400/10 border-lavender-400/40 text-white shadow-sm'
                : 'bg-midnight-bg border-white/[0.06] text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/40 text-lavender-400 border border-white/5">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-white">Midnight Focus (Default)</span>
                <span className="text-[11px] text-midnight-muted font-mono">Dark charcoal (#111318)</span>
              </div>
            </div>
            {settings.theme === 'dark' && (
              <span className="w-2 h-2 rounded-full bg-lavender-400" />
            )}
          </button>

          <button
            onClick={() => {
              updateSettings({ theme: 'light' });
              showSaveSuccess();
            }}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              settings.theme === 'light'
                ? 'bg-lavender-400/10 border-lavender-400/40 text-white shadow-sm'
                : 'bg-midnight-bg border-white/[0.06] text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-black/40 text-amber-400 border border-white/5">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold block text-white">Crisp Light Mode</span>
                <span className="text-[11px] text-midnight-muted font-mono">Slate clean contrast</span>
              </div>
            </div>
            {settings.theme === 'light' && (
              <span className="w-2 h-2 rounded-full bg-lavender-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Pomodoro Durations & Rhythms */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-4 h-4 text-lavender-400" />
            Timer Durations & Session Rhythms
          </h2>
          <span className="text-[10px] text-midnight-muted font-mono">Persisted</span>
        </div>
        <p className="text-xs text-midnight-muted mb-4">
          Adjust interval durations to match your cognitive stamina
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Focus Duration
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focusDuration}
                onChange={e => {
                  updateSettings({ focusDuration: Math.max(1, parseInt(e.target.value, 10) || 25) });
                  showSaveSuccess();
                }}
                className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
              />
              <span className="absolute right-3 top-2 text-[10px] text-midnight-muted font-mono">mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Short Break
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                value={settings.shortBreakDuration}
                onChange={e => {
                  updateSettings({ shortBreakDuration: Math.max(1, parseInt(e.target.value, 10) || 5) });
                  showSaveSuccess();
                }}
                className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
              />
              <span className="absolute right-3 top-2 text-[10px] text-midnight-muted font-mono">mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Long Break
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="90"
                value={settings.longBreakDuration}
                onChange={e => {
                  updateSettings({ longBreakDuration: Math.max(1, parseInt(e.target.value, 10) || 15) });
                  showSaveSuccess();
                }}
                className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
              />
              <span className="absolute right-3 top-2 text-[10px] text-midnight-muted font-mono">mins</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Long Break Frequency
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="12"
                value={settings.longBreakInterval}
                onChange={e => {
                  updateSettings({ longBreakInterval: Math.max(1, parseInt(e.target.value, 10) || 4) });
                  showSaveSuccess();
                }}
                className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
              />
              <span className="absolute right-3 top-2 text-[10px] text-midnight-muted font-mono">cycles</span>
            </div>
          </div>
        </div>

        {/* Auto start toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-white/[0.06]">
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-midnight-bg border border-white/[0.04] cursor-pointer">
            <div>
              <span className="text-xs font-medium text-gray-200 block">Auto-start Breaks</span>
              <span className="text-[11px] text-midnight-muted block">Begin break countdown when focus finishes</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={e => {
                updateSettings({ autoStartBreaks: e.target.checked });
                showSaveSuccess();
              }}
              className="accent-lavender-400 w-3.5 h-3.5 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-midnight-bg border border-white/[0.04] cursor-pointer">
            <div>
              <span className="text-xs font-medium text-gray-200 block">Auto-start Focus</span>
              <span className="text-[11px] text-midnight-muted block">Begin next focus session when break concludes</span>
            </div>
            <input
              type="checkbox"
              checked={settings.autoStartFocus}
              onChange={e => {
                updateSettings({ autoStartFocus: e.target.checked });
                showSaveSuccess();
              }}
              className="accent-lavender-400 w-3.5 h-3.5 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* 3. Audio & Notifications */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-0.5">
          Audio & Notification Cues
        </h2>
        <p className="text-xs text-midnight-muted mb-4">Non-intrusive auditory alerts synthesized via Web Audio</p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-midnight-bg border border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-lavender-400/10 text-lavender-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Completion Chimes</span>
                <span className="text-[11px] text-midnight-muted">Native synthesizer tone</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={settings.soundType}
                onChange={e => {
                  const st = e.target.value as typeof settings.soundType;
                  updateSettings({ soundType: st });
                  handleTestSound(st);
                  showSaveSuccess();
                }}
                disabled={!settings.soundEnabled}
                className="bg-[#232732] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white disabled:opacity-40"
              >
                <option value="zen">Zen Singing Bowl</option>
                <option value="bell">Soft Bell</option>
                <option value="marimba">Warm Marimba</option>
                <option value="digital">Modern Pip</option>
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestSound(settings.soundType)}
                disabled={!settings.soundEnabled}
              >
                Test
              </Button>

              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={e => {
                  updateSettings({ soundEnabled: e.target.checked });
                  showSaveSuccess();
                }}
                className="accent-lavender-400 w-3.5 h-3.5 cursor-pointer ml-1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-bg border border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Desktop Browser Notifications</span>
                <span className="text-[11px] text-midnight-muted">Displays OS notification banner</span>
              </div>
            </div>

            <Button
              size="sm"
              variant={settings.notificationsEnabled ? 'primary' : 'outline'}
              onClick={handleBrowserNotificationToggle}
            >
              {settings.notificationsEnabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Daily Habit Goals */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-0.5 flex items-center gap-2">
          <Target className="w-4 h-4 text-lavender-400" />
          Daily Habit Targets
        </h2>
        <p className="text-xs text-midnight-muted mb-4">
          Set targets for daily deep work and total screen allowance
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Daily Focus Target (Minutes)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              value={settings.dailyFocusGoal}
              onChange={e => {
                updateSettings({ dailyFocusGoal: parseInt(e.target.value, 10) || 150 });
                showSaveSuccess();
              }}
              className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 font-mono">
              Daily Screen Budget (Minutes)
            </label>
            <input
              type="number"
              min="30"
              step="30"
              value={settings.dailyScreenTimeGoal}
              onChange={e => {
                updateSettings({ dailyScreenTimeGoal: parseInt(e.target.value, 10) || 360 });
                showSaveSuccess();
              }}
              className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
            />
          </div>
        </div>
      </div>

      {/* 5. Data Management & Export */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <h2 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-0.5 flex items-center gap-2">
          <Download className="w-4 h-4 text-lavender-400" />
          Data Export & Backup
        </h2>
        <p className="text-xs text-midnight-muted mb-4">
          Export your complete telemetry as JSON or CSV files anytime.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportStateToJson(fullAppState)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export JSON Backup
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => exportDataToCsv(fullAppState)}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV File
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadDemoData}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Load Sample Dataset
          </Button>
        </div>

        {/* Destructive Zone */}
        <div className="mt-6 pt-5 border-t border-rose-500/10">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div>
              <span className="text-xs font-semibold text-rose-300 block">Reset Application Data</span>
              <span className="text-[11px] text-rose-300/70">
                Wipes all records and resets progress to zero.
              </span>
            </div>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setIsResetModalOpen(true)}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Reset Data
            </Button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Data Reset"
        description="Are you sure you want to reset all stored progress?"
      >
        <div className="space-y-3.5">
          <p className="text-xs text-gray-300 leading-relaxed">
            All logged screen-time items, task lists, Pomodoro history records, and customized settings stored in your browser's localStorage will be cleared.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                resetAllData();
                setIsResetModalOpen(false);
              }}
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
