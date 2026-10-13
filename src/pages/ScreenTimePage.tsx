import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ScreenTimeCategory } from '../types';
import { formatMinutes, formatDateDisplay } from '../utils/time';
import { CategoryBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LogScreenTimeModal } from '../components/screentime/LogScreenTimeModal';
import {
  Monitor,
  Plus,
  Trash2,
  ShieldCheck,
  Search
} from 'lucide-react';

export const ScreenTimePage: React.FC = () => {
  const { screenTimeEntries, deleteScreenTimeEntry } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ScreenTimeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter entries
  const filtered = useMemo(() => {
    return screenTimeEntries.filter(entry => {
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      const matchesQuery = !searchQuery.trim() ||
        (entry.description && entry.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [screenTimeEntries, selectedCategory, searchQuery]);

  const totalMinutes = filtered.reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-lavender-400" />
            Screen Time Log
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Audit, categorize, and reflect on digital screen hours without background spy agents
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Log Screen Time
        </Button>
      </div>

      {/* Disclaimers Card */}
      <div className="p-3.5 rounded-card bg-midnight-card border border-white/[0.07] flex items-start gap-3 text-xs text-midnight-muted">
        <ShieldCheck className="w-4 h-4 text-lavender-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-200 block mb-0.5">Local Storage Architecture</strong>
          All records exist purely in your browser storage. Manual entries and Pomodoro logs are clearly distinguished.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['all', 'coding', 'study', 'entertainment', 'social', 'other'] as (ScreenTimeCategory | 'all')[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#242833] text-white border border-white/10 shadow-sm font-semibold'
                    : 'text-gray-400 hover:text-gray-200 border border-transparent'
                }`}
              >
                {cat === 'all' ? 'All Categories' : cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-midnight-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter descriptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-midnight-bg border border-white/[0.08] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
            />
          </div>
        </div>

        {/* Results summary */}
        <div className="flex items-center justify-between pt-3 mb-3 text-xs text-midnight-muted font-mono">
          <span>{filtered.length} entries</span>
          <span className="text-white font-semibold">
            Filtered Total: {formatMinutes(totalMinutes)}
          </span>
        </div>

        {/* Entries Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-xs text-midnight-muted">
            No screen-time entries match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-midnight-muted border-b border-white/[0.05]">
                <tr>
                  <th className="pb-2.5 font-medium">Category</th>
                  <th className="pb-2.5 font-medium">Description</th>
                  <th className="pb-2.5 font-medium">Source</th>
                  <th className="pb-2.5 font-medium">Date</th>
                  <th className="pb-2.5 font-medium text-right">Duration</th>
                  <th className="pb-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filtered.map(entry => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="py-2.5">
                      <CategoryBadge category={entry.category} />
                    </td>
                    <td className="py-2.5 text-gray-200 font-medium max-w-sm truncate text-xs">
                      {entry.description || <span className="text-midnight-muted italic">No notes</span>}
                    </td>
                    <td className="py-2.5">
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        entry.source === 'pomodoro'
                          ? 'bg-lavender-400/10 text-lavender-300 border border-lavender-400/20'
                          : 'bg-white/[0.04] text-gray-400 border border-white/[0.08]'
                      }`}>
                        {entry.source === 'pomodoro' ? 'Pomodoro Session' : 'Manual Entry'}
                      </span>
                    </td>
                    <td className="py-2.5 text-midnight-muted font-mono text-[11px]">
                      {formatDateDisplay(entry.date)}
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-white text-xs">
                      {formatMinutes(entry.durationMinutes)}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => deleteScreenTimeEntry(entry.id)}
                        className="text-gray-500 hover:text-rose-400 transition-colors p-1 rounded"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LogScreenTimeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
