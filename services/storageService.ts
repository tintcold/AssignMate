
import { Assignment } from '../types';
import { STORAGE_KEY } from '../constants';

export const storageService = {
  saveAssignments: (assignments: Assignment[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  },
  
  loadAssignments: (): Assignment[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  setTheme: (isDark: boolean) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  getTheme: (): boolean => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};
