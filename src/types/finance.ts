export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Healthcare'
  | 'Entertainment'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'Credit Card'
  | 'Debit Card'
  | 'UPI / Transfer'
  | 'Other';

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string; // e.g. '$', '₹', '€', '£'
  monthlyIncomeTarget: number;
  savingsTargetGoal: number; // percentage, e.g. 25
  createdAt: string;
}

export interface Income {
  id: number;
  userId: number;
  amount: number;
  source: string; // e.g. 'Primary Salary', 'Freelancing', 'Dividends'
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Budget {
  id: number;
  userId: number;
  category: ExpenseCategory;
  limitAmount: number;
  monthYear: string; // YYYY-MM
  createdAt: string;
}

export interface BudgetStatus extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface AdvisorRecommendation {
  id: string;
  type: 'critical' | 'warning' | 'positive' | 'tip';
  title: string;
  message: string;
  reason: string;
  suggestedAction: string;
  potentialSavings?: number;
  category?: ExpenseCategory;
}

export interface DashboardSummary {
  totalMonthlyIncome: number;
  totalMonthlyExpenses: number;
  availableBalance: number;
  savingsRate: number; // percentage
  targetSavingsRate: number;
  incomeTargetMet: boolean;
  activeBudgetsCount: number;
  overbudgetCount: number;
  topExpenseCategory: { category: string; amount: number; percentage: number } | null;
}

export interface TransactionUnified {
  id: string; // e.g. 'inc-1' or 'exp-2'
  originalId: number;
  type: 'INCOME' | 'EXPENSE';
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  notes?: string;
}
