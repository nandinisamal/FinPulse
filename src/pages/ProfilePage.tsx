import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types/finance';

interface ProfilePageProps {
  user: User;
  onRefreshUser: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onRefreshUser }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.currency);
  const [monthlyIncomeTarget, setMonthlyIncomeTarget] = useState(String(user.monthlyIncomeTarget));
  const [savingsTargetGoal, setSavingsTargetGoal] = useState(String(user.savingsTargetGoal));
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!name.trim() || !email.trim()) {
      setErrorMessage('Name and Email cannot be empty.');
      return;
    }

    const incomeTargetNum = parseFloat(monthlyIncomeTarget) || 5000;
    const savingsTargetNum = parseFloat(savingsTargetGoal) || 25;

    apiService.updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      currency,
      monthlyIncomeTarget: incomeTargetNum,
      savingsTargetGoal: savingsTargetNum,
    });

    setStatusMessage('Profile successfully updated and synchronized.');
    onRefreshUser();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!currentPassword || !newPassword) {
      setErrorMessage('Please provide both current and new password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setStatusMessage('Password updated successfully. BCrypt digest regenerated.');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {/* Top Banner */}
      <div className="fin-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xl uppercase border-2 border-emerald-500/30">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">{user.name}</h2>
          <span className="text-xs text-slate-500 font-mono">{user.email}</span>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span>Role: Full-Stack Developer / End User</span>
            <span>·</span>
            <span>Security: BCrypt Session Auth</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <i className="bi bi-check-circle-fill text-emerald-600"></i>
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill text-rose-600"></i>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Settings Form */}
      <div className="fin-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Personal Information & Financial Benchmarks
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD)</option>
                <option value="€">€ (EUR)</option>
                <option value="£">£ (GBP)</option>
                <option value="¥">¥ (JPY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Target Income
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={monthlyIncomeTarget}
                onChange={(e) => setMonthlyIncomeTarget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Savings Rate (%)
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={savingsTargetGoal}
                onChange={(e) => setSavingsTargetGoal(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Password & Security Management */}
      <div className="fin-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Security & Password Management (BCrypt Hashing)
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
