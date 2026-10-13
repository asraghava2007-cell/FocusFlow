import React from 'react';
import { PomodoroMode, TimerStatus } from '../../types';
import { formatSeconds } from '../../utils/time';

interface CircularTimerProps {
  mode: PomodoroMode;
  status: TimerStatus;
  remainingSeconds: number;
  totalSeconds: number;
  sessionCycleIndex: number;
  maxSessionsBeforeLongBreak: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  mode,
  status,
  remainingSeconds,
  totalSeconds,
  sessionCycleIndex,
  maxSessionsBeforeLongBreak
}) => {
  // SVG dimensions
  const size = 320;
  const strokeWidth = 8; // hairline minimalist stroke
  const radius = (size - strokeWidth) / 2 - 12;
  const circumference = 2 * Math.PI * radius;

  // Fraction remaining: 1 at start, 0 at completion
  const fraction = totalSeconds > 0 ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;
  const strokeDashoffset = circumference - fraction * circumference;

  // Color selection: soft lavender (#A78BFA) for focus, soft emerald for breaks
  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return '#A78BFA'; // Soft lavender primary accent
      case 'shortBreak':
        return '#34D399'; // Mint/Emerald
      case 'longBreak':
        return '#38BDF8'; // Sky cyan
    }
  };

  const modeColor = getModeColor();

  const modeLabels: Record<PomodoroMode, string> = {
    focus: 'Deep Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* SVG Circular Dial */}
      <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Subtle Outer Hairline Accent */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 7}
            className="stroke-white/[0.04] fill-transparent"
            strokeWidth="1"
          />

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-[#252833] fill-transparent"
            strokeWidth={strokeWidth}
          />

          {/* Animated Active Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={modeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
            style={{
              filter: status === 'running' ? `drop-shadow(0 0 10px ${modeColor}40)` : 'none'
            }}
          />
        </svg>

        {/* Central Counter Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {/* Mode Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] mb-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'running' ? 'animate-pulse' : ''
              }`}
              style={{ backgroundColor: modeColor }}
            />
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-gray-300">
              {modeLabels[mode]}
            </span>
          </div>

          {/* Large Countdown (Raycast typography) */}
          <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-white mb-2 tabular-nums">
            {formatSeconds(remainingSeconds)}
          </div>

          {/* Subtext and Session Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-midnight-muted">
            <span>Cycle {sessionCycleIndex} of {maxSessionsBeforeLongBreak}</span>
            <span>•</span>
            <span className="uppercase tracking-widest text-[10px]">
              {status === 'running' ? 'Active' : status === 'paused' ? 'Paused' : 'Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Cycle Dot Indicators (Linear style) */}
      <div className="flex items-center gap-1.5 mt-4">
        {Array.from({ length: maxSessionsBeforeLongBreak }).map((_, i) => {
          const isCurrent = i + 1 === sessionCycleIndex;
          const isCompleted = i + 1 < sessionCycleIndex;
          return (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                isCurrent
                  ? 'w-6 bg-lavender-400'
                  : isCompleted
                  ? 'w-2.5 bg-lavender-400/50'
                  : 'w-2.5 bg-[#2A2E39]'
              }`}
              title={`Cycle ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};
