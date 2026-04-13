// DayCell component - Individual day display with workout information

import React, { memo } from 'react';
import { Workout, DayInfo } from '../types';

export interface DayCellProps {
  day: DayInfo;
  workout: Workout | undefined;
  isToday: boolean;
  onClick: () => void;
}

export const DayCell: React.FC<DayCellProps> = memo(({ day, workout, isToday, onClick }) => {
  // Determine cell class based on workout type and today status
  const getCellClass = (): string => {
    const classes = ['day-cell'];
    
    if (workout) {
      classes.push(workout.type);
    }
    
    if (isToday) {
      classes.push('today');
    }
    
    return classes.join(' ');
  };

  return (
    <div 
      className={getCellClass()} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={
        workout
          ? `${day.day}, ${workout.duration} minutes ${workout.type === 'zone2' ? 'Zone 2' : 'HIIT'}${workout.heartRate ? `, ${workout.heartRate} bpm` : ''}`
          : `${day.day}, no workout`
      }
    >
      <div className="day-name">{day.day}</div>
      {workout && (
        <>
          <div className="day-value">{workout.duration}m</div>
          {workout.heartRate && <div className="day-hr">{workout.heartRate} bpm</div>}
        </>
      )}
    </div>
  );
});
