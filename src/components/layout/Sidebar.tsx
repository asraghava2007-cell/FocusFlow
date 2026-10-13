import React, { useState, useEffect } from 'react';
import { useApp, PageId } from '../../context/AppContext';
import {
  LayoutDashboard,
  Timer,
  Monitor,
  BarChart3,
  SlidersHorizontal,
  Flame,
  Sun,
  Moon,
  Play,
  Pause,
  X,
  Menu,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatSeconds } from '../../utils/time';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setIsMobileOpen }) => {
  const {
    currentPage,
    setCurrentPage,
    settings,
    toggleTheme,
    timer,
    streaks
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 stroke-[1.75]" /> },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: <Timer className="w-4 h-4 stroke-[1.75]" />,
      badge: timer.status === 'running' ? formatSeconds(timer.remainingSeconds) : undefined
    },
    { id: 'screentime', label: 'Screen Time', icon: <Monitor className="w-4 h-4 stroke-[1.75]" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4 stroke-[1.75]" /> },
    { id: 'settings', label: 'Settings', icon: <SlidersHorizontal className="w-4 h-4 stroke-[1.75]" /> },
  ];

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none p-4">
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between pb-6 pt-1 px-2 border-b border-white/[0.06]">
          <button
            onClick={() => {
              setCurrentPage('dashboard');
              setIsMobileOpen(false);
            }}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#1C1F27] border border-white/10 flex items-center justify-center shadow-sm group-hover:border-lavender-400/50 transition-colors">
              <span className="w-3 h-3 rounded-full border-[1.5px] border-lavender-400 bg-lavender-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-white group-hover:text-lavender-300 transition-colors">
                  FocusFlow
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-lavender-400/10 text-lavender-300 border border-lavender-400/20">
                  SaaS
                </span>
              </div>
              <span className="text-[11px] text-midnight-muted block font-mono">
                Midnight Focus
              </span>
            </div>
          </button>

          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Timer Compact Widget if active */}
        {timer.status !== 'idle' && (
          <div className="mt-4 p-3 rounded-card bg-[#1C1F27] border border-lavender-400/30 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-lavender-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lavender-400 animate-pulse" />
                {timer.mode === 'focus' ? 'Focus Session' : 'Rest Break'}
              </span>
              <button
                onClick={timer.status === 'running' ? timer.pauseTimer : timer.resumeTimer}
                className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white transition-colors"
                title={timer.status === 'running' ? 'Pause' : 'Resume'}
              >
                {timer.status === 'running' ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-lg font-bold text-white tabular-nums">
                {formatSeconds(timer.remainingSeconds)}
              </span>
              <span className="text-[11px] text-gray-400">
                Cycle {timer.sessionCycleIndex}/{settings.longBreakInterval}
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-5 space-y-1">
          <div className="px-2 mb-2 text-[10px] uppercase font-mono tracking-wider text-midnight-muted">
            Menu
          </div>
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/[0.08] shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-lavender-400' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-lavender-400/20 text-lavender-300 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Streak Widget */}
        <div className="mt-6 px-3 py-2.5 rounded-xl bg-[#171920] border border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400/20" />
            </div>
            <div>
              <span className="text-xs font-medium text-gray-200 block leading-tight">Focus Streak</span>
              <span className="text-[10px] text-gray-500 font-mono">Personal best: {streaks.longestStreak}d</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            {streaks.currentStreak}d
          </span>
        </div>
      </div>

      {/* Bottom Footer Info & Theme Toggle */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        {/* Live Clock Display */}
        <div className="px-2 flex items-center justify-between text-midnight-muted font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>{formattedTime}</span>
          </div>
          <span>{formattedDate}</span>
        </div>

        {/* Theme and Mode Bar */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <span className="text-[11px] text-gray-400">Local Storage Synced</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Midnight Dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-lavender-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed left) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-midnight-sidebar border-r border-white/[0.07] min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative w-72 max-w-[85vw] bg-midnight-sidebar border-r border-white/10 h-full shadow-2xl flex flex-col z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
