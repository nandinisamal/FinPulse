import React, { useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { Expense, ExpenseCategory, PaymentMethod, User } from '../types/finance';
import { Modal } from '../components/Modal';

interface ExpensePageProps {
  user: User;
  onRefresh: () => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Education',
  'Healthcare',
  'Entertainment',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'Debit Card',
  'UPI / Transfer',
  'Cash',
  'Other',
];

export const ExpensePage: React.FC<ExpensePageProps> = ({ user, onRefresh }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => apiService.getExpenses());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setExpenses(apiService.getExpenses());
    onRefresh();
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = e.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchStart = !startDate || e.date >= startDate;
      const matchEnd = !endDate || e.date <= endDate;
      return matchSearch && matchCategory && matchStart && matchEnd;
    });
  }, [expenses, search, selectedCategory, startDate, endDate]);

  // Current month total
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentMonthTotal = useMemo(() => {
    return expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .reduce((acc, e) => acc + Number(e.amount), 0);
  }, [expenses, currentMonthStr]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + Number(e.amount), 0);
  }, [filteredExpenses]);

  // Category breakdown for current month
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const exp of expenses.filter((e) => e.date.startsWith(currentMonthStr))) {
      map[exp.category] = (map[exp.category] || 0) + Number(exp.amount);
    }
    return map;
  }, [expenses, currentMonthStr]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setDescription('');
    setAmount('');
    setCategory('Food');
    setPaymentMethod('Credit Card');
    setDate(new Date().toISOString().slice(0, 10));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setPaymentMethod(exp.paymentMethod);
    setDate(exp.date);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this expense record?')) {
      apiService.deleteExpense(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim() || !amount || !date) {
      setFormError('Please fill out all required fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Enter a valid expense amount.');
      return;
    }

    if (editingExpense) {
      apiService.updateExpense(editingExpense.id, {
        description: description.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        date,
      });
    } else {
      apiService.addExpense({
        description: description.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        date,
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
            Current Month Expenses
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{currentMonthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Active billing cycle total
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Filtered Total ({filteredExpenses.length} expenses)
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{filteredTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Matches selected category and search
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Top Category This Month
          </span>
          {Object.entries(categoryTotals).length > 0 ? (
            (() => {
              const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
              return (
                <div>
                  <div className="text-xl font-bold text-slate-900 mt-1">
                    {sorted[0][0]}
                  </div>
                  <span className="text-xs text-slate-500 font-numeric">
                    {user.currency}{sorted[0][1].toLocaleString()} ({currentMonthTotal > 0 ? Math.round((sorted[0][1] / currentMonthTotal) * 100) : 0}%)
                  </span>
                </div>
              );
            })()
          ) : (
            <div className="text-xs text-slate-400 mt-2">No expenses yet</div>
          )}
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="fin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-44 flex-1 sm:flex-initial">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
            <i className="bi bi-search text-slate-400 absolute left-2.5 top-2 text-xs"></i>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 bg-white"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
            />
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800"
            />
            {(startDate || endDate || search || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('ALL');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Add Expense Button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Add Expense Record</span>
        </button>
      </div>

      {/* Expenses Table */}
      <div className="fin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No expense records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {exp.description}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {exp.category}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {exp.paymentMethod || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {exp.date}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-numeric text-slate-900">
                      -{user.currency}{Number(exp.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <i className="bi bi-trash3 text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Grocery Store, Electric Bill, Train Ticket"
              required
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount ({user.currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>
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
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-xs"
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
