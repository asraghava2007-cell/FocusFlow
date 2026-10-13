import React, { useState, useEffect } from 'react';
import { useApp, PageId } from '../../context/AppContext';
import {
  Flame,
  LayoutDashboard,
  Timer,
  PieChart,
  Sliders,
  Sun,
  Moon,
  Clock,
  Menu,
  X,
  Play,
  Pause,
  Monitor
} from 'lucide-react';
import { formatSeconds } from '../../utils/time';

export const Header: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    settings,
    toggleTheme,
    timer,
    streaks
  } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live clock updating every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const navItems: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'timer', label: 'Focus Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'screentime', label: 'Screen Time', icon: <Monitor className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <PieChart className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Sliders className="w-4 h-4" /> },
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-[#101114]/85 backdrop-blur-md border-b border-white/5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender-700 to-lavender-500 flex items-center justify-center shadow-lg shadow-lavender-700/25 group-hover:scale-105 transition-transform">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/90 bg-white/30" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white group-hover:text-lavender-300 transition-colors">
                FocusFlow
              </span>
              <span className="text-[10px] text-gray-500 block leading-tight font-mono tracking-wider">
                MINIMALIST HABITS
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#16181e] p-1 rounded-2xl border border-white/5">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-lavender-600/20 text-lavender-300 border border-lavender-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Running Timer Pill, Clock, Theme, Mobile toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Running Timer Quick Pill if not on timer page */}
          {timer.status !== 'idle' && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-lavender-950/40 border border-lavender-500/30 text-xs font-mono text-lavender-300 animate-pulse-slow">
              <span className="w-1.5 h-1.5 rounded-full bg-lavender-400 animate-ping" />
              <span>{formatSeconds(timer.remainingSeconds)}</span>
              <button
                onClick={timer.status === 'running' ? timer.pauseTimer : timer.resumeTimer}
                className="p-1 rounded hover:bg-lavender-800/40 text-lavender-200"
                title={timer.status === 'running' ? 'Pause timer' : 'Resume timer'}
              >
                {timer.status === 'running' ? (
                  <Pause className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
              </button>
            </div>
          )}

          {/* Streak indicator */}
          <div
            onClick={() => setCurrentPage('dashboard')}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs font-medium cursor-pointer hover:bg-orange-500/20 transition-all"
            title={`${streaks.currentStreak} day streak!`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>{streaks.currentStreak}d</span>
          </div>

          {/* Live Clock & Date */}
          <div className="hidden sm:flex flex-col text-right font-mono">
            <span className="text-xs text-gray-200 leading-tight font-medium">
              {formattedTime}
            </span>
            <span className="text-[10px] text-gray-400 leading-tight">
              {formattedDate}
            </span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-[#16181e] hover:bg-[#1f222a] border border-white/5 transition-all"
            aria-label="Toggle theme"
            title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-lavender-400" />
            )}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white bg-[#16181e] border border-white/5"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#14161c] border-b border-white/10 px-4 pt-2 pb-4 space-y-1 animate-slide-up">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs text-gray-400 font-mono">
            <span>{formattedDate}</span>
            <span>{formattedTime}</span>
          </div>
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-lavender-600/20 text-lavender-300 border border-lavender-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
