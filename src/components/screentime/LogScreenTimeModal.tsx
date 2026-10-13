import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ScreenTimeCategory } from '../../types';
import { getTodayDateString } from '../../utils/time';
import { Clock, Tag, Calendar, FileText, Info } from 'lucide-react';

interface LogScreenTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogScreenTimeModal: React.FC<LogScreenTimeModalProps> = ({ isOpen, onClose }) => {
  const { addScreenTimeEntry } = useApp();

  const [category, setCategory] = useState<ScreenTimeCategory>('coding');
  const [durationMinutes, setDurationMinutes] = useState<string>('45');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(durationMinutes, 10);
    if (isNaN(duration) || duration <= 0) {
      setError('Please enter a valid duration greater than 0 minutes.');
      return;
    }
    if (duration > 1440) {
      setError('Duration cannot exceed 24 hours (1440 minutes).');
      return;
    }

    addScreenTimeEntry({
      category,
      durationMinutes: duration,
      date,
      description: description.trim(),
      source: 'manual'
    });

    setDescription('');
    setDurationMinutes('45');
    setError('');
    onClose();
  };

  const categories: { id: ScreenTimeCategory; label: string }[] = [
    { id: 'coding', label: 'Coding' },
    { id: 'study', label: 'Study & Reading' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'social', label: 'Social Media' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Screen Activity"
      description="Record an intentional work block or estimated usage"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transparent notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Privacy-first design: entries are stored exclusively in your browser localStorage without background surveillance.
          </p>
        </div>

        {/* Category Picker */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-2">
            <Tag className="w-3.5 h-3.5 text-lavender-400" />
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-2 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                  category === cat.id
                    ? 'bg-lavender-400/15 border-lavender-400/50 text-white font-medium shadow-sm'
                    : 'bg-midnight-bg border-white/[0.05] text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-medium text-xs truncate">{cat.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Duration and Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-lavender-400" />
              Duration (Minutes)
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="1440"
                value={durationMinutes}
                onChange={e => {
                  setDurationMinutes(e.target.value);
                  setError('');
                }}
                className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
                required
              />
              <span className="absolute right-3 top-2 text-[11px] text-midnight-muted">mins</span>
            </div>
            {/* Quick minute pills */}
            <div className="flex gap-1.5 mt-2">
              {[15, 30, 45, 60, 90].map(mins => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins.toString())}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-gray-400 hover:text-white cursor-pointer"
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-lavender-400" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-lavender-400"
              required
            />
          </div>
        </div>

        {/* Description / Note */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-lavender-400" />
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g., Deep refactoring session..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
            maxLength={120}
          />
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
