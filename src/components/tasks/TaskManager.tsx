import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import {
  CheckCircle2,
  Circle,
  Plus,
  Play,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  ListCheck
} from 'lucide-react';
import { formatMinutes } from '../../utils/time';

export const TaskManager: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskComplete, startTaskPomodoro, timer } = useApp();
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('25');

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setEstimatedMinutes('25');
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setEstimatedMinutes(task.estimatedMinutes ? task.estimatedMinutes.toString() : '25');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const est = estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: est
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: est
      });
    }

    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="bg-midnight-card border border-white/[0.07] rounded-card p-5 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">Active Tasks & Objectives</h2>
            <span className="text-[11px] text-midnight-muted font-mono bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
              {pendingCount} remaining
            </span>
          </div>
          <p className="text-xs text-midnight-muted mt-0.5">
            Link focus sessions directly to your objectives
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Filter Tabs */}
          <div className="flex items-center p-0.5 bg-midnight-bg rounded-xl border border-white/[0.06] text-xs">
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'pending'
                  ? 'bg-[#1C1F27] text-white border border-white/10 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'completed'
                  ? 'bg-[#1C1F27] text-white border border-white/10 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Done ({completedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#1C1F27] text-white border border-white/10 shadow-sm font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={openCreateModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Task List (Linear style tidy rows) */}
      <div className="mt-4 space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-midnight-bg border border-white/[0.04]">
            <ListCheck className="w-6 h-6 text-gray-600 mx-auto mb-1.5" />
            <p className="text-xs text-midnight-muted">
              {filter === 'completed'
                ? 'No completed tasks yet.'
                : 'All caught up! Add a new task to anchor your next focus session.'}
            </p>
            {filter !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={openCreateModal}
                className="mt-2 text-xs"
              >
                + Create Task
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => {
            const isCurrentlyActiveInTimer = timer.activeTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                  isCurrentlyActiveInTimer
                    ? 'bg-lavender-400/5 border-lavender-400/35 shadow-sm'
                    : 'bg-midnight-bg border-white/[0.04] hover:border-white/[0.09] hover:bg-[#161820]'
                }`}
              >
                {/* Checkbox and Task Details */}
                <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-3">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="mt-0.5 text-gray-500 hover:text-lavender-400 transition-colors shrink-0 cursor-pointer"
                    title={task.completed ? 'Mark pending' : 'Mark complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-medium leading-tight truncate ${
                          task.completed
                            ? 'line-through text-gray-500'
                            : 'text-gray-100 group-hover:text-white'
                        }`}
                      >
                        {task.title}
                      </span>
                      <PriorityBadge priority={task.priority} />
                      {isCurrentlyActiveInTimer && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-lavender-300 bg-lavender-400/10 px-1.5 py-0.5 rounded border border-lavender-400/25 animate-pulse">
                          <Sparkles className="w-2.5 h-2.5" />
                          Focusing
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-[11px] text-midnight-muted mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {/* Progress details */}
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-midnight-muted font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        Focused: {formatMinutes(task.completedMinutes)}
                        {task.estimatedMinutes ? ` / ~${formatMinutes(task.estimatedMinutes)}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Start Pomodoro, Edit, Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  {!task.completed && (
                    <Button
                      size="sm"
                      variant={isCurrentlyActiveInTimer ? 'primary' : 'outline'}
                      onClick={() => startTaskPomodoro(task)}
                      icon={<Play className="w-3 h-3 fill-current" />}
                      className="text-xs px-2.5 py-1"
                      title="Focus on this task in Pomodoro"
                    >
                      {isCurrentlyActiveInTimer ? 'Active' : 'Focus'}
                    </Button>
                  )}

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
                    title="Edit task"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTaskId ? 'Edit Task' : 'New Task'}
        description="Define an objective to link with your Pomodoro sessions"
      >
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Architect telemetry pipeline"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#111318] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Notes or context..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#111318] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lavender-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-[#111318] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lavender-400"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Estimated Duration
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={estimatedMinutes}
                  onChange={e => setEstimatedMinutes(e.target.value)}
                  className="w-full bg-[#111318] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-lavender-400"
                />
                <span className="absolute right-3 top-2 text-[11px] text-midnight-muted">mins</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingTaskId ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
