import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wallet,
  ShoppingCart,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Reminder, Expense, ShoppingItem, DocumentItem, PlannerTask, Language, Currency, FamilyMember } from '../types';
import { t } from '../utils/translations';

interface DashboardOverviewProps {
  reminders: Reminder[];
  expenses: Expense[];
  shoppingItems: ShoppingItem[];
  documents: DocumentItem[];
  plannerTasks: PlannerTask[];
  familyMembers: FamilyMember[];
  language: Language;
  currency: Currency;
  monthlyBudget: number;
  onNavigateTab: (tab: string) => void;
  onToggleReminder: (id: string) => void;
  onToggleShoppingItem: (id: string) => void;
  onOpenAddModal: (type: 'reminder' | 'expense' | 'shopping' | 'document') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  reminders,
  expenses,
  shoppingItems,
  documents,
  plannerTasks,
  language,
  currency,
  monthlyBudget,
  onNavigateTab,
  onToggleReminder,
  onToggleShoppingItem,
  onOpenAddModal,
}) => {
  const [financialInsight, setFinancialInsight] = useState<{
    status: string;
    summary: string;
    tips: string[];
    projectedSavings?: string;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Calculate metrics
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const budgetPercent = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);

  const pendingReminders = reminders.filter((r) => !r.completed);
  const todayStr = new Date().toISOString().split('T')[0];
  const urgentReminders = pendingReminders.filter((r) => r.dueDate <= todayStr || r.priority === 'high');

  const pendingShopping = shoppingItems.filter((s) => !s.isBought);
  const shoppingEstimatedTotal = pendingShopping.reduce((sum, i) => sum + (i.estimatedPrice || 0), 0);

  // Fetch AI Financial Insights on load or expense change
  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setLoadingInsights(true);
      try {
        const res = await fetch('/api/financial-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            expenses: expenses.slice(0, 20),
            budget: monthlyBudget,
            currency,
            language,
          }),
        });
        const data = await res.json();
        if (isMounted && data.insights) {
          setFinancialInsight(data.insights);
        }
      } catch (err) {
        console.warn('Failed to load insights:', err);
      } finally {
        if (isMounted) setLoadingInsights(false);
      }
    };

    fetchInsights();
    return () => {
      isMounted = false;
    };
  }, [expenses.length, monthlyBudget, currency, language]);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Expenses / Budget Card */}
        <div
          onClick={() => onNavigateTab('expenses')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('monthlyBudget', language)}
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {currency}{totalSpent.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1.5">
              / {currency}{monthlyBudget.toLocaleString()}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>{budgetPercent}% used</span>
              <span>{currency}{remainingBudget.toLocaleString()} left</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercent > 90
                    ? 'bg-rose-500'
                    : budgetPercent > 70
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reminders Card */}
        <div
          onClick={() => onNavigateTab('reminders')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('upcomingBills', language)}
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-2">
            {pendingReminders.length}
            {urgentReminders.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                {urgentReminders.length} {t('urgent', language)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {language === 'bn'
              ? 'ইন্টারনেট, বিদ্যুৎ বিল ও ডাক্তারের পরামর্শ'
              : 'Bills, doctor appointments, birthdays'}
          </p>
        </div>

        {/* Shopping Items Card */}
        <div
          onClick={() => onNavigateTab('shopping')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('shopping', language)}
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {pendingShopping.length} items
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Est. cost ~ {currency}{shoppingEstimatedTotal.toLocaleString()}
          </p>
        </div>

        {/* Document Vault Card */}
        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t('documents', language)}
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {documents.length} Records
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {language === 'bn' ? 'ওয়ারেন্টি ও চুক্তি সংরক্ষিত' : 'Warranties & leases secure'}
          </p>
        </div>
      </div>

      {/* AI Proactive Financial & Daily Insights Card */}
      {financialInsight && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                  DayMate AI Advisor Insight
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Status: {financialInsight.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">{financialInsight.summary}</p>
              </div>
            </div>

            {financialInsight.projectedSavings && (
              <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 self-start md:self-auto shadow-sm">
                Potential Savings: {financialInsight.projectedSavings}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {financialInsight.tips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-start gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Layout: Urgent Reminders + Today's Shopping & Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Immediate Action Reminders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {t('upcomingBills', language)}
              </h3>
            </div>
            <button
              onClick={() => onOpenAddModal('reminder')}
              className="text-xs font-semibold flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('addReminder', language)}
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingReminders.slice(0, 4).map((reminder) => {
              const isUrgent = reminder.dueDate <= todayStr || reminder.priority === 'high';
              return (
                <div
                  key={reminder.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(reminder.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      <div className="w-4 h-4 rounded border border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                        {reminder.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">
                          {reminder.category}
                        </span>
                        <span>Due: {reminder.dueDate}</span>
                        {reminder.dueTime && <span>• {reminder.dueTime}</span>}
                      </div>
                    </div>
                  </div>

                  {isUrgent && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 shrink-0">
                      Urgent
                    </span>
                  )}
                </div>
              );
            })}

            {pendingReminders.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                All reminders completed! Relax and enjoy your day.
              </p>
            )}
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigateTab('reminders')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"
            >
              View all reminders <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Today's Shopping & Fast Actions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {language === 'bn' ? 'জরুরি বাজার ফর্দ' : 'Active Grocery & Shopping List'}
              </h3>
            </div>
            <button
              onClick={() => onOpenAddModal('shopping')}
              className="text-xs font-semibold flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('addItem', language)}
            </button>
          </div>

          <div className="space-y-2">
            {pendingShopping.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleShoppingItem(item.id)}
                    className="text-slate-400 hover:text-emerald-500"
                  >
                    <div className="w-4 h-4 rounded border border-slate-400 dark:border-slate-600 hover:border-emerald-500" />
                  </button>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item.name}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {item.quantity} {item.unit || ''}
                  </span>
                  {item.estimatedPrice && (
                    <div className="text-[11px] text-slate-400">
                      ~{currency}{item.estimatedPrice}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {pendingShopping.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Shopping list is empty. Add grocery items via voice above.
              </p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onOpenAddModal('expense')}
              className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('addExpense', language)}
            </button>

            <button
              onClick={() => onNavigateTab('planner')}
              className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              {t('generateAIPlan', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
