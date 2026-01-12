
import { ReminderType } from './types';

export const REMINDER_OPTIONS: { label: string; value: ReminderType }[] = [
  { label: 'At due date', value: 'at_due_date' },
  { label: '1 hour before', value: '1_hour_before' },
  { label: '1 day before', value: '1_day_before' },
];

export const STORAGE_KEY = 'assignmate_data';
export const THEME_KEY = 'assignmate_theme';
