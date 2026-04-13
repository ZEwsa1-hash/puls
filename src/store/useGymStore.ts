import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SetRecord {
  id: string;
  weight: number;
  reps: number;
  rpe?: number;
  oneRepMax?: number; // Estimated 1RM
  percentage?: number; // % of 1RM
}

export interface ExerciseRecord {
  id: string;
  name: string;
  photoUrl?: string;
  sets: SetRecord[];
}

export interface GymSession {
  id: string;
  date: string; // ISO Date e.g. "2026-04-13"
  title: string;
  exercises: ExerciseRecord[];
}

interface GymState {
  sessions: GymSession[];
  addSession: (session: GymSession) => void;
  updateSession: (id: string, updatedSession: GymSession) => void;
  deleteSession: (id: string) => void;
}

// Mock initial data to populate the detailed views
const MOCK_SESSIONS: GymSession[] = [
  {
    id: 'mock-1',
    date: '2026-04-10',
    title: 'День ног (Тяжелый)',
    exercises: [
      {
        id: 'ex-1',
        name: 'Приседания со штангой',
        photoUrl: 'https://images.unsplash.com/photo-1541534741639-66cffeddc908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        sets: [
          { id: 's1', weight: 100, reps: 8, rpe: 7 },
          { id: 's2', weight: 105, reps: 6, rpe: 8 },
          { id: 's3', weight: 110, reps: 5, rpe: 9 },
        ]
      },
      {
        id: 'ex-2',
        name: 'Жим ногами',
        sets: [
          { id: 's4', weight: 200, reps: 12, rpe: 8 },
          { id: 's5', weight: 220, reps: 10, rpe: 9 },
        ]
      }
    ]
  },
  {
    id: 'mock-2',
    date: '2026-04-12',
    title: 'Грудь и Трицепс',
    exercises: [
      {
        id: 'ex-3',
        name: 'Жим лежа',
        sets: [
          { id: 's6', weight: 80, reps: 10, rpe: 7 },
          { id: 's7', weight: 85, reps: 8, rpe: 8 },
          { id: 's8', weight: 90, reps: 5, rpe: 9.5 },
        ]
      }
    ]
  }
];

export const useGymStore = create<GymState>()(
  persist(
    (set) => ({
      sessions: MOCK_SESSIONS,
      
      addSession: (session) => set((state) => ({ 
         sessions: [session, ...state.sessions] 
      })),
      
      updateSession: (id, updatedSession) => set((state) => ({
         sessions: state.sessions.map(s => s.id === id ? updatedSession : s)
      })),

      deleteSession: (id) => set((state) => ({
         sessions: state.sessions.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'puls-gym-storage',
    }
  )
);

export const calculateTonnage = (exercises: ExerciseRecord[]) => {
   let sum = 0;
   exercises.forEach(ex => {
      ex.sets.forEach(s => {
         sum += (s.weight * s.reps);
      });
   });
   return sum;
};

// Epley formula for 1RM estimation: 1RM = weight * (1 + reps/30)
export const calculateOneRepMax = (weight: number, reps: number): number => {
   if (reps === 0 || weight === 0) return 0;
   if (reps === 1) return weight;
   return Math.round(weight * (1 + reps / 30));
};

// Calculate % of 1RM
export const calculatePercentage = (weight: number, oneRepMax: number): number => {
   if (oneRepMax === 0) return 0;
   return Math.round((weight / oneRepMax) * 100);
};
