// Storage service for localStorage abstraction with error handling

import { StoredData } from '../types';

const STORAGE_KEY = 'training-tracker-v1';

export interface StorageService {
  save(data: StoredData): boolean;
  load(): StoredData | null;
  clear(): void;
}

export const storageService: StorageService = {
  save(data: StoredData): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
      } else {
        console.error('Failed to save to localStorage:', error);
      }
      return false;
    }
  },

  load(): StoredData | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;
      return JSON.parse(serialized);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
