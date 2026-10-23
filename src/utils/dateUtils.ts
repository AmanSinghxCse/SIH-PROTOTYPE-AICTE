// Reference anchor date for consistent demonstration: 2026-10-23
export const REFERENCE_DATE_STR = '2026-10-23';

/**
 * Parses YYYY-MM-DD string into UTC midnight timestamp to guarantee
 * exact calendar day differences regardless of host timezone or DST.
 */
function parseCalendarDateToUtc(dateStr: string): number {
  if (!dateStr) return 0;
  // If it's an ISO datetime, extract just the date part YYYY-MM-DD
  const ymd = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
  const parts = ymd.split('-');
  if (parts.length < 3) return 0;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return Date.UTC(year, month, day);
}

const REFERENCE_UTC = parseCalendarDateToUtc(REFERENCE_DATE_STR);

export function getCaseAgeInDays(submissionDate: string, resolvedDate?: string): number {
  const subUtc = parseCalendarDateToUtc(submissionDate);
  const endUtc = resolvedDate ? parseCalendarDateToUtc(resolvedDate) : REFERENCE_UTC;
  if (!subUtc || !endUtc) return 0;
  const diffDays = Math.round((endUtc - subUtc) / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getDaysRemaining(deadlineDate: string): number {
  const deadlineUtc = parseCalendarDateToUtc(deadlineDate);
  if (!deadlineUtc) return 0;
  const diffDays = Math.round((deadlineUtc - REFERENCE_UTC) / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isOverdue(deadlineDate: string, status: string): boolean {
  if (status === 'Resolved' || status === 'Closed') return false;
  return getDaysRemaining(deadlineDate) < 0;
}

export function isApproachingDeadline(deadlineDate: string, status: string, thresholdDays: number = 5): boolean {
  if (status === 'Resolved' || status === 'Closed') return false;
  const daysLeft = getDaysRemaining(deadlineDate);
  return daysLeft >= 0 && daysLeft <= thresholdDays;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const ymd = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim();
    const parts = ymd.split('-');
    if (parts.length === 3) {
      const d = new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)));
      return d.toLocaleDateString('en-IN', {
        timeZone: 'UTC',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}
