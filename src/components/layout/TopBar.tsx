import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Plus, Timer, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatSeconds } from '../../utils/time';

interface TopBarProps {
  onOpenMobileMenu: () => void;
  onOpenLogModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu, onOpenLogModal }) => {
  const { currentPage, timer, setCurrentPage } = useApp();

  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    timer: 'Focus Timer',
    screentime: 'Screen Time Log',
    analytics: 'Analytics & Habits',
    settings: 'Preferences',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-midnight-bg/80 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      {/* Left: Mobile hamburger & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 border border-white/5"
          aria-label="Open menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-midnight-muted hidden sm:inline">Workspace</span>
          <span className="text-midnight-muted hidden sm:inline">/</span>
          <span className="text-white font-medium tracking-tight">
            {pageTitles[currentPage] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right: Quick actions & Timer indicator */}
      <div className="flex items-center gap-2.5">
        {timer.status !== 'idle' && (
          <button
            onClick={() => setCurrentPage('timer')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-lavender-400/10 border border-lavender-400/30 text-xs font-mono text-lavender-300 hover:bg-lavender-400/20 transition-all cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-lavender-400 animate-pulse" />
            <span className="tabular-nums font-semibold">{formatSeconds(timer.remainingSeconds)}</span>
          </button>
        )}

        <Button
          size="sm"
          variant="secondary"
          onClick={onOpenLogModal}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs py-1 px-2.5"
        >
          Log Time
        </Button>
      </div>
    </header>
  );
};
