/**
 * Format total seconds into MM:SS format
 */
export function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format minutes into readable human duration, e.g. "2h 30m" or "45m"
 */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m === 0) return '0m';
  const hours = Math.floor(m / 60);
  const remainingMins = m % 60;
  if (hours > 0 && remainingMins > 0) {
    return `${hours}h ${remainingMins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMins}m`;
}

/**
 * Get current date in local YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a YYYY-MM-DD or ISO date string into a user-friendly label (e.g., "Today", "Yesterday", "Mon, Oct 12")
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const d = new Date(dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr);
  
  if (dateStr.slice(0, 10) === today) {
    return 'Today';
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yYear = yesterdayDate.getFullYear();
  const yMonth = (yesterdayDate.getMonth() + 1).toString().padStart(2, '0');
  const yDay = yesterdayDate.getDate().toString().padStart(2, '0');
  if (dateStr.slice(0, 10) === `${yYear}-${yMonth}-${yDay}`) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get array of past N dates in YYYY-MM-DD format ending today
 */
export function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

/**
 * Current timestamp in ms
 */
export function nowMs(): number {
  return Date.now();
}
