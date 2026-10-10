import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { User } from '../types/finance';

interface SettingsPageProps {
  user: User;
  onRefreshAll: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onRefreshAll }) => {
  const [currency, setCurrency] = useState(user.currency);
  const [fiscalStartDay, setFiscalStartDay] = useState('1');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSavePreferences = () => {
    apiService.updateUserProfile({ currency });
    setStatusMessage('Preferences updated successfully.');
    onRefreshAll();
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transaction records, budgets, and incomes to the default portfolio seed dataset?')) {
      apiService.resetDemoData();
      setStatusMessage('Data reset to default Alex Rivera portfolio state.');
      onRefreshAll();
    }
  };

  const handleExportJson = () => {
    const data = {
      user: apiService.getCurrentUser(),
      incomes: apiService.getIncomes(),
      expenses: apiService.getExpenses(),
      budgets: apiService.getBudgets(),
      exportedAt: new Date().toISOString(),
      appVersion: 'FinPulse 1.0.0',
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinPulse_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.incomes && parsed.expenses && parsed.budgets) {
          localStorage.setItem('finpulse_incomes', JSON.stringify(parsed.incomes));
          localStorage.setItem('finpulse_expenses', JSON.stringify(parsed.expenses));
          localStorage.setItem('finpulse_budgets', JSON.stringify(parsed.budgets));
          if (parsed.user) {
            localStorage.setItem('finpulse_user', JSON.stringify(parsed.user));
            localStorage.setItem('finpulse_session', JSON.stringify(parsed.user));
          }
          setStatusMessage('Backup successfully restored from JSON file.');
          onRefreshAll();
        } else {
          alert('Invalid FinPulse backup format.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl">
      {statusMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <i className="bi bi-check-circle-fill text-emerald-600"></i>
          <span>{statusMessage}</span>
        </div>
      )}

      {/* General Preferences */}
      <div className="fin-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Application Preferences
        </h3>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
            >
              <option value="₹">₹ (INR - Indian Rupee)</option>
              <option value="$">$ (USD - United States Dollar)</option>
              <option value="€">€ (EUR - Euro)</option>
              <option value="£">£ (GBP - British Pound)</option>
              <option value="¥">¥ (JPY - Japanese Yen)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fiscal Cycle Start Day of Month
            </label>
            <select
              value={fiscalStartDay}
              onChange={(e) => setFiscalStartDay(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
            >
              <option value="1">1st of Month (Standard Calendar Cycle)</option>
              <option value="25">25th of Month (Align with Salary Deposit)</option>
              <option value="28">28th of Month (Month-end alignment)</option>
            </select>
          </div>

          <button
            onClick={handleSavePreferences}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>

      {/* Data Backup & Restore */}
      <div className="fin-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Database Backup & Migration (JSON / MySQL)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Export your complete financial records, categories, and budgets to an encrypted or human-readable JSON payload, or import existing records.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <i className="bi bi-download text-emerald-600"></i>
            <span>Export Snapshot (JSON)</span>
          </button>

          <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer">
            <i className="bi bi-upload text-blue-600"></i>
            <span>Restore From File (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Data Reset & Demo Maintenance */}
      <div className="fin-card p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
          Data Reset & Maintenance
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Reset all local records, budgets, and categorized spending back to the initial sample dataset if you want to restart testing from a clean state.
        </p>

        <div>
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
            <span>Reset Demo Portfolio Dataset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
