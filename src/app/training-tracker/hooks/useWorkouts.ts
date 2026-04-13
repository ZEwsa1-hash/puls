// Workout data management hook with CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { Workout, StoredData } from '../types';
import { PROGRAM_START_DATE } from '../constants/program';

const STORAGE_KEY = 'training-tracker-v1';

export interface UseWorkoutsReturn {
  workouts: Map<string, Workout>;
  addWorkout: (week: number, day: number, workout: Workout) => void;
  updateWorkout: (week: number, day: number, workout: Workout) => void;
  deleteWorkout: (week: number, day: number) => void;
  getWorkout: (week: number, day: number) => Workout | undefined;
}

/**
 * Custom hook for managing workout data with localStorage persistence
 */
export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<Map<string, Workout>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data: StoredData = JSON.parse(stored);
        const workoutMap = new Map<string, Workout>();
        
        data.workouts.forEach(({ week, day, workout }) => {
          workoutMap.set(`${week}-${day}`, workout);
        });
        
        setWorkouts(workoutMap);
      }
    } catch (error) {
      console.error('Error loading workouts from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage whenever workouts change
  useEffect(() => {
    if (!isInitialized) return;
    if (typeof window === 'undefined') return;

    try {
      const workoutsArray: StoredData['workouts'] = [];
      workouts.forEach((workout, key) => {
        const [week, day] = key.split('-').map(Number);
        workoutsArray.push({ week, day, workout });
      });

      const data: StoredData = {
        version: 1,
        workouts: workoutsArray,
        programStartDate: PROGRAM_START_DATE,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving workouts to localStorage:', error);
    }
  }, [workouts, isInitialized]);

  // Add a new workout
  const addWorkout = useCallback((week: number, day: number, workout: Workout) => {
    setWorkouts(prev => {
      const next = new Map(prev);
      next.set(`${week}-${day}`, workout);
      return next;
    });
  }, []);

  // Update an existing workout
  const updateWorkout = useCallback((week: number, day: number, workout: Workout) => {
    setWorkouts(prev => {
      const next = new Map(prev);
      next.set(`${week}-${day}`, workout);
      return next;
    });
  }, []);

  // Delete a workout
  const deleteWorkout = useCallback((week: number, day: number) => {
    setWorkouts(prev => {
      const next = new Map(prev);
      next.delete(`${week}-${day}`);
      return next;
    });
  }, []);

  // Get a specific workout
  const getWorkout = useCallback((week: number, day: number): Workout | undefined => {
    return workouts.get(`${week}-${day}`);
  }, [workouts]);

  return {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkout,
  };
}
