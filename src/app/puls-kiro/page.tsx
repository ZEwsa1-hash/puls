'use client';

import React from 'react';
import { Card, Row, Col, Tag } from 'antd';
import AppLayout from '@/components/AppLayout';
import './styles.css';

const PulsKiro = () => {
  const weeks = [
    {
      week: 1,
      dates: 'Feb 18–Feb 24',
      days: [
        { day: 'Wed', value: '37m', status: 'zone2' },
        { day: 'Thu', value: '43m', status: 'hiit' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '83m / 180–210m',
      remaining: '97m Z2 left - need HIIT',
      status: 'active'
    },
    {
      week: 2,
      dates: 'Feb 25–Mar 3',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 200–230m',
      remaining: 'upcoming',
      status: 'upcoming'
    },
    {
      week: 3,
      dates: 'Mar 4–Mar 10',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 220–260m',
      remaining: 'upcoming',
      status: 'upcoming'
    },
    {
      week: 4,
      dates: 'Mar 11–Mar 17',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 160–200m',
      remaining: 'upcoming',
      status: 'deload',
      label: 'DELOAD'
    },
    {
      week: 5,
      dates: 'Mar 18–Mar 24',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 230–270m',
      remaining: 'upcoming',
      status: 'upcoming'
    },
    {
      week: 6,
      dates: 'Mar 25–Mar 31',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 250–300m',
      remaining: 'upcoming',
      status: 'upcoming'
    },
    {
      week: 7,
      dates: 'Apr 1–Apr 7',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 240–280m',
      remaining: 'upcoming',
      status: 'upcoming'
    },
    {
      week: 8,
      dates: 'Apr 8–Apr 14',
      days: [
        { day: 'Wed', value: '', status: 'empty' },
        { day: 'Thu', value: '', status: 'empty' },
        { day: 'Fri', value: '', status: 'empty' },
        { day: 'Sat', value: '', status: 'empty' },
        { day: 'Sun', value: '', status: 'empty' },
        { day: 'Mon', value: '', status: 'empty' },
        { day: 'Tue', value: '', status: 'empty' },
      ],
      total: '0m / 150–190m',
      remaining: 'upcoming',
      status: 'taper',
      label: 'TAPER'
    },
  ];

  return (
    <AppLayout>
      <div className="puls-kiro-container">
        <Card className="main-card">
        <div className="header">
          <h1>RHR 50 → 46 Experiment</h1>
          <p className="subtitle">
            8-week zone 2 + HIIT plan · Feb 18 — Apr 14, 2026 · <span className="dashboard-link">Dashboard</span>
          </p>
        </div>

        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-label">TOTAL Z2</div>
            <div className="stat-value">83m</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">TARGET</div>
            <div className="stat-value">1630m</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">WEEKS DONE</div>
            <div className="stat-value">0/1</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">HIIT WEEKS</div>
            <div className="stat-value">0/1</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">WEEK</div>
            <div className="stat-value">1 of 8</div>
          </div>
        </div>

        <div className="legend">
          <span className="legend-item">
            <span className="legend-dot zone2"></span> Zone 2
          </span>
          <span className="legend-item">
            <span className="legend-dot hiit"></span> HIIT
          </span>
          <span className="legend-item">
            <span className="legend-dot today"></span> Today
          </span>
        </div>

        <div className="weeks-container">
          {weeks.map((week) => (
            <div key={week.week} className={`week-row ${week.status}`}>
              <div className="week-header">
                <div className="week-info">
                  <div className="week-title">
                    Week {week.week} {week.label && <span className="week-label">{week.label}</span>}
                  </div>
                  <div className="week-dates">{week.dates}</div>
                </div>
              </div>

              <div className="days-container">
                {week.days.map((day, index) => (
                  <div key={index} className={`day-cell ${day.status}`}>
                    <div className="day-name">{day.day}</div>
                    {day.value && <div className="day-value">{day.value}</div>}
                  </div>
                ))}
              </div>

              <div className="week-summary">
                <div className="week-total">{week.total}</div>
                <div className="week-remaining">{week.remaining}</div>
              </div>
            </div>
          ))}
        </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default PulsKiro;
