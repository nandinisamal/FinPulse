import React, { useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { Income, User } from '../types/finance';
import { Modal } from '../components/Modal';

interface IncomePageProps {
  user: User;
  onRefresh: () => void;
}

export const IncomePage: React.FC<IncomePageProps> = ({ user, onRefresh }) => {
  const [incomes, setIncomes] = useState<Income[]>(() => apiService.getIncomes());
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Form State
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const refreshList = () => {
    setIncomes(apiService.getIncomes());
    onRefresh();
  };

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      const matchSearch =
        i.source.toLowerCase().includes(search.toLowerCase()) ||
        (i.notes && i.notes.toLowerCase().includes(search.toLowerCase()));
      const matchStart = !startDate || i.date >= startDate;
      const matchEnd = !endDate || i.date <= endDate;
      return matchSearch && matchStart && matchEnd;
    });
  }, [incomes, search, startDate, endDate]);

  // Current month total
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const currentMonthTotal = useMemo(() => {
    return incomes
      .filter((i) => i.date.startsWith(currentMonthStr))
      .reduce((acc, i) => acc + Number(i.amount), 0);
  }, [incomes, currentMonthStr]);

  const allTimeTotal = useMemo(() => {
    return filteredIncomes.reduce((acc, i) => acc + Number(i.amount), 0);
  }, [filteredIncomes]);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setSource('');
    setAmount('');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inc: Income) => {
    setEditingIncome(inc);
    setSource(inc.source);
    setAmount(String(inc.amount));
    setDate(inc.date);
    setNotes(inc.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      apiService.deleteIncome(id);
      refreshList();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!source.trim() || !amount || !date) {
      setFormError('Please complete all required fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }

    if (editingIncome) {
      apiService.updateIncome(editingIncome.id, {
        source: source.trim(),
        amount: numAmount,
        date,
        notes: notes.trim(),
      });
    } else {
      apiService.addIncome({
        source: source.trim(),
        amount: numAmount,
        date,
        notes: notes.trim(),
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
            Current Month Income
          </span>
          <div className="text-2xl font-bold font-numeric text-emerald-600 mt-1">
            {user.currency}{currentMonthTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Cycle: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Filtered Total ({filteredIncomes.length} records)
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{allTimeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Based on active search and date filters
          </span>
        </div>

        <div className="fin-card p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Monthly Target
            </span>
            <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
              {user.currency}{user.monthlyIncomeTarget.toLocaleString()}
            </div>
          </div>
          <div className="text-xs font-medium text-emerald-600">
            {currentMonthTotal >= user.monthlyIncomeTarget ? '✓ Target achieved' : `${user.currency}${(user.monthlyIncomeTarget - currentMonthTotal).toLocaleString()} to reach target`}
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="fin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-48 flex-1 sm:flex-initial">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search source or notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
            <i className="bi bi-search text-slate-400 absolute left-2.5 top-2 text-xs"></i>
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
            {(startDate || endDate || search) && (
              <button
                onClick={() => {
                  setSearch('');
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

        {/* Add Income Button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Add Income Record</span>
        </button>
      </div>

      {/* Incomes Table */}
      <div className="fin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No income records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {inc.source}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {inc.date}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {inc.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-numeric text-emerald-600">
                      +{user.currency}{Number(inc.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(inc)}
                          className="p-1 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square text-sm"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
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

      {/* Add / Edit Income Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIncome ? 'Edit Income Record' : 'Record New Income'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Income Source *
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Primary Salary, Freelancing, Dividends"
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
                Date Received *
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, invoice number, or client..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
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
              {editingIncome ? 'Save Changes' : 'Record Income'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
