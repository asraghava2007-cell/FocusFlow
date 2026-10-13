import React from 'react';
import { ScreenTimeCategory, TaskPriority } from '../../types';

interface CategoryBadgeProps {
  category: ScreenTimeCategory;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const configs: Record<ScreenTimeCategory, { label: string; bg: string; dot: string }> = {
    study: {
      label: 'Study',
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      dot: 'bg-blue-400',
    },
    coding: {
      label: 'Coding',
      bg: 'bg-lavender-400/10 border-lavender-400/25 text-lavender-300',
      dot: 'bg-lavender-400',
    },
    entertainment: {
      label: 'Entertainment',
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      dot: 'bg-amber-400',
    },
    social: {
      label: 'Social Media',
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
      dot: 'bg-rose-400',
    },
    other: {
      label: 'Other',
      bg: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
      dot: 'bg-slate-400',
    },
  };

  const c = configs[category] || configs.other;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${c.bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = ''
}) => {
  const configs: Record<TaskPriority, { label: string; classes: string }> = {
    low: { label: 'Low', classes: 'bg-white/[0.04] text-gray-400 border-white/[0.08]' },
    medium: { label: 'Medium', classes: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    high: { label: 'High', classes: 'bg-rose-500/10 text-rose-300 border-rose-500/20' },
  };

  const conf = configs[priority];

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold border ${conf.classes} ${className}`}>
      {conf.label}
    </span>
  );
};
