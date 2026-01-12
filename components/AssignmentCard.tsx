
import React from 'react';
import { Assignment, UrgencyLevel } from '../types';
import { Calendar, Clock, CheckCircle, Circle, Trash2, Edit2, AlertCircle } from 'lucide-react';

interface Props {
  assignment: Assignment;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (assignment: Assignment) => void;
}

const AssignmentCard: React.FC<Props> = ({ assignment, onToggleComplete, onDelete, onEdit }) => {
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  
  const diffInHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  let urgency: UrgencyLevel = 'upcoming';
  if (dueDate < now && !assignment.isCompleted) urgency = 'overdue';
  else if (diffInHours <= 24 && diffInHours > 0 && !assignment.isCompleted) urgency = 'soon';

  const urgencyStyles = {
    overdue: 'border-red-500 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400',
    soon: 'border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400',
    upcoming: 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400',
  };

  const statusColor = assignment.isCompleted ? 'border-gray-300 dark:border-gray-700 opacity-60' : urgencyStyles[urgency];

  return (
    <div className={`relative flex flex-col p-4 mb-4 border-l-4 rounded-r-xl bg-white dark:bg-gray-800 shadow-sm transition-all ${statusColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className={`font-bold text-lg leading-tight truncate ${assignment.isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
            {assignment.title}
          </h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{assignment.subject}</p>
        </div>
        <button 
          onClick={() => onToggleComplete(assignment.id)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {assignment.isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400" />
          )}
        </button>
      </div>

      {assignment.notes && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
          {assignment.notes}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>{dueDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {urgency === 'overdue' && !assignment.isCompleted && (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="uppercase">Overdue</span>
          </div>
        )}
        {urgency === 'soon' && !assignment.isCompleted && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="uppercase">Due Soon</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
        <button 
          onClick={() => onEdit(assignment)}
          className="p-2 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(assignment.id)}
          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AssignmentCard;
