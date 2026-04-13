// Calculation utilities for program statistics and progress

import { Workout, ProgramStats, WeekProgress, WeekData, DayInfo } from '../types';
import { PROGRAM_STRUCTURE, TOTAL_PROGRAM_TARGET, PROGRAM_START_DATE, DAYS_OF_WEEK } from '../constants/program';

/**
 * Calculate overall program statistics from all workouts
 */
export function calculateProgramStats(
  workouts: Map<string, Workout>
): ProgramStats {
  let totalZone2Minutes = 0;
  let totalMinutes = 0;
  const hiitWeeks = new Set<number>();
  const completedWeeks = new Set<number>();

  // Aggregate workout data
  workouts.forEach((workout, key) => {
    const [week] = key.split('-').map(Number);
    totalMinutes += workout.duration;
    
    if (workout.type === 'zone2') {
      totalZone2Minutes += workout.duration;
    } else if (workout.type === 'hiit') {
      hiitWeeks.add(week);
    }
  });

  // Check completed weeks
  for (let week = 1; week <= 8; week++) {
    const progress = calculateWeekProgress(workouts, week);
    if (progress.isComplete) {
      completedWeeks.add(week);
    }
  }

  return {
    totalZone2Minutes,
    totalMinutes,
    targetMinutes: TOTAL_PROGRAM_TARGET,
    weeksCompleted: completedWeeks.size,
    hiitWeeks: hiitWeeks.size,
    currentWeek: getCurrentWeek(),
  };
}

/**
 * Calculate progress for a specific week
 */
export function calculateWeekProgress(
  workouts: Map<string, Workout>,
  week: number
): WeekProgress {
  let totalMinutes = 0;
  let zone2Minutes = 0;
  let hiitMinutes = 0;
  let hasHiit = false;

  // Sum workouts for this week
  for (let day = 0; day < 7; day++) {
    const workout = workouts.get(`${week}-${day}`);
    if (workout) {
      totalMinutes += workout.duration;
      if (workout.type === 'zone2') {
        zone2Minutes += workout.duration;
      } else {
        hiitMinutes += workout.duration;
        hasHiit = true;
      }
    }
  }

  const weekData = PROGRAM_STRUCTURE[week - 1];
  const meetsMinimum = totalMinutes >= weekData.targetMin;
  const isComplete = meetsMinimum && hasHiit;
  const remainingMinutes = Math.max(0, weekData.targetMin - totalMinutes);

  return {
    totalMinutes,
    zone2Minutes,
    hiitMinutes,
    hasHiit,
    meetsMinimum,
    isComplete,
    remainingMinutes,
  };
}

/**
 * Get the current week number (1-8) based on program start date
 */
export function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(PROGRAM_START_DATE);
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.floor(diffDays / 7) + 1;
  return Math.max(1, Math.min(8, week));
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Generate week data with dates for a specific week number
 */
export function generateWeekData(weekNumber: number): WeekData {
  const programStart = new Date(PROGRAM_START_DATE);
  const weekStart = new Date(programStart);
  weekStart.setDate(programStart.getDate() + (weekNumber - 1) * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const weekConfig = PROGRAM_STRUCTURE[weekNumber - 1];
  
  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    days.push({
      day: DAYS_OF_WEEK[i],
      dayNumber: i,
      date,
    });
  }
  
  return {
    week: weekNumber,
    startDate: weekStart,
    endDate: weekEnd,
    targetMin: weekConfig.targetMin,
    targetMax: weekConfig.targetMax,
    label: weekConfig.label,
    days,
  };
}

/**
 * Format date range for display (e.g., "Feb 18–Feb 24")
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
  const startDay = startDate.getDate();
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
  const endDay = endDate.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}`;
  }
  return `${startMonth} ${startDay}–${endMonth} ${endDay}`;
}
