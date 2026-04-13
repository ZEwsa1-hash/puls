// Program calculations hook with derived state

import { useMemo } from 'react';
import { Workout, ProgramStats, WeekProgress, WeekStatus } from '../types';
import { calculateProgramStats, calculateWeekProgress, getCurrentWeek } from '../services/calculations';

export interface UseProgramReturn {
  stats: ProgramStats;
  getWeekStatus: (week: number) => WeekStatus;
  getWeekProgress: (week: number) => WeekProgress;
  currentWeek: number;
}

/**
 * Custom hook for program-level calculations and statistics
 * @param workouts - Map of all workouts
 */
export function useProgram(workouts: Map<string, Workout>): UseProgramReturn {
  // Calculate program statistics (memoized)
  const stats = useMemo(() => {
    return calculateProgramStats(workouts);
  }, [workouts]);

  // Get current week number
  const currentWeek = useMemo(() => {
    return getCurrentWeek();
  }, []);

  // Get week status for styling
  const getWeekStatus = useMemo(() => {
    return (week: number): WeekStatus => {
      const progress = calculateWeekProgress(workouts, week);
      
      if (week === currentWeek) {
        return 'active';
      }
      
      if (progress.isComplete) {
        return 'completed';
      }
      
      if (week === 4) {
        return 'deload';
      }
      
      if (week === 8) {
        return 'taper';
      }
      
      return 'upcoming';
    };
  }, [workouts, currentWeek]);

  // Get week progress
  const getWeekProgress = useMemo(() => {
    return (week: number): WeekProgress => {
      return calculateWeekProgress(workouts, week);
    };
  }, [workouts]);

  return {
    stats,
    getWeekStatus,
    getWeekProgress,
    currentWeek,
  };
}
