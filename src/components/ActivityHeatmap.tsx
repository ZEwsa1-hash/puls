"use client";

import { useMemo } from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

type HeatmapTone = "white" | "blue";

const HEATMAP_WEEKS = 52;
const DAYS_IN_WEEK = 7;
const CELL_SIZE = 12;
const CELL_GAP = 5;

function toDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getHeatColor(value: number, tone: HeatmapTone): string {
  if (value <= 0) return "#161b22";

  if (tone === "white") {
    if (value < 20) return "rgba(255, 255, 255, 0.2)";
    if (value < 60) return "rgba(255, 255, 255, 0.5)";
    if (value < 100) return "rgba(255, 255, 255, 0.8)";
    return "rgba(255, 255, 255, 1)";
  }

  if (value < 500) return "rgba(53, 195, 255, 0.22)";
  if (value < 2000) return "rgba(53, 195, 255, 0.5)";
  if (value < 5000) return "rgba(53, 195, 255, 0.78)";
  return "#35c3ff";
}

function HeatmapSquare({
  value,
  tone,
  title,
}: {
  value: number;
  tone: HeatmapTone;
  title?: string;
}) {
  return (
    <div
      title={title}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        flex: "0 0 auto",
        borderRadius: 3,
        backgroundColor: getHeatColor(value, tone),
      }}
    />
  );
}

export function ActivityHeatmap({
  dataMap,
  tone,
  title,
  unit,
}: {
  dataMap: Record<string, number>;
  tone: HeatmapTone;
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
        const dateKey = toDateKey(date);
        return {
          dateKey,
          isFuture: date > today,
          value: dataMap[dateKey] || 0,
        };
      })
    );
  }, [dataMap, firstVisibleDate, today]);

  const total = useMemo(
    () => Object.values(dataMap).reduce((sum, value) => sum + value, 0),
    [dataMap]
  );

  return (
    <section className="activity-heatmap">
      <div className="heatmap-board__header">
        <Title level={4}>{title}</Title>
        <Text>{Math.round(total).toLocaleString("ru-RU")} {unit}</Text>
      </div>

      <div className="heatmap-board__scroller">
        {matrix.map((week, weekIdx) => (
          <div key={weekIdx} style={{ display: "flex", flexDirection: "column", gap: CELL_GAP }}>
            {week.map((day) => (
              <HeatmapSquare
                key={day.dateKey}
                value={day.isFuture ? 0 : day.value}
                tone={tone}
                title={`${day.dateKey}: ${Math.round(day.value).toLocaleString("ru-RU")} ${unit}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="heatmap-board__legend">
        <span>Меньше</span>
        {[0, 10, 60, 100, 5000].map((value) => (
          <HeatmapSquare key={value} value={value} tone={tone} />
        ))}
        <span>Больше</span>
      </div>
    </section>
  );
}

export { addDays, toDateKey };
