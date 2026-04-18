"use client";

import React, { useMemo } from 'react';
import { Typography } from 'antd';
import { usePulsStore } from '@/store/usePulsStore';
import { useGymStore, calculateTonnage } from '@/store/useGymStore';
import { useWikiStore } from '@/store/useWikiStore';
import AppLayout from '@/components/AppLayout';

const { Title, Text } = Typography;

type HeatmapTone = 'white' | 'purple' | 'green';

const PULS_START_DATE = '2026-02-18';
const HEATMAP_WEEKS = 52;
const DAYS_IN_WEEK = 7;
const CELL_SIZE = 12;
const CELL_GAP = 5;

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getHeatColor(value: number, tone: HeatmapTone): string {
  if (value <= 0) return '#161b22';

  if (tone === 'white') {
    if (value < 20) return 'rgba(255, 255, 255, 0.2)';
    if (value < 60) return 'rgba(255, 255, 255, 0.5)';
    if (value < 100) return 'rgba(255, 255, 255, 0.8)';
    return 'rgba(255, 255, 255, 1)';
  }

  if (tone === 'purple') {
    if (value < 500) return '#3b0764';
    if (value < 2000) return '#6b21a8';
    if (value < 5000) return '#9333ea';
    return '#a855f7';
  }

  if (value < 30) return '#064e3b';
  if (value < 60) return '#047857';
  if (value < 120) return '#10b981';
  return '#34d399';
}

function HeatmapSquare({
  value,
  colorHue,
  title,
}: {
  value: number;
  colorHue: HeatmapTone;
  title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: `${CELL_SIZE}px`,
        height: `${CELL_SIZE}px`,
        backgroundColor: getHeatColor(value, colorHue),
        borderRadius: '3px',
        flex: '0 0 auto',
      }}
    />
  );
}

function HeatmapBoard({
  dataMap,
  colorHue,
  title,
  unit,
}: {
  dataMap: Record<string, number>;
  colorHue: HeatmapTone;
  title: string;
  unit: string;
}) {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const firstVisibleDate = useMemo(() => {
    const dayOffset = (HEATMAP_WEEKS - 1) * DAYS_IN_WEEK + today.getDay();
    return addDays(today, -dayOffset);
  }, [today]);

  const matrix = useMemo(() => {
    return Array.from({ length: HEATMAP_WEEKS }, (_, weekIndex) =>
      Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => {
        const date = addDays(firstVisibleDate, weekIndex * DAYS_IN_WEEK + dayIndex);
        if (date > today) {
          return { dateKey: toDateKey(date), value: 0, isFuture: true };
        }
        const dateKey = toDateKey(date);
        return { dateKey, value: dataMap[dateKey] || 0, isFuture: false };
      })
    );
  }, [dataMap, firstVisibleDate, today]);

  const total = useMemo(
    () => Object.values(dataMap).reduce((sum, value) => sum + value, 0),
    [dataMap]
  );

  return (
    <div className="heatmap-board" style={{ marginBottom: '40px' }}>
      <div className="heatmap-board__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <Title level={4} style={{ color: '#fff', margin: 0 }}>
          {title}
        </Title>
        <Text style={{ color: '#8c8c8c', fontSize: '12px', fontWeight: 700 }}>
          {Math.round(total).toLocaleString()} {unit}
        </Text>
      </div>

      <div className="heatmap-board__scroller" style={{ display: 'flex', gap: `${CELL_GAP}px`, overflowX: 'auto', paddingRight: '16px', paddingBottom: '8px' }}>
        {matrix.map((week, weekIdx) => (
          <div key={weekIdx} style={{ display: 'flex', flexDirection: 'column', gap: `${CELL_GAP}px` }}>
            {week.map((day) => (
              <HeatmapSquare
                key={day.dateKey}
                value={day.isFuture ? 0 : day.value}
                colorHue={colorHue}
                title={`${day.dateKey}: ${Math.round(day.value)} ${unit}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="heatmap-board__legend" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', color: '#8c8c8c', fontSize: '12px', marginTop: '8px' }}>
        <span>Меньше</span>
        {[0, 10, 60, 100, 5000].map((value) => (
          <HeatmapSquare key={value} value={value} colorHue={colorHue} />
        ))}
        <span>Больше</span>
      </div>
    </div>
  );
}

export default function HeatmapDashboard() {
  const { weeks: pulsWeeks } = usePulsStore();
  const { sessions: gymSessions } = useGymStore();
  const { notes: wikiNotes } = useWikiStore();

  const pulsData = useMemo(() => {
    const data: Record<string, number> = {};
    const start = new Date(PULS_START_DATE);

    pulsWeeks.forEach((week, weekIndex) => {
      week.days.forEach((day, dayIndex) => {
        if (day.state === 'empty' || day.minutes <= 0) return;

        const date = addDays(start, weekIndex * DAYS_IN_WEEK + dayIndex);
        const dateKey = toDateKey(date);
        data[dateKey] = (data[dateKey] || 0) + day.minutes;
      });
    });

    return data;
  }, [pulsWeeks]);

  const gymData = useMemo(() => {
    const data: Record<string, number> = {};

    gymSessions.forEach((session) => {
      data[session.date] = (data[session.date] || 0) + calculateTonnage(session.exercises);
    });

    return data;
  }, [gymSessions]);

  const wikiData = useMemo(() => {
    const data: Record<string, number> = {};

    wikiNotes.forEach((note) => {
      if (!note.dateCreated) return;
      data[note.dateCreated] = (data[note.dateCreated] || 0) + note.deepworkMinutes;
    });

    return data;
  }, [wikiNotes]);

  return (
    <AppLayout>
      <div className="heatmap-page" style={{ padding: '40px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '40px' }}>
          <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
            Карта Активности
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: '15px' }}>
            Ваши графики вкладов в привычки за год
          </Text>
        </div>

        <div className="heatmap-card" style={{ backgroundColor: '#1c1c1c', border: '1px solid #333', borderRadius: '16px', padding: '32px' }}>
          <HeatmapBoard title="Puls Tracker (Кардио)" colorHue="white" dataMap={pulsData} unit="мин" />
          <HeatmapBoard title="Зал (Тоннаж)" colorHue="purple" dataMap={gymData} unit="кг" />
          <HeatmapBoard title="Deepwork (Wiki Знаний)" colorHue="green" dataMap={wikiData} unit="мин" />
        </div>
      </div>
    </AppLayout>
  );
}
