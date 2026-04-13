'use client';

// Main Training Tracker page component

import React, { useState, useMemo, useCallback } from 'react';
import { Card, message } from 'antd';
import { useWorkouts } from './hooks/useWorkouts';
import { useProgram } from './hooks/useProgram';
import { generateWeekData } from './services/calculations';
import { StatsBar } from './components/StatsBar';
import { Legend } from './components/Legend';
import { WeekRow } from './components/WeekRow';
import { WorkoutModal } from './components/WorkoutModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Workout } from './types';
import { DAYS_OF_WEEK } from './constants/program';
import AppLayout from '@/components/AppLayout';
import './styles.css';

interface SelectedDay {
  week: number;
  day: number;
  dayName: string;
}

const TrainingTrackerPage: React.FC = () => {
  // State management
  const { workouts, addWorkout, updateWorkout, deleteWorkout, getWorkout } = useWorkouts();
  const { stats, getWeekProgress, currentWeek } = useProgram(workouts);
  
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Generate week data for all 8 weeks
  const weeks = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => generateWeekData(i + 1));
  }, []);

  // Event handlers
  const handleDayClick = useCallback((week: number, day: number) => {
    setSelectedDay({
      week,
      day,
      dayName: DAYS_OF_WEEK[day],
    });
    setIsModalOpen(true);
  }, []);

  const handleWorkoutSave = useCallback((workout: Workout) => {
    if (!selectedDay) return;

    const existingWorkout = getWorkout(selectedDay.week, selectedDay.day);
    
    if (existingWorkout) {
      updateWorkout(selectedDay.week, selectedDay.day, workout);
      message.success('Workout updated successfully');
    } else {
      addWorkout(selectedDay.week, selectedDay.day, workout);
      message.success('Workout saved successfully');
    }
    
    setIsModalOpen(false);
    setSelectedDay(null);
  }, [selectedDay, getWorkout, updateWorkout, addWorkout]);

  const handleWorkoutDelete = useCallback(() => {
    if (!selectedDay) return;

    deleteWorkout(selectedDay.week, selectedDay.day);
    message.success('Workout deleted');
    
    setIsModalOpen(false);
    setSelectedDay(null);
  }, [selectedDay, deleteWorkout]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDay(null);
  }, []);

  // Get current workout for modal
  const currentWorkout = selectedDay 
    ? getWorkout(selectedDay.week, selectedDay.day)
    : undefined;

  return (
    <AppLayout>
      <ErrorBoundary>
        <div className="training-tracker-container">
          <Card className="main-card">
            <div className="header">
              <h1>RHR 50 → 46 Experiment</h1>
              <p className="subtitle">
                8-week zone 2 + HIIT plan · Feb 18 — Apr 14, 2026
              </p>
            </div>

            <StatsBar stats={stats} />
            
            <Legend />

            <div className="weeks-container">
              {weeks.map((week) => (
                <WeekRow
                  key={week.week}
                  week={week}
                  workouts={workouts}
                  weekProgress={getWeekProgress(week.week)}
                  isActive={week.week === currentWeek}
                  onDayClick={handleDayClick}
                />
              ))}
            </div>
          </Card>

          {selectedDay && (
            <WorkoutModal
              open={isModalOpen}
              workout={currentWorkout}
              dayInfo={selectedDay}
              onSave={handleWorkoutSave}
              onDelete={handleWorkoutDelete}
              onCancel={handleModalClose}
            />
          )}
        </div>
      </ErrorBoundary>
    </AppLayout>
  );
};

export default TrainingTrackerPage;
