
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Moon, Sun, Bell, BellOff, HelpCircle, CheckCircle2, ListFilter } from 'lucide-react';
import { Assignment, ReminderType } from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import AssignmentCard from './components/AssignmentCard';
import AssignmentForm from './components/AssignmentForm';

const App: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showHelp, setShowHelp] = useState(false);
  const [filter, setFilter] = useState<'active' | 'completed' | 'all'>('active');

  // Load initial data
  useEffect(() => {
    const loaded = storageService.loadAssignments();
    setAssignments(loaded);
    
    const initialTheme = storageService.getTheme();
    setIsDarkMode(initialTheme);
    storageService.setTheme(initialTheme);
    
    setNotificationPermission(notificationService.checkPermission());
  }, []);

  // Save to storage on change
  useEffect(() => {
    storageService.saveAssignments(assignments);
  }, [assignments]);

  // Notification Logic Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setAssignments(prev => {
        let changed = false;
        const next = prev.map(task => {
          if (task.isCompleted) return task;

          const dueDate = new Date(task.dueDate);
          // Fix: Simplified initialization because lastNotified is now Partial<Record<ReminderType, boolean>>.
          const taskUpdated = { ...task, lastNotified: { ...task.lastNotified } };
          
          // Check "At due date"
          if (task.reminders.includes('at_due_date') && !taskUpdated.lastNotified['at_due_date']) {
            if (now >= dueDate) {
              notificationService.send('Assignment Due Now!', `${task.title} is due for ${task.subject}.`);
              taskUpdated.lastNotified['at_due_date'] = true;
              changed = true;
            }
          }

          // Check "1 hour before"
          if (task.reminders.includes('1_hour_before') && !taskUpdated.lastNotified['1_hour_before']) {
            const hourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000);
            if (now >= hourBefore && now < dueDate) {
              notificationService.send('Reminder: 1 Hour Left', `${task.title} for ${task.subject} is due soon.`);
              taskUpdated.lastNotified['1_hour_before'] = true;
              changed = true;
            }
          }

          // Check "1 day before"
          if (task.reminders.includes('1_day_before') && !taskUpdated.lastNotified['1_day_before']) {
            const dayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
            if (now >= dayBefore && now < dueDate) {
              notificationService.send('Upcoming Deadline', `${task.title} for ${task.subject} is due tomorrow.`);
              taskUpdated.lastNotified['1_day_before'] = true;
              changed = true;
            }
          }

          return taskUpdated;
        });

        return changed ? next : prev;
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, [assignments]);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    storageService.setTheme(next);
  };

  const requestNotifications = async () => {
    const result = await notificationService.requestPermission();
    setNotificationPermission(result);
  };

  const handleAddOrUpdate = (data: Omit<Assignment, 'id' | 'isCompleted' | 'lastNotified'>) => {
    if (editingAssignment) {
      // Fix: lastNotified is now Partial, so {} is a valid value for resetting notifications.
      setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? { ...a, ...data, lastNotified: {} } : a));
    } else {
      const newAssignment: Assignment = {
        ...data,
        id: crypto.randomUUID(),
        isCompleted: false,
        // Fix: lastNotified initialized as an empty Partial record.
        lastNotified: {}
      };
      setAssignments(prev => [newAssignment, ...prev]);
    }
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  const handleToggleComplete = (id: string) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, isCompleted: !a.isCompleted } : a));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const filteredAndSorted = useMemo(() => {
    return assignments
      .filter(a => {
        if (filter === 'active') return !a.isCompleted;
        if (filter === 'completed') return a.isCompleted;
        return true;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments, filter]);

  const stats = useMemo(() => {
    const now = new Date();
    const active = assignments.filter(a => !a.isCompleted);
    const overdue = active.filter(a => new Date(a.dueDate) < now);
    const soon = active.filter(a => {
      const diff = new Date(a.dueDate).getTime() - now.getTime();
      return diff > 0 && diff <= 24 * 60 * 60 * 1000;
    });
    return { 
      total: assignments.length, 
      active: active.length, 
      overdue: overdue.length,
      soon: soon.length,
      completed: assignments.length - active.length
    };
  }, [assignments]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">AssignMate</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHelp(true)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Permission Alert */}
        {notificationPermission !== 'granted' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Enable Notifications</p>
                <p className="text-xs text-blue-700 dark:text-blue-400">Get alerts for upcoming deadlines.</p>
              </div>
            </div>
            <button 
              onClick={requestNotifications}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
            >
              Allow
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Active</p>
            <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{stats.active}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-red-400 tracking-wider">Overdue</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400">{stats.overdue}</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Due Soon</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-500">{stats.soon}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm">
            <p className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Done</p>
            <p className="text-2xl font-black text-green-600 dark:text-green-500">{stats.completed}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl max-w-fit">
          <button 
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'active' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'completed' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            All
          </button>
        </div>

        {/* Assignment List */}
        <div className="space-y-4">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map(item => (
              <AssignmentCard 
                key={item.id}
                assignment={item}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Plus className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Nothing here yet</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-[250px] mx-auto mt-2">
                Click the "+" button to add your first assignment and stay on track!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FAB - Sticky Add Button */}
      <button 
        onClick={() => {
          setEditingAssignment(null);
          setIsFormOpen(true);
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-transform hover:scale-110 active:scale-95 z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Form Modal */}
      {isFormOpen && (
        <AssignmentForm 
          initialData={editingAssignment}
          onSave={handleAddOrUpdate}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingAssignment(null);
          }}
        />
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">How it works</h2>
              <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                  <p className="text-sm">Add assignments with due dates and custom reminders.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                  <p className="text-sm">Colors tell you the urgency: <span className="text-red-500 font-bold">Red</span> (Overdue), <span className="text-amber-500 font-bold">Yellow</span> (Due in 24h), <span className="text-green-500 font-bold">Green</span> (Upcoming).</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                  <p className="text-sm">Keep the app open or pinned in your browser to ensure notification timers run smoothly.</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Blocked Notifications?</p>
                </li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs space-y-2">
                <p>• <strong>Chrome/Edge:</strong> Click the lock icon in the address bar → Reset permissions.</p>
                <p>• <strong>Safari:</strong> Preferences → Websites → Notifications → Allow.</p>
                <p>• <strong>Mobile:</strong> Ensure browser notifications are allowed in system settings.</p>
              </div>
              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-6 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold py-3 rounded-xl hover:opacity-90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Global Styles for Animations */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
