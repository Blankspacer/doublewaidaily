import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Flame,
  Sun,
  Sunset,
  Moon,
  Loader2,
  Tag,
} from 'lucide-react';
import { PlannerTask, Reminder, Language } from '../types';
import { t } from '../utils/translations';

interface DailyPlannerViewProps {
  tasks: PlannerTask[];
  reminders: Reminder[];
  language: Language;
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<PlannerTask, 'id' | 'completed'>) => void;
  onSetTasks: (tasks: PlannerTask[]) => void;
}

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  tasks,
  reminders,
  language,
  onToggleTask,
  onAddTask,
  onSetTasks,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [aiHeadline, setAiHeadline] = useState<string | null>(null);
  const [aiQuote, setAiQuote] = useState<string | null>(null);
  const [aiPriorities, setAiPriorities] = useState<string[]>([]);

  // Focus Timer / Pomodoro state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');

  // Add task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [newBlock, setNewBlock] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newTag, setNewTag] = useState('Focus');

  // Timer interval effect
  React.useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
      if (timerMode === 'work') {
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        setTimerMode('work');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/daily-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks,
          reminders,
          date: new Date().toISOString().split('T')[0],
          language,
        }),
      });

      const data = await response.json();
      if (data && data.plan) {
        setAiHeadline(data.plan.headline);
        setAiQuote(data.plan.quote);
        setAiPriorities(data.plan.topPriorities || []);

        const newGeneratedTasks: PlannerTask[] = [];

        if (data.plan.morning) {
          data.plan.morning.forEach((item: any, idx: number) => {
            newGeneratedTasks.push({
              id: `gen-m-${idx}-${Date.now()}`,
              time: item.time,
              task: item.task,
              tag: item.tag || 'Morning',
              timeBlock: 'morning',
              completed: false,
              priority: 'medium',
            });
          });
        }

        if (data.plan.afternoon) {
          data.plan.afternoon.forEach((item: any, idx: number) => {
            newGeneratedTasks.push({
              id: `gen-a-${idx}-${Date.now()}`,
              time: item.time,
              task: item.task,
              tag: item.tag || 'Afternoon',
              timeBlock: 'afternoon',
              completed: false,
              priority: 'high',
            });
          });
        }

        if (data.plan.evening) {
          data.plan.evening.forEach((item: any, idx: number) => {
            newGeneratedTasks.push({
              id: `gen-e-${idx}-${Date.now()}`,
              time: item.time,
              task: item.task,
              tag: item.tag || 'Evening',
              timeBlock: 'evening',
              completed: false,
              priority: 'low',
            });
          });
        }

        if (newGeneratedTasks.length > 0) {
          onSetTasks(newGeneratedTasks);
        }
      }
    } catch (err) {
      console.warn('Failed to generate daily planner:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      time: newTime,
      task: newTaskTitle.trim(),
      tag: newTag,
      timeBlock: newBlock,
      priority: 'medium',
    });

    setNewTaskTitle('');
    setShowAddModal(false);
  };

  const morningTasks = tasks.filter((t) => t.timeBlock === 'morning');
  const afternoonTasks = tasks.filter((t) => t.timeBlock === 'afternoon');
  const eveningTasks = tasks.filter((t) => t.timeBlock === 'evening');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-500" />
            {t('planner', language)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'AI আপনার আজকের কাজ, রিমাইন্ডার ও অগ্রাধিকারের ভিত্তিতে আদর্শ দিনলিপি সাজায়'
              : 'Automatically synchronize reminders, deadlines, and daily habits into a balanced schedule'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateAIPlan}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Day Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t('generateAIPlan', language)}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold shadow-sm"
            title="Add specific task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Banner: Motivational Quote & Pomodoro Focus Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quote & AI Top Priorities */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-5 rounded-3xl border border-indigo-800/40 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{aiHeadline || 'Today’s Productivity Blueprint'}</span>
            </div>
            <p className="text-base md:text-lg font-bold text-white italic">
              "{aiQuote || (language === 'bn' ? 'সুশৃঙ্খল দিন মানেই সফলতার পথে এক ধাপ এগিয়ে থাকা।' : 'Small daily disciplines repeated consistently lead to great achievements.')}"
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-800/50">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5">
              Top 3 Priorities for Today:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {(aiPriorities.length > 0
                ? aiPriorities
                : [
                    language === 'bn' ? 'জরুরি ইন্টারনেট বিল ও বকেয়া মেটানো' : 'Clear pending bills & reminders',
                    language === 'bn' ? 'সাপ্তাহিক বাজারের ফর্দ সম্পন্ন করা' : 'Pick up weekly groceries & fresh goods',
                    language === 'bn' ? 'কাজের শেষে দিনের খরচ নিরীক্ষা' : 'Review daily spending & budget',
                  ]
              ).map((p, i) => (
                <div
                  key={i}
                  className="bg-indigo-900/60 border border-indigo-700/50 text-indigo-100 px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pomodoro Focus Timer */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>{timerMode === 'work' ? 'Deep Focus Session' : 'Quick Recharge Break'}</span>
          </div>

          <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white my-1 font-mono">
            {formatTimer(timerSeconds)}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
              }}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3 Structured Time Blocks: Morning, Afternoon, Evening */}
      <div className="space-y-5">
        {/* Morning Block */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Morning Block (08:00 AM - 12:00 PM)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{morningTasks.length} tasks</span>
          </div>

          <div className="space-y-2">
            {morningTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/50 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.task}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{task.time}</span>
                      {task.tag && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                          {task.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Afternoon Block */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sunset className="w-5 h-5 text-orange-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Afternoon Block (12:00 PM - 05:00 PM)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{afternoonTasks.length} tasks</span>
          </div>

          <div className="space-y-2">
            {afternoonTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/50 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.task}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{task.time}</span>
                      {task.tag && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                          {task.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evening Block */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Evening Block (05:00 PM - 10:00 PM)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{eveningTasks.length} tasks</span>
          </div>

          <div className="space-y-2">
            {eveningTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800/50 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className="text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <span
                      className={`text-sm font-semibold ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {task.task}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{task.time}</span>
                      {task.tag && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                          {task.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Add Schedule Item
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Deep Work, Review bKash statements"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time Block
                  </label>
                  <select
                    value={newBlock}
                    onChange={(e) => setNewBlock(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="morning">Morning (08-12)</option>
                    <option value="afternoon">Afternoon (12-17)</option>
                    <option value="evening">Evening (17-22)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tag / Context
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Work, Wellness, Errand"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
