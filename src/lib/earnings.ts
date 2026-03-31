export function calculateSessionEarnings(
  clockIn: Date,
  clockOut: Date,
  hourlyRate: number
): number {
  const ms = clockOut.getTime() - clockIn.getTime();
  const hours = ms / (1000 * 60 * 60);
  return Math.round(hours * hourlyRate * 100) / 100;
}

export function calculateWeeklyEarnings(
  entries: { earnings: number | null }[]
): number {
  return entries.reduce((sum, entry) => sum + (entry.earnings ?? 0), 0);
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function getBaguetteProgress(
  weeklyEarnings: number,
  hourlyRate: number,
  expectedHoursPerWeek: number
): number {
  const expectedWeeklyEarnings = hourlyRate * expectedHoursPerWeek;
  if (expectedWeeklyEarnings === 0) return 0;
  return Math.round((weeklyEarnings / expectedWeeklyEarnings) * 100) / 100;
}

export function formatEarnings(amount: number): string {
  if (!isFinite(amount) || isNaN(amount)) return "$0.00";
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateLiveEarnings(
  clockInTime: Date,
  hourlyRate: number
): number {
  const now = new Date();
  if (clockInTime.getTime() > now.getTime()) return 0;
  return calculateSessionEarnings(clockInTime, now, hourlyRate);
}
