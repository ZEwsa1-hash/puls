import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SetRecord {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  oneRepMax?: number;
  percentage?: number;
}

export interface ExerciseRecord {
  id: string;
  name: string;
  photoUrl?: string;
  sets: SetRecord[];
}

export interface GymSession {
  id: string;
  date: string;
  title: string;
  exercises: ExerciseRecord[];
}

interface GymState {
  sessions: GymSession[];
  addSession: (session: GymSession) => void;
  updateSession: (id: string, updatedSession: GymSession) => void;
  deleteSession: (id: string) => void;
}

const DEMO_SESSION_IDS = new Set(['mock-1', 'mock-2']);

const removeDemoSessions = (sessions: GymSession[]): GymSession[] =>
  sessions.filter((session) => !DEMO_SESSION_IDS.has(session.id));

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      sessions: [],

      addSession: (session) => set((state) => ({
        sessions: [session, ...state.sessions],
      })),

      updateSession: (id, updatedSession) => set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id ? updatedSession : session
        ),
      })),

      deleteSession: (id) => set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
      })),
    }),
    {
      name: 'puls-gym-storage',
      version: 1,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState;
        }

        const state = persistedState as Partial<GymState>;

        if (!Array.isArray(state.sessions)) {
          return persistedState;
        }

        return {
          ...state,
          sessions: removeDemoSessions(state.sessions),
        };
      },
    }
  )
);

export const calculateTonnage = (exercises: ExerciseRecord[]) => {
  let sum = 0;
  exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      sum += set.weight * set.reps;
    });
  });
  return sum;
};

// Epley formula for 1RM estimation.
export const calculateOneRepMax = (weight: number, reps: number): number => {
  if (reps === 0 || weight === 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

export const calculatePercentage = (weight: number, oneRepMax: number): number => {
  if (oneRepMax === 0) return 0;
  return Math.round((weight / oneRepMax) * 100);
};
