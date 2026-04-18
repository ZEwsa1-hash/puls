'use client';

// Main Training Tracker page component

import React, { useState, useMemo, useCallback } from 'react';
import { Card, message } from 'antd';
import { useWorkouts } from './hooks/useWorkouts';
import { useProgram } from './hooks/useProgram';
import { generateWeekData, isToday } from './services/calculations';
import { StatsBar } from './components/StatsBar';
import { Legend } from './components/Legend';
import { WeekRow } from './components/WeekRow';
import { WorkoutModal } from './components/WorkoutModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Workout, WeekData, WeekProgress } from './types';
import { DAYS_OF_WEEK } from './constants/program';
import AppLayout from '@/components/AppLayout';
import './styles.css';

interface SelectedDay {
  week: number;
  day: number;
  dayName: string;
}

interface TimelineDay {
  week: number;
  day: number;
  dayName: string;
  date: Date;
  workout?: Workout;
}

const formatWorkoutType = (workout: Workout): string => (
  workout.type === 'hiit' ? 'HIIT' : 'Zone 2'
);

const formatShortDate = (date: Date): string => (
  date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
);

const getTodayFocus = (
  today: TimelineDay | undefined,
  weekProgress: WeekProgress,
  week: WeekData
): string => {
  if (today?.workout) {
    return `${formatWorkoutType(today.workout)} ${today.workout.duration} мин уже закрыто`;
  }

  if (!today) {
    return weekProgress.isComplete
      ? 'Неделя закрыта. Поддержи ритм легкой Zone 2'
      : `Добери ${weekProgress.remainingMinutes} мин до минимума недели`;
  }

  if (!weekProgress.hasHiit) {
    return 'Поставь HIIT или спокойную Zone 2 по самочувствию';
  }

  if (weekProgress.remainingMinutes > 0) {
    return `Zone 2 на ${Math.min(60, weekProgress.remainingMinutes)} мин`;
  }

  return `Цель ${week.targetMin} мин закрыта. Сегодня восстановление`;
};

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

  const currentWeekData = weeks[currentWeek - 1];
  const currentWeekProgress = getWeekProgress(currentWeek);

  const timelineDays = useMemo<TimelineDay[]>(() => {
    return weeks.flatMap((week) => (
      week.days.map((day) => ({
        week: week.week,
        day: day.dayNumber,
        dayName: day.day,
        date: day.date,
        workout: workouts.get(`${week.week}-${day.dayNumber}`),
      }))
    ));
  }, [weeks, workouts]);

  const todayInfo = useMemo(() => {
    const today = timelineDays.find((day) => isToday(day.date));
    const now = new Date();
    const nextOpenDay = timelineDays.find((day) => day.date >= now && !day.workout);
    const fallbackOpenDay = timelineDays.find((day) => day.week === currentWeek && !day.workout);
    const lastCompletedDays = timelineDays
      .filter((day) => day.workout)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 4);
    const completionPercent = Math.min(
      100,
      Math.round((currentWeekProgress.totalMinutes / currentWeekData.targetMin) * 100)
    );

    return {
      focus: getTodayFocus(today, currentWeekProgress, currentWeekData),
      nextDay: nextOpenDay ?? fallbackOpenDay,
      lastCompletedDays,
      completionPercent,
    };
  }, [currentWeek, currentWeekData, currentWeekProgress, timelineDays]);

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

            <section className="today-panel" aria-label="Сводка на сегодня">
              <div className="today-focus">
                <span className="panel-kicker">Сегодняшний фокус</span>
                <strong>{todayInfo.focus}</strong>
                <span>
                  Неделя {currentWeek}: {currentWeekProgress.totalMinutes} из {currentWeekData.targetMin} мин
                </span>
              </div>

              <div className="today-card">
                <span className="panel-kicker">Следующая тренировка</span>
                {todayInfo.nextDay ? (
                  <>
                    <strong>
                      Week {todayInfo.nextDay.week}, {todayInfo.nextDay.dayName}
                    </strong>
                    <span>{formatShortDate(todayInfo.nextDay.date)}</span>
                  </>
                ) : (
                  <>
                    <strong>План закрыт</strong>
                    <span>Дальше поддерживай базу Zone 2</span>
                  </>
                )}
              </div>

              <div className="week-progress-card">
                <div className="week-progress-header">
                  <span className="panel-kicker">Прогресс недели</span>
                  <strong>{todayInfo.completionPercent}%</strong>
                </div>
                <div className="week-progress-track" aria-hidden="true">
                  <span style={{ width: `${todayInfo.completionPercent}%` }} />
                </div>
                <span>
                  {currentWeekProgress.hasHiit ? 'HIIT есть' : 'HIIT еще нужен'}
                </span>
              </div>

              <div className="history-strip">
                <span className="panel-kicker">Последние дни</span>
                <div className="history-list">
                  {todayInfo.lastCompletedDays.length > 0 ? (
                    todayInfo.lastCompletedDays.map((day) => (
                      <button
                        key={`${day.week}-${day.day}`}
                        className="history-pill"
                        type="button"
                        onClick={() => handleDayClick(day.week, day.day)}
                      >
                        <span>{formatShortDate(day.date)}</span>
                        <strong>
                          {day.workout ? `${formatWorkoutType(day.workout)} ${day.workout.duration}m` : ''}
                        </strong>
                      </button>
                    ))
                  ) : (
                    <span className="history-empty">Пока нет сохраненных тренировок</span>
                  )}
                </div>
              </div>
            </section>

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
