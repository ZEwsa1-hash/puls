import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WorkoutType = 'empty' | 'z1' | 'z2' | 'z3' | 'z4' | 'z5_mpk' | 'hiit';

export interface DayRecord {
  id: string;
  label: string;
  state: WorkoutType;
  minutes: number;
  avgHeartRate?: number;
  isToday?: boolean;
}

export interface WeekRecord {
  id: string;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  dates: string;
  targetMin: number;
  targetMax: number;
  days: DayRecord[];
  isTodayParent?: boolean;
}

interface PulsState {
  weeks: WeekRecord[];
  targetZ2: number;
  updateDay: (
    weekId: string,
    dayId: string,
    type: WorkoutType,
    minutes: number,
    avgHeartRate?: number
  ) => void;
  resetData: () => void;
}

const DEFAULT_DAYS_LABELS = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];

const createEmptyDay = (weekId: string, index: number): DayRecord => ({
  id: `${weekId}-d${index}`,
  label: DEFAULT_DAYS_LABELS[index],
  state: 'empty',
  minutes: 0,
});

const createEmptyDays = (weekId: string): DayRecord[] =>
  DEFAULT_DAYS_LABELS.map((_, index) => createEmptyDay(weekId, index));

const INITIAL_WEEKS: WeekRecord[] = [
  {
    id: 'w1',
    title: 'Week 1',
    dates: 'Feb 18-Feb 24',
    targetMin: 180,
    targetMax: 210,
    days: createEmptyDays('w1'),
    isTodayParent: true,
  },
  {
    id: 'w2',
    title: 'Week 2',
    dates: 'Feb 25-Mar 3',
    targetMin: 200,
    targetMax: 230,
    days: createEmptyDays('w2'),
  },
  {
    id: 'w3',
    title: 'Week 3',
    dates: 'Mar 4-Mar 10',
    targetMin: 220,
    targetMax: 260,
    days: createEmptyDays('w3'),
  },
  {
    id: 'w4',
    title: 'Week 4',
    subtitle: 'DELOAD',
    subtitleColor: '#fb923c',
    dates: 'Mar 11-Mar 17',
    targetMin: 160,
    targetMax: 200,
    days: createEmptyDays('w4'),
  },
  {
    id: 'w5',
    title: 'Week 5',
    dates: 'Mar 18-Mar 24',
    targetMin: 230,
    targetMax: 270,
    days: createEmptyDays('w5'),
  },
  {
    id: 'w6',
    title: 'Week 6',
    dates: 'Mar 25-Mar 31',
    targetMin: 250,
    targetMax: 300,
    days: createEmptyDays('w6'),
  },
  {
    id: 'w7',
    title: 'Week 7',
    dates: 'Apr 1-Apr 7',
    targetMin: 240,
    targetMax: 290,
    days: createEmptyDays('w7'),
  },
  {
    id: 'w8',
    title: 'Week 8',
    subtitle: 'TAPER',
    subtitleColor: '#c084fc',
    dates: 'Apr 8-Apr 14',
    targetMin: 150,
    targetMax: 190,
    days: createEmptyDays('w8'),
  },
];

function removeKnownDemoCardio(weeks: WeekRecord[]): WeekRecord[] {
  return weeks.map((week) => ({
    ...week,
    days: week.days.map((day) => {
      if (
        day.id === 'w1-d0' &&
        day.state === 'z2' &&
        day.minutes === 37 &&
        day.label === '37m'
      ) {
        return createEmptyDay('w1', 0);
      }

      if (
        day.id === 'w1-d1' &&
        day.state === 'z2' &&
        day.minutes === 45 &&
        day.label === '45m'
      ) {
        return createEmptyDay('w1', 1);
      }

      return day;
    }),
  }));
}

export const usePulsStore = create<PulsState>()(
  persist(
    (set) => ({
      weeks: INITIAL_WEEKS,
      targetZ2: 1630,

      updateDay: (weekId, dayId, type, minutes, avgHeartRate) => {
        set((state) => {
          const newWeeks = state.weeks.map((week) => {
            if (week.id !== weekId) return week;

            const newDays = week.days.map((day) => {
              if (day.id !== dayId) return day;

              const dayIndex = Number(day.id.split('-d')[1]);

              return {
                ...day,
                state: type,
                minutes: type === 'empty' ? 0 : minutes,
                avgHeartRate: type === 'empty' ? undefined : avgHeartRate,
                label: type === 'empty' ? DEFAULT_DAYS_LABELS[dayIndex] : `${minutes}m`,
              };
            });

            return { ...week, days: newDays };
          });

          return { weeks: newWeeks };
        });
      },

      resetData: () => set({ weeks: INITIAL_WEEKS }),
    }),
    {
      name: 'puls-training-storage',
      version: 1,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }

        const state = persistedState as Partial<PulsState>;

        if (!Array.isArray(state.weeks)) {
          return persistedState;
        }

        return {
          ...state,
          weeks: removeKnownDemoCardio(state.weeks),
        };
      },
    }
  )
);
