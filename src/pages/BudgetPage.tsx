import React, { useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { Budget, ExpenseCategory, User } from '../types/finance';
import { Modal } from '../components/Modal';

interface BudgetPageProps {
  user: User;
  onRefresh: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Bills',
  'Travel',
  'Shopping',
  'Entertainment',
  'Education',
  'Healthcare',
  'Other',
];

export const BudgetPage: React.FC<BudgetPageProps> = ({ user, onRefresh }) => {
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [budgets, setBudgets] = useState<Budget[]>(() => apiService.getBudgets());

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [limitAmount, setLimitAmount] = useState('');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setBudgets(apiService.getBudgets());
    onRefresh();
  };

  const advisorData = useMemo(() => {
    return apiService.getAdvisorAnalysis(selectedMonth);
  }, [selectedMonth, budgets]);

  const totalBudgeted = useMemo(() => {
    return advisorData.budgetStatuses.reduce((acc, b) => acc + Number(b.limitAmount), 0);
  }, [advisorData]);

  const totalSpentInBudgets = useMemo(() => {
    return advisorData.budgetStatuses.reduce((acc, b) => acc + Number(b.spent), 0);
  }, [advisorData]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setCategory('Food');
    setLimitAmount('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setCategory(b.category);
    setLimitAmount(String(b.limitAmount));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget limit?')) {
      apiService.deleteBudget(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const numLimit = parseFloat(limitAmount);
    if (isNaN(numLimit) || numLimit <= 0) {
      setFormError('Please enter a valid positive budget limit.');
      return;
    }

    if (editingBudget) {
      apiService.updateBudget(editingBudget.id, numLimit);
    } else {
      apiService.addBudget({
        category,
        limitAmount: numLimit,
        monthYear: selectedMonth,
      });
    }

    setIsModalOpen(false);
    refreshList();
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Budget Allocation
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{totalBudgeted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {advisorData.budgetStatuses.length} established category limits
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Spent in Budgets
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{totalSpentInBudgets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {totalBudgeted > 0 ? `${Math.round((totalSpentInBudgets / totalBudgeted) * 100)}% overall utilization` : 'No budget set'}
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Budget Health Status
          </span>
          {(() => {
            const dangerCount = advisorData.budgetStatuses.filter(b => b.status === 'danger').length;
            const warningCount = advisorData.budgetStatuses.filter(b => b.status === 'warning').length;
            return (
              <div>
                <div className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
                  {dangerCount > 0 ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <i className="bi bi-exclamation-triangle-fill"></i>
                      {dangerCount} Overbudget
                    </span>
                  ) : warningCount > 0 ? (
                    <span className="text-amber-600 flex items-center gap-1">
                      <i className="bi bi-exclamation-circle-fill"></i>
                      {warningCount} Near Cap
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <i className="bi bi-check-circle-fill"></i>
                      All Within Limits
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Threshold alerts auto-calculated
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Action Bar & Month Selector */}
      <div className="fin-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-700">
            Target Month Cycle:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 bg-white"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Establish Category Budget</span>
        </button>
      </div>

      {/* Budget Cards Grid */}
      {advisorData.budgetStatuses.length === 0 ? (
        <div className="fin-card p-12 text-center text-slate-400">
          <i className="bi bi-piggy-bank text-4xl block mb-3 text-slate-300"></i>
          <h3 className="text-sm font-bold text-slate-700 mb-1">No Budgets Set For {selectedMonth}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Setting spending caps helps the financial advisor warn you before you overspend.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
          >
            Create Your First Category Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advisorData.budgetStatuses.map((b) => {
            const isDanger = b.status === 'danger';
            const isWarning = b.status === 'warning';
            const barBg = isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';

            return (
              <div key={b.id} className="fin-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{b.category}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Cycle: {b.monthYear}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded"
                        title="Edit limit"
                      >
                        <i className="bi bi-pencil-square text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete budget"
                      >
                        <i className="bi bi-trash3 text-xs"></i>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Spent</span>
                      <span className="text-lg font-bold font-numeric text-slate-900">
                        {user.currency}{b.spent.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Limit</span>
                      <span className="text-sm font-semibold font-numeric text-slate-700">
                        {user.currency}{b.limitAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${barBg}`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-numeric">{b.percentage}% used</span>
                    <span className={`font-semibold ${isDanger ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isDanger
                        ? `Over by ${user.currency}${Math.abs(b.remaining).toLocaleString()}`
                        : `${user.currency}${b.remaining.toLocaleString()} left`}
                    </span>
                  </div>
                </div>

                {/* Status indicator banner */}
                <div className={`mt-4 pt-3 border-t text-[11px] flex items-center gap-1.5 ${
                  isDanger
                    ? 'border-rose-100 text-rose-700 font-medium'
                    : isWarning
                    ? 'border-amber-100 text-amber-700 font-medium'
                    : 'border-slate-100 text-slate-500'
                }`}>
                  <i className={`bi ${isDanger ? 'bi-exclamation-octagon-fill' : isWarning ? 'bi-exclamation-circle' : 'bi-shield-check'}`}></i>
                  <span>
                    {isDanger
                      ? 'Exceeded budget limit. Action needed.'
                      : isWarning
                      ? 'Approaching limit (>80% consumed).'
                      : 'Spending pace is within healthy limits.'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? `Edit ${editingBudget.category} Budget` : 'Set Category Budget'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          {!editingBudget && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Spending Limit ({user.currency}) *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="e.g. 500"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
            />
          </div>

          <div className="text-xs text-slate-500">
            Target Month: <strong className="text-slate-800">{selectedMonth}</strong>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
            >
              {editingBudget ? 'Update Limit' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
