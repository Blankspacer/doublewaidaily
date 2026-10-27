/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wallet,
  ShoppingCart,
  FileText,
  Calendar,
  LayoutDashboard,
  Globe,
  Crown,
  Users,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Reminder,
  Expense,
  ShoppingItem,
  DocumentItem,
  PlannerTask,
  FamilyMember,
  Language,
  Currency,
  ParsedCommandResult,
} from './types';
import {
  getInitialReminders,
  getInitialExpenses,
  initialShoppingItems,
  initialDocuments,
  initialPlannerTasks,
  initialFamilyMembers,
} from './utils/initialData';
import { t } from './utils/translations';
import { VoiceCommandBar } from './components/VoiceCommandBar';
import { DashboardOverview } from './components/DashboardOverview';
import { RemindersView } from './components/RemindersView';
import { ExpenseTrackerView } from './components/ExpenseTrackerView';
import { ShoppingListView } from './components/ShoppingListView';
import { DocumentOrganizerView } from './components/DocumentOrganizerView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { HouseholdModal } from './components/HouseholdModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';

export default function App() {
  // Persistence state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('daymate_lang') as Language) || 'en';
  });

  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('daymate_cur') as Currency) || '৳';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('daymate_theme') === 'dark';
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('daymate_reminders');
    return saved ? JSON.parse(saved) : getInitialReminders();
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('daymate_expenses');
    return saved ? JSON.parse(saved) : getInitialExpenses();
  });

  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('daymate_shopping');
    return saved ? JSON.parse(saved) : initialShoppingItems;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('daymate_docs');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>(() => {
    const saved = localStorage.getItem('daymate_planner');
    return saved ? JSON.parse(saved) : initialPlannerTasks;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('daymate_family');
    return saved ? JSON.parse(saved) : initialFamilyMembers;
  });

  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    const saved = localStorage.getItem('daymate_budget');
    return saved ? parseFloat(saved) : 30000;
  });

  const [isProActive, setIsProActive] = useState<boolean>(() => {
    return localStorage.getItem('daymate_pro') === 'true';
  });

  // Modals
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Quick Action Modal routing
  const [openAddType, setOpenAddType] = useState<'reminder' | 'expense' | 'shopping' | 'document' | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('daymate_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('daymate_cur', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('daymate_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('daymate_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('daymate_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('daymate_shopping', JSON.stringify(shoppingItems));
  }, [shoppingItems]);

  useEffect(() => {
    localStorage.setItem('daymate_docs', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('daymate_planner', JSON.stringify(plannerTasks));
  }, [plannerTasks]);

  useEffect(() => {
    localStorage.setItem('daymate_family', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('daymate_budget', monthlyBudget.toString());
  }, [monthlyBudget]);

  useEffect(() => {
    localStorage.setItem('daymate_pro', isProActive ? 'true' : 'false');
  }, [isProActive]);

  // Multi-intent Unified Action Dispatcher (USP handler)
  const handleApplyParsedResult = (result: ParsedCommandResult) => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Append expenses
    if (result.expenses && result.expenses.length > 0) {
      const newExpList: Expense[] = result.expenses.map((exp, idx) => ({
        id: `exp-${Date.now()}-${idx}`,
        amount: Number(exp.amount),
        currency: exp.currency || currency,
        category: (exp.category as any) || 'Groceries',
        note: exp.note || 'Expense',
        date: exp.date || todayStr,
        paymentMethod: 'Cash',
        assignedTo: familyMembers[0]?.id || 'm1',
      }));
      setExpenses((prev) => [...newExpList, ...prev]);
    }

    // 2. Append reminders
    if (result.reminders && result.reminders.length > 0) {
      const newRemList: Reminder[] = result.reminders.map((rem, idx) => ({
        id: `rem-${Date.now()}-${idx}`,
        title: rem.title,
        category: rem.category || 'bill',
        dueDate: rem.dueDate || todayStr,
        dueTime: rem.dueTime || '10:00',
        priority: rem.priority || 'high',
        completed: false,
        assignedTo: familyMembers[0]?.id || 'm1',
      }));
      setReminders((prev) => [...newRemList, ...prev]);
    }

    // 3. Append shopping items
    if (result.shoppingItems && result.shoppingItems.length > 0) {
      const newShopList: ShoppingItem[] = result.shoppingItems.map((item, idx) => ({
        id: `shop-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'Pantry',
        quantity: item.quantity || '1',
        unit: item.unit || 'kg',
        estimatedPrice: item.estimatedPrice || 120,
        isBought: false,
        assignedTo: familyMembers[0]?.id || 'm1',
      }));
      setShoppingItems((prev) => [...prev, ...newShopList]);
    }

    // 4. Append planner tasks
    if (result.plannerTasks && result.plannerTasks.length > 0) {
      const newTaskList: PlannerTask[] = result.plannerTasks.map((t, idx) => ({
        id: `plan-${Date.now()}-${idx}`,
        time: '11:00 AM',
        task: t.title,
        tag: 'AI Command',
        timeBlock: t.timeBlock || 'morning',
        completed: false,
        priority: t.priority || 'medium',
      }));
      setPlannerTasks((prev) => [...prev, ...newTaskList]);
    }

    // 5. Append documents
    if (result.documents && result.documents.length > 0) {
      const newDocList: DocumentItem[] = result.documents.map((doc, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        title: doc.title,
        category: doc.category || 'warranty',
        renewalDate: doc.renewalDate,
        notes: doc.notes,
        fileMockType: 'pdf',
        important: true,
      }));
      setDocuments((prev) => [...prev, ...newDocList]);
    }
  };

  // Reminder handlers
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleSnoozeReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const current = new Date(r.dueDate);
          current.setDate(current.getDate() + 1);
          return { ...r, dueDate: current.toISOString().split('T')[0] };
        }
        return r;
      })
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddReminder = (item: Omit<Reminder, 'id' | 'completed'>) => {
    const newRem: Reminder = {
      ...item,
      id: `rem-${Date.now()}`,
      completed: false,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  // Expense handlers
  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...exp,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Shopping handlers
  const handleToggleShopping = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isBought: !i.isBought } : i))
    );
  };

  const handleDeleteShopping = (id: string) => {
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddShopping = (item: Omit<ShoppingItem, 'id' | 'isBought'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `shop-${Date.now()}`,
      isBought: false,
    };
    setShoppingItems((prev) => [...prev, newItem]);
  };

  const handleApplyShoppingTemplate = (items: Array<Omit<ShoppingItem, 'id' | 'isBought'>>) => {
    const formatted = items.map((it, idx) => ({
      ...it,
      id: `shop-tpl-${Date.now()}-${idx}`,
      isBought: false,
      assignedTo: familyMembers[0]?.id || 'm1',
    }));
    setShoppingItems((prev) => [...prev, ...formatted]);
  };

  const handleClearBoughtShopping = () => {
    setShoppingItems((prev) => prev.filter((i) => !i.isBought));
  };

  // Document handlers
  const handleAddDocument = (doc: Omit<DocumentItem, 'id'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Planner handlers
  const handleToggleTask = (id: string) => {
    setPlannerTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddPlannerTask = (task: Omit<PlannerTask, 'id' | 'completed'>) => {
    const newTask: PlannerTask = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setPlannerTasks((prev) => [...prev, newTask]);
  };

  // Family members handlers
  const handleAddFamilyMember = (member: FamilyMember) => {
    setFamilyMembers((prev) => [...prev, member]);
  };

  const handleDeleteFamilyMember = (id: string) => {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const pendingRemindersCount = reminders.filter((r) => !r.completed).length;
  const pendingShoppingCount = shoppingItems.filter((i) => !i.isBought).length;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}>
      {/* Top Universal App Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-indigo-600 dark:from-emerald-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  DayMate AI
                </span>
                {isProActive && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-extrabold border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                {t('tagline', language)}
              </p>
            </div>
          </div>

          {/* Controls: Language, Currency, Household, Pro Upgrade, Theme */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Household Manager */}
            <button
              onClick={() => setShowHouseholdModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-all"
              title="Household & Family Sharing"
            >
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden md:inline">{t('family', language)}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 font-bold">
                {familyMembers.length}
              </span>
            </button>

            {/* Pro Upgrade Button */}
            <button
              onClick={() => setShowProModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold shadow-sm shadow-amber-500/20 transition-all"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isProActive ? 'DayMate Pro' : t('upgradePro', language)}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Prominent Multi-Intent Voice & Text AI Command Bar */}
        <VoiceCommandBar
          language={language}
          currency={currency}
          onApplyParsedResult={handleApplyParsedResult}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-bold">
          {[
            { id: 'dashboard', label: t('dashboard', language), icon: LayoutDashboard },
            { id: 'reminders', label: t('reminders', language), icon: Bell, badge: pendingRemindersCount },
            { id: 'expenses', label: t('expenses', language), icon: Wallet },
            { id: 'shopping', label: t('shopping', language), icon: ShoppingCart, badge: pendingShoppingCount },
            { id: 'documents', label: t('documents', language), icon: FileText, badge: documents.length },
            { id: 'planner', label: t('planner', language), icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Views */}
        <div>
          {activeTab === 'dashboard' && (
            <DashboardOverview
              reminders={reminders}
              expenses={expenses}
              shoppingItems={shoppingItems}
              documents={documents}
              plannerTasks={plannerTasks}
              familyMembers={familyMembers}
              language={language}
              currency={currency}
              monthlyBudget={monthlyBudget}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onToggleReminder={handleToggleReminder}
              onToggleShoppingItem={handleToggleShopping}
              onOpenAddModal={(type) => {
                setActiveTab(
                  type === 'reminder'
                    ? 'reminders'
                    : type === 'expense'
                    ? 'expenses'
                    : type === 'shopping'
                    ? 'shopping'
                    : 'documents'
                );
              }}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              familyMembers={familyMembers}
              language={language}
              onToggleReminder={handleToggleReminder}
              onSnoozeReminder={handleSnoozeReminder}
              onDeleteReminder={handleDeleteReminder}
              onAddReminder={handleAddReminder}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTrackerView
              expenses={expenses}
              monthlyBudget={monthlyBudget}
              currency={currency}
              language={language}
              familyMembers={familyMembers}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onUpdateBudget={(val) => setMonthlyBudget(val)}
              onChangeCurrency={(cur) => setCurrency(cur)}
            />
          )}

          {activeTab === 'shopping' && (
            <ShoppingListView
              shoppingItems={shoppingItems}
              familyMembers={familyMembers}
              language={language}
              currency={currency}
              onToggleShoppingItem={handleToggleShopping}
              onDeleteItem={handleDeleteShopping}
              onAddItem={handleAddShopping}
              onApplyTemplate={handleApplyShoppingTemplate}
              onClearBought={handleClearBoughtShopping}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentOrganizerView
              documents={documents}
              language={language}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'planner' && (
            <DailyPlannerView
              tasks={plannerTasks}
              reminders={reminders}
              language={language}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddPlannerTask}
              onSetTasks={(tasks) => setPlannerTasks(tasks)}
            />
          )}
        </div>
      </main>

      {/* Household & Family Sharing Modal */}
      <HouseholdModal
        isOpen={showHouseholdModal}
        onClose={() => setShowHouseholdModal(false)}
        familyMembers={familyMembers}
        language={language}
        onAddMember={handleAddFamilyMember}
        onDeleteMember={handleDeleteFamilyMember}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        language={language}
        onTrialActivated={() => setIsProActive(true)}
        isProActive={isProActive}
      />
    </div>
  );
}
