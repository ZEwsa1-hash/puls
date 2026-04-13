// Type definitions for Training Tracker application

// Workout type enumeration
export type WorkoutType = 'zone2' | 'hiit';

// Individual workout entry
export interface Workout {
  type: WorkoutType;
  duration: number; // minutes
  heartRate?: number; // optional heart rate (bpm)
  date: string; // ISO date string
}

// Day information for calendar display
export interface DayInfo {
  day: string; // "Wed", "Thu", etc.
  dayNumber: number; // 0-6
  date: Date;
}

// Week structure with targets
export interface WeekData {
  week: number; // 1-8
  startDate: Date;
  endDate: Date;
  targetMin: number; // minimum minutes
  targetMax: number; // maximum minutes
  label?: 'DELOAD' | 'TAPER';
  days: DayInfo[];
}

// Week progress calculations
export interface WeekProgress {
  totalMinutes: number;
  zone2Minutes: number;
  hiitMinutes: number;
  hasHiit: boolean;
  meetsMinimum: boolean;
  isComplete: boolean;
  remainingMinutes: number;
}

// Week status for styling
export type WeekStatus = 'active' | 'completed' | 'upcoming' | 'deload' | 'taper';

// Overall program statistics
export interface ProgramStats {
  totalZone2Minutes: number;
  totalMinutes: number;
  targetMinutes: number; // 1630
  weeksCompleted: number;
  hiitWeeks: number;
  currentWeek: number;
}

// localStorage data structure
export interface StoredData {
  version: number; // for future migrations
  workouts: Array<{
    week: number;
    day: number;
    workout: Workout;
  }>;
  programStartDate: string; // ISO date
}
