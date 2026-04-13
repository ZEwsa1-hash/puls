import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WikiNote {
  id: string;
  title: string;
  content: string;
  links: string[]; // IDs of other connected notes
  dateCreated: string;
  deepworkMinutes: number; // How many minutes spent on this note/topic that day
}

interface WikiState {
  notes: WikiNote[];
  addNote: (note: WikiNote) => void;
  updateNote: (id: string, updatedNote: WikiNote) => void;
  deleteNote: (id: string) => void;
  addLinks: (sourceId: string, targetIds: string[]) => void;
}

const MOCK_NOTES: WikiNote[] = [
  {
    id: 'wiki-1',
    title: 'React Performance',
    content: 'Optimization techniques like useMemo, useCallback, and dynamic imports.',
    links: ['wiki-2'],
    dateCreated: '2026-04-12',
    deepworkMinutes: 45,
  },
  {
    id: 'wiki-2',
    title: 'Next.js 16',
    content: 'Turbopack is extremely fast. App router mental models.',
    links: ['wiki-1', 'wiki-3'],
    dateCreated: '2026-04-13',
    deepworkMinutes: 60,
  },
  {
    id: 'wiki-3',
    title: 'System Design',
    content: 'Scaling horizontally vs vertically. Microservices architecture.',
    links: ['wiki-2'],
    dateCreated: '2026-04-13',
    deepworkMinutes: 90,
  }
];

export const useWikiStore = create<WikiState>()(
  persist(
    (set) => ({
      notes: MOCK_NOTES,
      
      addNote: (note) => set((state) => ({ 
         notes: [note, ...state.notes] 
      })),
      
      updateNote: (id, updatedNote) => set((state) => ({
         notes: state.notes.map(n => n.id === id ? updatedNote : n)
      })),

      deleteNote: (id) => set((state) => ({
         notes: state.notes.filter(n => n.id !== id)
      })),

      addLinks: (sourceId, targetIds) => set((state) => {
         const newNotes = state.notes.map(n => {
            if (n.id === sourceId) {
               const newLinks = Array.from(new Set([...n.links, ...targetIds]));
               return { ...n, links: newLinks };
            }
            return n;
         });
         return { notes: newNotes };
      }),
    }),
    {
      name: 'puls-wiki-storage',
    }
  )
);
