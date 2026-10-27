import React, { useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  Volume2,
  Trash2,
  RotateCcw,
  Sparkles,
  Search,
} from 'lucide-react';
import { Reminder, ReminderCategory, Language, FamilyMember } from '../types';
import { t } from '../utils/translations';

interface RemindersViewProps {
  reminders: Reminder[];
  familyMembers: FamilyMember[];
  language: Language;
  onToggleReminder: (id: string) => void;
  onSnoozeReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'completed'>) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  familyMembers,
  language,
  onToggleReminder,
  onSnoozeReminder,
  onDeleteReminder,
  onAddReminder,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dueToday' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ReminderCategory>('bill');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDueTime, setNewDueTime] = useState('12:00');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newNotes, setNewNotes] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState(familyMembers[0]?.id || '');
  const [newRecurring, setNewRecurring] = useState<'none' | 'weekly' | 'monthly' | 'yearly'>('none');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReminders = reminders.filter((rem) => {
    // Category match
    if (filterCategory !== 'all' && rem.category !== filterCategory) return false;

    // Status match
    if (filterStatus === 'pending' && rem.completed) return false;
    if (filterStatus === 'completed' && !rem.completed) return false;
    if (filterStatus === 'dueToday' && (rem.dueDate !== todayStr || rem.completed)) return false;
    if (filterStatus === 'overdue' && (rem.dueDate >= todayStr || rem.completed)) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rem.title.toLowerCase().includes(q) ||
        (rem.notes && rem.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      category: newCategory,
      dueDate: newDueDate,
      dueTime: newDueTime,
      priority: newPriority,
      notes: newNotes.trim() || undefined,
      assignedTo: newAssignedTo,
      recurring: newRecurring,
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const speakReminder = (rem: Reminder) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `${rem.title}. Due on ${rem.dueDate} at ${rem.dueTime || 'no time set'}. ${rem.notes || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const getCategoryIconColor = (cat: ReminderCategory) => {
    switch (cat) {
      case 'bill':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900';
      case 'appointment':
        return 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900';
      case 'birthday':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900';
      case 'household':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900';
      default:
        return 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-900';
    }
  };

  return (
    <div className="space-y-5">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-500" />
            {t('reminders', language)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'ইউটিলিটি বিল, ডাক্তারের অ্যাপয়েন্টমেন্ট, জন্মদিন ও পারিবারিক কাজ'
              : 'Keep track of recurring bills, appointments, deadlines, and chores'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('addReminder', language)}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 text-xs font-semibold">
          {[
            { id: 'all', label: t('filterAll', language) },
            { id: 'dueToday', label: t('dueToday', language) },
            { id: 'pending', label: t('pending', language) },
            { id: 'overdue', label: t('overdue', language) },
            { id: 'completed', label: t('completed', language) },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                filterStatus === pill.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Category & Search */}
        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bill">Bills & Utilities</option>
            <option value="appointment">Appointments</option>
            <option value="birthday">Birthdays & Events</option>
            <option value="household">Household & Chores</option>
            <option value="deadline">Deadlines</option>
            <option value="other">Other</option>
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredReminders.map((rem) => {
          const isOverdue = rem.dueDate < todayStr && !rem.completed;
          const isToday = rem.dueDate === todayStr && !rem.completed;
          const assignedUser = familyMembers.find((m) => m.id === rem.assignedTo);

          return (
            <div
              key={rem.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all hover:shadow-md flex flex-col justify-between gap-3 ${
                rem.completed
                  ? 'border-slate-200 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                  : isOverdue
                  ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/20 dark:bg-rose-950/10'
                  : isToday
                  ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/20 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleReminder(rem.id)}
                    className="mt-1 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {rem.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <h3
                      className={`font-bold text-sm md:text-base leading-snug ${
                        rem.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {rem.title}
                    </h3>

                    {rem.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {rem.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryIconColor(
                          rem.category
                        )}`}
                      >
                        {rem.category}
                      </span>

                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        {rem.dueDate}
                      </span>

                      {rem.dueTime && (
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {rem.dueTime}
                        </span>
                      )}

                      {assignedUser && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          👤 {assignedUser.name}
                        </span>
                      )}

                      {rem.recurring && rem.recurring !== 'none' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium">
                          🔄 {rem.recurring}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rem.priority === 'high'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        : rem.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {rem.priority}
                  </span>

                  {isOverdue && (
                    <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                      <AlertCircle className="w-3 h-3" /> Overdue
                    </span>
                  )}
                  {isToday && (
                    <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> Due Today
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speakReminder(rem)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Speak reminder"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  {!rem.completed && (
                    <button
                      type="button"
                      onClick={() => onSnoozeReminder(rem.id)}
                      className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      {t('snooze', language)}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteReminder(rem.id)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredReminders.length === 0 && (
          <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No reminders found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Add one via the button above, or speak a command in the AI bar.
            </p>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                {t('addReminder', language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title / Task *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Pay Internet bill, Doctor checkup"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ReminderCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="bill">Bill & Utility</option>
                    <option value="appointment">Appointment</option>
                    <option value="birthday">Birthday / Event</option>
                    <option value="household">Household Task</option>
                    <option value="deadline">Deadline</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Repeat / Recurring
                  </label>
                  <select
                    value={newRecurring}
                    onChange={(e) => setNewRecurring(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="none">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Member
                  </label>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bill amount ৳1,200 via bKash, brings medical card"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-white shadow-md shadow-indigo-600/20"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
