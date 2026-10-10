import {
  User,
  Income,
  Expense,
  Budget,
  DashboardSummary,
  TransactionUnified,
  ExpenseCategory,
  PaymentMethod,
} from '../types/finance';
import { SEED_USER, SEED_INCOMES, SEED_EXPENSES, SEED_BUDGETS } from '../data/mockSeed';
import { runFinancialAdvisor, AdvisorAnalysisResult } from './advisorEngine';

const STORAGE_KEYS = {
  USER: 'finpulse_user',
  SESSION: 'finpulse_session',
  INCOMES: 'finpulse_incomes',
  EXPENSES: 'finpulse_expenses',
  BUDGETS: 'finpulse_budgets',
  CURRENCY: 'finpulse_currency',
};

// Initialize LocalStorage if empty or migrate currency to ₹
function initStorage() {
  const existingUserStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!existingUserStr) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SEED_USER));
  } else {
    try {
      const parsed = JSON.parse(existingUserStr);
      if (parsed.currency === '$') {
        parsed.currency = '₹';
        parsed.monthlyIncomeTarget = parsed.monthlyIncomeTarget === 6000 ? 85000 : parsed.monthlyIncomeTarget;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(parsed));
      }
    } catch {}
  }

  const existingSessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (!existingSessionStr) {
    // Start logged in with demo user
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(SEED_USER));
  } else {
    try {
      const parsed = JSON.parse(existingSessionStr);
      if (parsed.currency === '$') {
        parsed.currency = '₹';
        parsed.monthlyIncomeTarget = parsed.monthlyIncomeTarget === 6000 ? 85000 : parsed.monthlyIncomeTarget;
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(parsed));
      }
    } catch {}
  }

  // If initial seed had older dollar amounts, upgrade to rich INR dataset
  const existingIncomes = localStorage.getItem(STORAGE_KEYS.INCOMES);
  if (!existingIncomes) {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(SEED_INCOMES));
  } else {
    try {
      const incs = JSON.parse(existingIncomes);
      if (incs.length > 0 && incs[0].amount === 5200) {
        localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(SEED_INCOMES));
      }
    } catch {}
  }

  const existingExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!existingExpenses) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES));
  } else {
    try {
      const exps = JSON.parse(existingExpenses);
      if (exps.length > 0 && exps[0].amount === 1450) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES));
      }
    } catch {}
  }

  const existingBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (!existingBudgets) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(SEED_BUDGETS));
  } else {
    try {
      const bgs = JSON.parse(existingBudgets);
      if (bgs.length > 0 && bgs[0].limitAmount === 550) {
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(SEED_BUDGETS));
      }
    } catch {}
  }
}

initStorage();

