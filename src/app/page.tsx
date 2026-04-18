"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Button, Progress, Space, Tag, Typography } from "antd";
import {
  BarChartOutlined,
  CalendarOutlined,
  FireOutlined,
  HeatMapOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import AppLayout from "@/components/AppLayout";
import { useGymStore, calculateTonnage } from "@/store/useGymStore";
import { useWorkouts } from "@/app/training-tracker/hooks/useWorkouts";
import { buildWeeklyOsSummary, gymWeekPlan } from "@/lib/weeklyOs";
import "./weekly-os.css";

const { Title, Text } = Typography;

function formatKg(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU")} кг`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

export default function WeeklyOsPage() {
  const { workouts } = useWorkouts();
  const gymSessions = useGymStore((state) => state.sessions);

  const summary = useMemo(
    () => buildWeeklyOsSummary(workouts, gymSessions),
    [workouts, gymSessions]
  );

  const cardioPercent = Math.min(
    100,
    Math.round((summary.cardio.totalMinutes / summary.cardio.targetMinutes) * 100)
  );

  const recentActivity = useMemo(() => {
    const cardio = Array.from(workouts.values()).map((workout) => ({
      id: `cardio-${workout.date}-${workout.type}-${workout.duration}`,
      date: workout.date,
      title: workout.type === "hiit" ? "HIIT" : "Zone 2",
      detail: `${workout.duration} мин${workout.heartRate ? ` · ${workout.heartRate} bpm` : ""}`,
    }));

    const gym = gymSessions.map((session) => ({
      id: session.id,
      date: session.date,
      title: session.title,
      detail: `${session.exercises.length} упр. · ${formatKg(calculateTonnage(session.exercises))}`,
    }));

    return [...cardio, ...gym]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [gymSessions, workouts]);

  return (
    <AppLayout>
      <main className="weekly-os-page">
        <section className="weekly-os-hero" aria-labelledby="today-title">
          <div className="weekly-os-hero__copy">
            <Text className="weekly-os-kicker">Сегодня · {summary.weekRangeLabel}</Text>
            <Title id="today-title" className="weekly-os-title">
              {summary.recommendation.title}
            </Title>
            <Text className="weekly-os-reason">{summary.recommendation.reason}</Text>
          </div>

          <div className="weekly-os-hero__action">
            <Button
              type="primary"
              size="large"
              icon={summary.recommendation.kind === "gym" ? <ThunderboltOutlined /> : <FireOutlined />}
              href={summary.recommendation.href}
            >
              {summary.recommendation.actionLabel}
            </Button>
            <Space size={8} wrap>
              <Tag color={summary.gym.todayPlan ? "gold" : "default"}>
                {summary.gym.todayPlan ? summary.gym.todayPlan.template : `Дальше: ${summary.gym.nextPlan.dayLabel}`}
              </Tag>
              <Tag color={summary.cardio.hasHiit ? "green" : "red"}>
                {summary.cardio.hasHiit ? "HIIT закрыт" : "HIIT нужен"}
              </Tag>
            </Space>
          </div>
        </section>

        <section className="weekly-os-actions" aria-label="Быстрые действия">
          <Link className="weekly-os-action" href="/gym">
            <ThunderboltOutlined />
            <span>Открыть Gym</span>
            <strong>{summary.gym.sessions} сесс. за неделю</strong>
          </Link>
          <Link className="weekly-os-action" href="/training-tracker">
            <FireOutlined />
            <span>Записать кардио</span>
            <strong>{summary.cardio.remainingMinutes} мин до базы</strong>
          </Link>
          <Link className="weekly-os-action" href="/analytics">
            <BarChartOutlined />
            <span>Проверить прогресс</span>
            <strong>Кардио + Gym</strong>
          </Link>
          <Link className="weekly-os-action" href="/heatmap">
            <HeatMapOutlined />
            <span>Карта активности</span>
            <strong>Годовой ритм</strong>
          </Link>
        </section>

        <section className="weekly-os-grid" aria-label="Сводка недели">
          <div className="weekly-os-panel weekly-os-panel--main">
            <div className="weekly-os-panel__head">
              <div>
                <Text className="weekly-os-kicker">Кардио база</Text>
                <Title level={3}>Zone 2 + HIIT</Title>
              </div>
              <strong>{cardioPercent}%</strong>
            </div>
            <Progress
              percent={cardioPercent}
              showInfo={false}
              strokeColor="var(--acid)"
              trailColor="rgba(244, 241, 232, 0.1)"
            />
            <div className="weekly-os-metrics">
              <span>
                <strong>{summary.cardio.totalMinutes}</strong>
                мин всего
              </span>
              <span>
                <strong>{summary.cardio.zone2Minutes}</strong>
                Zone 2
              </span>
              <span>
                <strong>{summary.cardio.hiitMinutes}</strong>
                HIIT
              </span>
            </div>
          </div>

          <div className="weekly-os-panel">
            <Text className="weekly-os-kicker">Gym неделя</Text>
            <div className="weekly-os-big-number">{formatKg(summary.gym.tonnage)}</div>
            <div className="weekly-os-metrics weekly-os-metrics--compact">
              <span>{summary.gym.sessions} тренировок</span>
              <span>{summary.gym.sets} подходов</span>
            </div>
          </div>

          <div className="weekly-os-panel">
            <Text className="weekly-os-kicker">Расписание</Text>
            <div className="weekly-os-plan">
              {gymWeekPlan.map((plan) => (
                <div
                  key={`${plan.dayIndex}-${plan.template}`}
                  className={plan.dayIndex === new Date().getDay() ? "is-today" : ""}
                >
                  <span>{plan.dayLabel}</span>
                  <strong>{plan.template}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="weekly-os-panel">
            <Text className="weekly-os-kicker">Последнее</Text>
            {summary.gym.latestSession ? (
              <div className="weekly-os-latest">
                <strong>{summary.gym.latestSession.title}</strong>
                <span>{formatDate(summary.gym.latestSession.date)}</span>
                <span>{formatKg(calculateTonnage(summary.gym.latestSession.exercises))}</span>
              </div>
            ) : (
              <Text type="secondary">Пока нет записей Gym.</Text>
            )}
          </div>
        </section>

        <section className="weekly-os-timeline" aria-labelledby="activity-title">
          <div className="weekly-os-section-head">
            <div>
              <Text className="weekly-os-kicker">Лента</Text>
              <Title id="activity-title" level={3}>
                Последние записи
              </Title>
            </div>
            <CalendarOutlined />
          </div>

          {recentActivity.length > 0 ? (
            <div className="weekly-os-feed">
              {recentActivity.map((item) => (
                <div key={item.id} className="weekly-os-feed__item">
                  <time>{formatDate(item.date)}</time>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="weekly-os-empty">
              <strong>Чистый старт</strong>
              <span>Добавь первую запись в Gym или кардио, и здесь появится короткая история недели.</span>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
