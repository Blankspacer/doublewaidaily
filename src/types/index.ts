export type Language = 'en' | 'bn';

export type Currency = '৳' | '$' | '€' | '£' | '₹';

export type ReminderCategory = 'bill' | 'appointment' | 'birthday' | 'deadline' | 'household' | 'other';

export interface Reminder {
  id: string;
  title: string;
  category: ReminderCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  notes?: string;
  assignedTo?: string;
  recurring?: 'none' | 'weekly' | 'monthly' | 'yearly';
}

export type ExpenseCategory =
  | 'Groceries'
  | 'Utilities'
  | 'Dining'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Education'
  | 'Other';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  note: string;
  date: string; // YYYY-MM-DD
  paymentMethod?: 'bKash' | 'Nagad' | 'Cash' | 'Card' | 'Bank';
  assignedTo?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit?: string;
  estimatedPrice?: number;
  isBought: boolean;
  assignedTo?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'bill' | 'receipt' | 'warranty' | 'document' | 'subscription';
  provider?: string;
  renewalDate?: string; // YYYY-MM-DD
  expiryDate?: string;
  notes?: string;
  fileMockType?: 'pdf' | 'png' | 'doc';
  important?: boolean;
}

export interface PlannerTask {
  id: string;
  time: string;
  task: string;
  tag: string;
  timeBlock: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
}

export interface ParsedCommandResult {
  aiSummary: string;
  source?: 'gemini' | 'fallback';
  expenses?: Array<{
    amount: number;
    currency?: string;
    category: string;
    note: string;
    date?: string;
  }>;
  reminders?: Array<{
    title: string;
    category: ReminderCategory;
    dueDate?: string;
    dueTime?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
  shoppingItems?: Array<{
    name: string;
    category?: string;
    quantity?: string;
    estimatedPrice?: number;
    unit?: string;
  }>;
  plannerTasks?: Array<{
    title: string;
    timeBlock: 'morning' | 'afternoon' | 'evening';
    durationMinutes?: number;
    priority?: 'low' | 'medium' | 'high';
  }>;
  documents?: Array<{
    title: string;
    category: 'bill' | 'receipt' | 'warranty' | 'document' | 'subscription';
    renewalDate?: string;
    notes?: string;
  }>;
}
