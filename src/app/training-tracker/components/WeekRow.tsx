// WeekRow component - Display a single training week

import React, { memo } from 'react';
import { WeekData, Workout, WeekProgress } from '../types';
import { DayCell } from './DayCell';
import { isToday, formatDateRange } from '../services/calculations';

export interface WeekRowProps {
  week: WeekData;
  workouts: Map<string, Workout>;
  weekProgress: WeekProgress;
  isActive: boolean;
  onDayClick: (week: number, day: number) => void;
}

export const WeekRow: React.FC<WeekRowProps> = memo(({ 
  week, 
  workouts, 
  weekProgress,
  isActive, 
  onDayClick 
}) => {
  // Determine week row class
  const getWeekClass = (): string => {
    const classes = ['week-row'];
    
    if (isActive) {
      classes.push('active');
    }
    
    return classes.join(' ');
  };

  // Format remaining minutes message
  const getRemainingMessage = (): string => {
    if (weekProgress.isComplete) {
      return 'Complete ✓';
    }
    
    if (weekProgress.remainingMinutes > 0) {
      const needHiit = !weekProgress.hasHiit ? ' - need HIIT' : '';
      return `${weekProgress.remainingMinutes}m left${needHiit}`;
    }
    
    if (!weekProgress.hasHiit) {
      return 'need HIIT';
    }
    
    return 'Complete ✓';
  };

  return (
    <div className={getWeekClass()}>
      <div className="week-header">
        <div className="week-info">
          <div className="week-title">
            Week {week.week}
            {week.label && <span className="week-label">{week.label}</span>}
          </div>
          <div className="week-dates">
            {formatDateRange(week.startDate, week.endDate)}
          </div>
        </div>
      </div>

      <div className="days-container">
        {week.days.map((day) => {
          const workout = workouts.get(`${week.week}-${day.dayNumber}`);
          return (
            <DayCell
              key={day.dayNumber}
              day={day}
              workout={workout}
              isToday={isToday(day.date)}
              onClick={() => onDayClick(week.week, day.dayNumber)}
            />
          );
        })}
      </div>

      <div className="week-summary">
        <div className="week-total">
          {weekProgress.totalMinutes}m / {week.targetMin}–{week.targetMax}m
        </div>
        <div className="week-remaining">
          {getRemainingMessage()}
        </div>
      </div>
    </div>
  );
});

WeekRow.displayName = 'WeekRow';
