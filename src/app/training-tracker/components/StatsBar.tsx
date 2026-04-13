// StatsBar component - Progress statistics display

import React from 'react';
import { ProgramStats } from '../types';

export interface StatsBarProps {
  stats: ProgramStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="stats-bar" role="region" aria-label="Program statistics" aria-live="polite">
      <div className="stat-item">
        <div className="stat-label">TOTAL Z2</div>
        <div className="stat-value">{stats.totalZone2Minutes}m</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">TARGET</div>
        <div className="stat-value">{stats.targetMinutes}m</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">WEEKS DONE</div>
        <div className="stat-value">{stats.weeksCompleted}/8</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">HIIT WEEKS</div>
        <div className="stat-value">{stats.hiitWeeks}/8</div>
      </div>
      <div className="stat-item">
        <div className="stat-label">WEEK</div>
        <div className="stat-value">{stats.currentWeek} of 8</div>
      </div>
    </div>
  );
};
