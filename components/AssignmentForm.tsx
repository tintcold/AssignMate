
import React, { useState, useEffect } from 'react';
import { Assignment, ReminderType } from '../types';
import { REMINDER_OPTIONS } from '../constants';
import { X, Calendar, Book, Type, StickyNote, Bell } from 'lucide-react';

interface Props {
  initialData?: Assignment | null;
  onSave: (data: Omit<Assignment, 'id' | 'isCompleted' | 'lastNotified'>) => void;
  onCancel: () => void;
}

const AssignmentForm: React.FC<Props> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? initialData.dueDate.slice(0, 16) : '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [reminders, setReminders] = useState<ReminderType[]>(initialData?.reminders || ['at_due_date']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) return;
    
    onSave({
      title,
      subject,
      dueDate: new Date(dueDate).toISOString(),
      notes,
      reminders
    });
  };

  const toggleReminder = (type: ReminderType) => {
    setReminders(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {initialData ? 'Edit Assignment' : 'New Assignment'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto pb-12 sm:pb-6">
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              <Type className="w-3 h-3" /> Assignment Name
            </label>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-100"
              placeholder="e.g. Final Essay"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              <Book className="w-3 h-3" /> Subject / Class
            </label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-100"
              placeholder="e.g. Literature 101"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              <Calendar className="w-3 h-3" /> Due Date & Time
            </label>
            <input
              required
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-100"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              <Bell className="w-3 h-3" /> Reminders
            </label>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleReminder(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    reminders.includes(opt.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              <StickyNote className="w-3 h-3" /> Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-gray-100 resize-none"
              placeholder="Add any extra details..."
            />
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95"
            >
              {initialData ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
