
export type ReminderType = 'at_due_date' | '1_hour_before' | '1_day_before' | 'none';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO string
  notes?: string;
  isCompleted: boolean;
  reminders: ReminderType[];
  // Fix: Use Partial<Record<...>> to allow empty or incomplete notification tracking.
  lastNotified?: Partial<Record<ReminderType, boolean>>;
}

export type UrgencyLevel = 'overdue' | 'soon' | 'upcoming';

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}
