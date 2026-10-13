import React from 'react';
import { OverviewCards } from '../components/dashboard/OverviewCard';
import { ScreenTimeBreakdown } from '../components/dashboard/ScreenTimeBreakdown';
import { TaskManager } from '../components/tasks/TaskManager';
import { HabitsSection } from '../components/habits/HabitsSection';
import { PomodoroCard } from '../components/timer/PomodoroCard';
import { useApp } from '../context/AppContext';
import { Timer, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Dashboard: React.FC = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Banner (Linear/Raycast typography) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Daily Focus & Screen Overview
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Calm, intentional telemetry for deep work blocks and digital wellness
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCurrentPage('timer')}
            icon={<Timer className="w-3.5 h-3.5 text-lavender-400" />}
          >
            Dedicated Timer View
          </Button>
        </div>
      </div>

      {/* 1. Today's Overview Cards */}
      <OverviewCards />

      {/* 2. Visual Centerpiece & Tasks Grid (Spacious layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Pomodoro Card Visual Centerpiece */}
        <div className="lg:col-span-5">
          <PomodoroCard />
        </div>

        {/* Right: Tidy Tasks & Objectives */}
        <div className="lg:col-span-7">
          <TaskManager />
        </div>
      </div>

      {/* 3. Screen-Time Breakdown with Charts & Filters */}
      <ScreenTimeBreakdown />

      {/* 4. Healthy Habits & Daily Intentions */}
      <HabitsSection />
    </div>
  );
};
