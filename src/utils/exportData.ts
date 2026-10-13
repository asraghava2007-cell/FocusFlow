import { AppState } from '../types';

/**
 * Trigger browser file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export full application state as formatted JSON
 */
export function exportStateToJson(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(jsonStr, `focusflow-backup-${timestamp}.json`, 'application/json');
}

/**
 * Export Screen-Time records and Pomodoro sessions as CSV
 */
export function exportDataToCsv(state: AppState): void {
  const headers = ['Type', 'ID', 'Date', 'Category_or_Mode', 'Duration_Minutes', 'Title_or_Description', 'Source', 'Timestamp'];
  
  const screenTimeRows = state.screenTimeEntries.map(entry => [
    'ScreenTime',
    `"${entry.id}"`,
    `"${entry.date}"`,
    `"${entry.category}"`,
    entry.durationMinutes,
    `"${(entry.description || '').replace(/"/g, '""')}"`,
    `"${entry.source}"`,
    `"${entry.createdAt}"`
  ]);

  const pomoRows = state.pomodoroHistory.map(session => [
    'PomodoroSession',
    `"${session.id}"`,
    `"${session.date}"`,
    `"${session.mode}"`,
    session.durationMinutes,
    `"${(session.taskTitle || '').replace(/"/g, '""')}"`,
    '"pomodoro"',
    `"${session.completedAt}"`
  ]);

  const taskRows = state.tasks.map(task => [
    'Task',
    `"${task.id}"`,
    `"${task.createdAt.slice(0, 10)}"`,
    `"${task.priority}"`,
    task.completedMinutes,
    `"${(task.title || '').replace(/"/g, '""')}"`,
    task.completed ? '"completed"' : '"pending"',
    `"${task.completedAt || task.createdAt}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...screenTimeRows.map(r => r.join(',')),
    ...pomoRows.map(r => r.join(',')),
    ...taskRows.map(r => r.join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `focusflow-data-${timestamp}.csv`, 'text/csv;charset=utf-8;');
}
