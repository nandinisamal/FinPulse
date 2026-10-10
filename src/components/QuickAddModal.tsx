import React, { useState } from 'react';
import { Modal } from './Modal';
import { apiService } from '../services/apiService';
import { ExpenseCategory, PaymentMethod, User } from '../types/finance';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSuccess: () => void;
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

const PAYMENT_METHODS: PaymentMethod[] = [
  'Credit Card',
  'Debit Card',
  'UPI / Transfer',
  'Cash',
  'Other',
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !amount || !date) {
      setError('Please fill in all required fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive number.');
      return;
    }

    if (type === 'INCOME') {
      apiService.addIncome({
        source: title.trim(),
        amount: numAmount,
        date,
      });
    } else {
      apiService.addExpense({
        description: title.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        date,
      });
    }

    // Reset and close
    setTitle('');
    setAmount('');
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Transaction Logger"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        {/* Type Selector (Segmented control) */}
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              type === 'EXPENSE'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Record Expense
          </button>
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              type === 'INCOME'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Record Income
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {type === 'INCOME' ? 'Income Source *' : 'Expense Description *'}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={type === 'INCOME' ? 'e.g. Consulting, Freelancing' : 'e.g. Lunch with client, Fuel, Cinema'}
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

        {type === 'EXPENSE' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs ${
              type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            Save Record
          </button>
        </div>
      </form>
    </Modal>
  );
};