export const apiService = {
  // Authentication
  getCurrentUser(): User | null {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  },

  login(email: string, _password: string): { success: boolean; user?: User; error?: string } {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return { success: false, error: 'User does not exist.' };
    const user: User = JSON.parse(userStr);

    if (user.email.toLowerCase() === email.toLowerCase()) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, error: 'Invalid email or password.' };
  },

  register(data: { name: string; email: string; currency?: string; targetIncome?: number; targetSavings?: number }): { success: boolean; user?: User; error?: string } {
    const existing = localStorage.getItem(STORAGE_KEYS.USER);
    if (existing) {
      const exUser: User = JSON.parse(existing);
      if (exUser.email.toLowerCase() === data.email.toLowerCase()) {
        return { success: false, error: 'An account with this email address already exists.' };
      }
    }

    const newUser: User = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      currency: data.currency || '₹',
      monthlyIncomeTarget: data.targetIncome || 60000,
      savingsTargetGoal: data.targetSavings || 25,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
    return { success: true, user: newUser };
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  updateUserProfile(updated: Partial<User>): User {
    const current = this.getCurrentUser() || SEED_USER;
    const merged: User = { ...current, ...updated };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(merged));
    return merged;
  },

  // Income Management
  getIncomes(): Income[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INCOMES);
    return raw ? JSON.parse(raw) : [];
  },

  addIncome(data: Omit<Income, 'id' | 'userId' | 'createdAt'>): Income {
    const user = this.getCurrentUser() || SEED_USER;
    const incomes = this.getIncomes();
    const newInc: Income = {
      id: Date.now(),
      userId: user.id,
      amount: Number(data.amount),
      source: data.source.trim(),
      date: data.date,
      notes: data.notes?.trim(),
      createdAt: new Date().toISOString(),
    };
    incomes.unshift(newInc);
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    return newInc;
  },

  updateIncome(id: number, data: Partial<Omit<Income, 'id' | 'userId' | 'createdAt'>>): Income {
    const incomes = this.getIncomes();
    const idx = incomes.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Income record not found');
    incomes[idx] = {
      ...incomes[idx],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : incomes[idx].amount,
    };
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
    return incomes[idx];
  },

  deleteIncome(id: number): boolean {
    const incomes = this.getIncomes();
    const filtered = incomes.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(filtered));
    return true;
  },

  // Expense Management
  getExpenses(): Expense[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return raw ? JSON.parse(raw) : [];
  },

  addExpense(data: Omit<Expense, 'id' | 'userId' | 'createdAt'>): Expense {
    const user = this.getCurrentUser() || SEED_USER;
    const expenses = this.getExpenses();
    const newExp: Expense = {
      id: Date.now(),
      userId: user.id,
      amount: Number(data.amount),
      category: data.category,
      description: data.description.trim(),
      date: data.date,
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };
    expenses.unshift(newExp);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return newExp;
  },

  updateExpense(id: number, data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>): Expense {
    const expenses = this.getExpenses();
    const idx = expenses.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Expense record not found');
    expenses[idx] = {
      ...expenses[idx],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : expenses[idx].amount,
    };
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    return expenses[idx];
  },

  deleteExpense(id: number): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    return true;
  },

  // Budget Management
  getBudgets(): Budget[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return raw ? JSON.parse(raw) : [];
  },

  addBudget(data: Omit<Budget, 'id' | 'userId' | 'createdAt'>): Budget {
    const user = this.getCurrentUser() || SEED_USER;
    const budgets = this.getBudgets();
    // Check if budget for category & month already exists
    const existing = budgets.find(b => b.category === data.category && b.monthYear === data.monthYear);
    if (existing) {
      existing.limitAmount = Number(data.limitAmount);
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
      return existing;
    }

    const newBudget: Budget = {
      id: Date.now(),
      userId: user.id,
      category: data.category,
      limitAmount: Number(data.limitAmount),
      monthYear: data.monthYear,
      createdAt: new Date().toISOString(),
    };
    budgets.push(newBudget);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return newBudget;
  },

  updateBudget(id: number, limitAmount: number): Budget {
    const budgets = this.getBudgets();
    const idx = budgets.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Budget record not found');
    budgets[idx].limitAmount = Number(limitAmount);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    return budgets[idx];
  },

  deleteBudget(id: number): boolean {
    const budgets = this.getBudgets();
    const filtered = budgets.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(filtered));
    return true;
  },

  // Dashboard Aggregations
  getDashboardSummary(monthFilter?: string): DashboardSummary {
    const user = this.getCurrentUser() || SEED_USER;
    const incomes = this.getIncomes();
    const expenses = this.getExpenses();
    const budgets = this.getBudgets();
    const analysis = runFinancialAdvisor(user, incomes, expenses, budgets, monthFilter);

    // Calculate top category
    const entries = Object.entries(analysis.categoryTotals);
    let topExpenseCategory = null;
    if (entries.length > 0 && analysis.totalExpense > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      topExpenseCategory = {
        category: entries[0][0],
        amount: entries[0][1],
        percentage: Math.round((entries[0][1] / analysis.totalExpense) * 100),
      };
    }

    const overbudgetCount = analysis.budgetStatuses.filter(b => b.status === 'danger').length;

    return {
      totalMonthlyIncome: analysis.totalIncome,
      totalMonthlyExpenses: analysis.totalExpense,
      availableBalance: analysis.netCashflow,
      savingsRate: Math.round(analysis.savingsRate * 10) / 10,
      targetSavingsRate: user.savingsTargetGoal,
      incomeTargetMet: analysis.totalIncome >= user.monthlyIncomeTarget,
      activeBudgetsCount: analysis.budgetStatuses.length,
      overbudgetCount,
      topExpenseCategory,
    };
  },

  // Transactions (Unified)
  getUnifiedTransactions(): TransactionUnified[] {
    const incomes = this.getIncomes().map(i => ({
      id: `inc-${i.id}`,
      originalId: i.id,
      type: 'INCOME' as const,
      title: i.source,
      category: 'Income',
      amount: Number(i.amount),
      date: i.date,
      notes: i.notes,
    }));

    const expenses = this.getExpenses().map(e => ({
      id: `exp-${e.id}`,
      originalId: e.id,
      type: 'EXPENSE' as const,
      title: e.description,
      category: e.category,
      amount: Number(e.amount),
      date: e.date,
      paymentMethod: e.paymentMethod,
    }));

    return [...incomes, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  exportTransactionsCsv(): string {
    const txs = this.getUnifiedTransactions();
    const headers = ['ID', 'Type', 'Description/Source', 'Category', 'Amount', 'Date', 'Payment Method/Notes'];
    const rows = txs.map(t => [
      t.id,
      t.type,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount.toFixed(2),
      t.date,
      `"${(t.paymentMethod || t.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  // Advisor Analysis
  getAdvisorAnalysis(monthFilter?: string): AdvisorAnalysisResult {
    const user = this.getCurrentUser() || SEED_USER;
    const incomes = this.getIncomes();
    const expenses = this.getExpenses();
    const budgets = this.getBudgets();
    return runFinancialAdvisor(user, incomes, expenses, budgets, monthFilter);
  },

  // Analytics Trends
  getMonthlyAnalytics(): {
    labels: string[];
    incomeData: number[];
    expenseData: number[];
    savingsData: number[];
  } {
    const incomes = this.getIncomes();
    const expenses = this.getExpenses();

    // Last 6 calendar months
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(mStr);
    }

    const incomeData = months.map(m =>
      incomes.filter(i => i.date.startsWith(m)).reduce((acc, i) => acc + Number(i.amount), 0)
    );
    const expenseData = months.map(m =>
      expenses.filter(e => e.date.startsWith(m)).reduce((acc, e) => acc + Number(e.amount), 0)
    );
    const savingsData = months.map((_, idx) => Math.max(0, incomeData[idx] - expenseData[idx]));

    const monthNames = months.map(m => {
      const parts = m.split('-');
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return date.toLocaleString('default', { month: 'short' });
    });

    return {
      labels: monthNames,
      incomeData,
      expenseData,
      savingsData,
    };
  },

  // Reset to seed data
  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SEED_USER));
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(SEED_USER));
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(SEED_INCOMES));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(SEED_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(SEED_BUDGETS));
  },
};
