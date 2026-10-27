import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  TrendingDown,
  TrendingUp,
  PieChart,
  Tag,
  Calendar,
  CreditCard,
  Trash2,
  DollarSign,
  Download,
  Filter,
} from 'lucide-react';
import { Expense, ExpenseCategory, Currency, Language, FamilyMember } from '../types';
import { t } from '../utils/translations';

interface ExpenseTrackerViewProps {
  expenses: Expense[];
  monthlyBudget: number;
  currency: Currency;
  language: Language;
  familyMembers: FamilyMember[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateBudget: (budget: number) => void;
  onChangeCurrency: (currency: Currency) => void;
}

export const ExpenseTrackerView: React.FC<ExpenseTrackerViewProps> = ({
  expenses,
  monthlyBudget,
  currency,
  language,
  familyMembers,
  onAddExpense,
  onDeleteExpense,
  onUpdateBudget,
  onChangeCurrency,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Groceries');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Cash' | 'Card' | 'Bank'>('bKash');
  const [assignedTo, setAssignedTo] = useState(familyMembers[0]?.id || '');
  const [editBudgetInput, setEditBudgetInput] = useState(monthlyBudget.toString());

  // Metrics
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  const percentUsed = Math.min(100, Math.round((totalSpent / (monthlyBudget || 1)) * 100));

  // Category Aggregates
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;
    return true;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    onAddExpense({
      amount: val,
      currency,
      category,
      note: note.trim() || category,
      date,
      paymentMethod,
      assignedTo,
    });

    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(editBudgetInput);
    if (!isNaN(val) && val > 0) {
      onUpdateBudget(val);
      setShowBudgetModal(false);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Groceries':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
      case 'Utilities':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800';
      case 'Dining':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
      case 'Transport':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800';
      case 'Health':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
      case 'Shopping':
        return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
      default:
        return 'text-slate-600 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Note', 'Amount', 'Currency', 'Payment Method'];
    const rows = expenses.map((e) => [
      e.date,
      e.category,
      `"${e.note.replace(/"/g, '""')}"`,
      e.amount,
      e.currency,
      e.paymentMethod || 'Cash',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DayMate_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-500" />
            {t('expenses', language)}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {language === 'bn'
              ? 'ভয়েস বা টেক্সট দিয়ে সহজেই দৈনিক খরচ ট্র্যাক ও বাজেট নিয়ন্ত্রণ করুন'
              : 'Track spending with voice or text, categorize expenses, and monitor monthly budgets'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency Switcher */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 text-xs font-bold">
            {(['৳', '$', '€', '£', '₹'] as Currency[]).map((cur) => (
              <button
                key={cur}
                onClick={() => onChangeCurrency(cur)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  currency === cur
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cur}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addExpense', language)}</span>
          </button>
        </div>
      </div>

      {/* Budget Summary Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl shadow-emerald-950/15 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex items-center justify-between md:justify-start gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
                {t('monthlyBudget', language)}
              </span>
              <button
                onClick={() => {
                  setEditBudgetInput(monthlyBudget.toString());
                  setShowBudgetModal(true);
                }}
                className="text-[11px] underline text-emerald-100 hover:text-white"
              >
                Edit Target
              </button>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold mt-1">
              {currency}{monthlyBudget.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-100 mt-1">Configured for your household</p>
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              {t('spentSoFar', language)}
            </span>
            <div className="text-3xl md:text-4xl font-extrabold mt-1">
              {currency}{totalSpent.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-100 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{percentUsed}% of budget used</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-200">
              {t('remainingBudget', language)}
            </span>
            <div className="text-3xl md:text-4xl font-extrabold mt-1">
              {currency}{remaining.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-100 mt-1">Available for remaining month</p>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="w-full bg-black/25 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                percentUsed > 90 ? 'bg-rose-400' : percentUsed > 70 ? 'bg-amber-300' : 'bg-emerald-300'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Spending by Category
          </h3>
          <span className="text-xs text-slate-400">{sortedCategories.length} Active Categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedCategories.map(([cat, total]) => {
            const catPercent = totalSpent > 0 ? Math.round((total / totalSpent) * 100) : 0;
            return (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {cat}
                  </span>
                  <span className="font-bold text-xs text-slate-900 dark:text-white">
                    {currency}{total.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${catPercent}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 text-right">{catPercent}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Expense Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Transaction History
            </h3>
            {selectedCategory !== 'all' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Filtered: {selectedCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Groceries">Groceries</option>
              <option value="Utilities">Utilities</option>
              <option value="Dining">Dining</option>
              <option value="Transport">Transport</option>
              <option value="Health">Health & Medicine</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredExpenses.map((exp) => {
            const member = familyMembers.find((m) => m.id === exp.assignedTo);
            return (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border text-sm shrink-0 ${getCategoryColor(
                      exp.category
                    )}`}
                  >
                    {exp.category.charAt(0)}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {exp.note}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                      <span>•</span>
                      <span>{exp.date}</span>
                      {exp.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                            {exp.paymentMethod}
                          </span>
                        </>
                      )}
                      {member && (
                        <>
                          <span>•</span>
                          <span className="text-[10px]">👤 {member.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      -{exp.currency || currency}{exp.amount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredExpenses.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No transactions recorded in this category yet.
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                {t('addExpense', language)}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full text-lg font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Item description *
                </label>
                <input
                  type="text"
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Weekly vegetables at Karwan Bazar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Dining">Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Health">Health</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Spent By
                  </label>
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('cancel', language)}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold text-white shadow-md shadow-emerald-600/20"
                >
                  {t('save', language)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Target Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Set Monthly Budget Target
            </h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Budget in {currency}
                </label>
                <input
                  type="number"
                  value={editBudgetInput}
                  onChange={(e) => setEditBudgetInput(e.target.value)}
                  className="w-full text-xl font-bold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold"
                >
                  Update Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
