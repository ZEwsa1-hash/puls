import { GymSession, calculateTonnage } from "@/store/useGymStore";
import { Workout } from "@/app/training-tracker/types";

export type GymPlanTemplate = "Upper body" | "Lower body";

export interface ScheduledGymDay {
  dayIndex: number;
  dayLabel: string;
  template: GymPlanTemplate;
}

export interface WeeklyCardioSummary {
  totalMinutes: number;
  zone2Minutes: number;
  hiitMinutes: number;
  hasHiit: boolean;
  remainingMinutes: number;
  targetMinutes: number;
  sessions: number;
}

export interface WeeklyGymSummary {
  sessions: number;
  tonnage: number;
  sets: number;
  nextPlan: ScheduledGymDay;
  todayPlan?: ScheduledGymDay;
  latestSession?: GymSession;
}

export type TodayActionKind = "gym" | "hiit" | "zone2" | "recovery";

export interface TodayRecommendation {
  kind: TodayActionKind;
  title: string;
  reason: string;
  actionLabel: string;
  href: string;
}

export interface WeeklyOsSummary {
  cardio: WeeklyCardioSummary;
  gym: WeeklyGymSummary;
  recommendation: TodayRecommendation;
  weekRangeLabel: string;
}

const WEEKLY_CARDIO_TARGET_MINUTES = 180;
const DAYS_MS = 24 * 60 * 60 * 1000;

export const gymWeekPlan: ScheduledGymDay[] = [
  { dayIndex: 3, dayLabel: "Ср", template: "Upper body" },
  { dayIndex: 4, dayLabel: "Чт", template: "Lower body" },
  { dayIndex: 6, dayLabel: "Сб", template: "Upper body" },
  { dayIndex: 0, dayLabel: "Вс", template: "Lower body" },
];

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function isDateInRange(dateValue: string | undefined, start: Date, end: Date): boolean {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;

  return date >= start && date <= end;
}

function formatRange(start: Date, end: Date): string {
  const formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function getNextGymPlan(today: Date): ScheduledGymDay {
  const currentDay = today.getDay();
  const sorted = [...gymWeekPlan].sort((a, b) => {
    const daysUntilA = (a.dayIndex - currentDay + 7) % 7;
    const daysUntilB = (b.dayIndex - currentDay + 7) % 7;
    return daysUntilA - daysUntilB;
  });

  return sorted[0];
}

function buildRecommendation(
  todayPlan: ScheduledGymDay | undefined,
  cardio: WeeklyCardioSummary
): TodayRecommendation {
  if (todayPlan) {
    return {
      kind: "gym",
      title: `${todayPlan.template} сегодня`,
      reason: "Сегодня стоит силовая по недельному расписанию. Сначала закрой зал, кардио добери после по самочувствию.",
      actionLabel: "Открыть Gym",
      href: "/gym",
    };
  }

  if (!cardio.hasHiit) {
    return {
      kind: "hiit",
      title: "Нужен HIIT",
      reason: `За неделю уже ${cardio.totalMinutes} мин кардио, но интервальная сессия еще не закрыта.`,
      actionLabel: "Записать HIIT",
      href: "/training-tracker",
    };
  }

  if (cardio.remainingMinutes > 0) {
    const nextMinutes = Math.min(60, Math.max(30, cardio.remainingMinutes));

    return {
      kind: "zone2",
      title: `Zone 2 на ${nextMinutes} мин`,
      reason: `До недельной базы осталось ${cardio.remainingMinutes} мин. Лучше закрыть спокойно, без лишней интенсивности.`,
      actionLabel: "Записать Zone 2",
      href: "/training-tracker",
    };
  }

  return {
    kind: "recovery",
    title: "Восстановление",
    reason: "Силовая по расписанию не стоит, недельная кардио-база и HIIT закрыты.",
    actionLabel: "Посмотреть карту",
    href: "/heatmap",
  };
}

export function buildWeeklyOsSummary(
  workouts: Map<string, Workout>,
  gymSessions: GymSession[],
  today = new Date()
): WeeklyOsSummary {
  const weekStart = startOfWeek(today);
  const weekEnd = new Date(weekStart.getTime() + 7 * DAYS_MS - 1);

  let totalMinutes = 0;
  let zone2Minutes = 0;
  let hiitMinutes = 0;
  let cardioSessions = 0;

  workouts.forEach((workout) => {
    if (!isDateInRange(workout.date, weekStart, weekEnd)) return;

    cardioSessions += 1;
    totalMinutes += workout.duration;

    if (workout.type === "zone2") {
      zone2Minutes += workout.duration;
    } else {
      hiitMinutes += workout.duration;
    }
  });

  const weekGymSessions = gymSessions.filter((session) =>
    isDateInRange(session.date, weekStart, weekEnd)
  );
  const sortedGymSessions = [...gymSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const todayPlan = gymWeekPlan.find((plan) => plan.dayIndex === today.getDay());

  const cardio: WeeklyCardioSummary = {
    totalMinutes,
    zone2Minutes,
    hiitMinutes,
    hasHiit: hiitMinutes > 0,
    remainingMinutes: Math.max(0, WEEKLY_CARDIO_TARGET_MINUTES - totalMinutes),
    targetMinutes: WEEKLY_CARDIO_TARGET_MINUTES,
    sessions: cardioSessions,
  };

  const gym: WeeklyGymSummary = {
    sessions: weekGymSessions.length,
    tonnage: weekGymSessions.reduce(
      (sum, session) => sum + calculateTonnage(session.exercises),
      0
    ),
    sets: weekGymSessions.reduce(
      (sum, session) =>
        sum +
        session.exercises.reduce(
          (exerciseSum, exercise) => exerciseSum + exercise.sets.length,
          0
        ),
      0
    ),
    nextPlan: getNextGymPlan(today),
    todayPlan,
    latestSession: sortedGymSessions[0],
  };

  return {
    cardio,
    gym,
    recommendation: buildRecommendation(todayPlan, cardio),
    weekRangeLabel: formatRange(weekStart, weekEnd),
  };
}
