// Program structure constants for Training Tracker

export const TOTAL_PROGRAM_TARGET = 1630; // minutes
export const PROGRAM_START_DATE = '2026-02-18'; // Wed, Feb 18, 2026
export const PROGRAM_END_DATE = '2026-04-14'; // Tue, Apr 14, 2026
export const DAYS_OF_WEEK = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];

// Program structure definition with weekly targets
export const PROGRAM_STRUCTURE = [
  { week: 1, targetMin: 180, targetMax: 210 },
  { week: 2, targetMin: 200, targetMax: 230 },
  { week: 3, targetMin: 220, targetMax: 260 },
  { week: 4, targetMin: 160, targetMax: 200, label: 'DELOAD' as const },
  { week: 5, targetMin: 230, targetMax: 270 },
  { week: 6, targetMin: 250, targetMax: 300 },
  { week: 7, targetMin: 240, targetMax: 280 },
  { week: 8, targetMin: 150, targetMax: 190, label: 'TAPER' as const },
];
