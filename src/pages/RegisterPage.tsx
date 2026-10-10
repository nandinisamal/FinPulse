import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { NavPage } from '../components/Sidebar';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
  onNavigate: (page: NavPage) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [targetIncome, setTargetIncome] = useState('75000');
  const [targetSavings, setTargetSavings] = useState('25');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password strength logic
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const isStrong = hasMinLength && hasNumber && hasLetter;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('All required fields must be completed.');
      return;
    }

    if (!hasMinLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = apiService.register({
        name: name.trim(),
        email: email.trim(),
        currency,
        targetIncome: parseFloat(targetIncome) || 5000,
        targetSavings: parseFloat(targetSavings) || 25,
      });

      setIsLoading(false);
      if (res.success) {
        onRegisterSuccess();
      } else {
        setErrorMessage(res.error || 'Registration failed. Try again.');
      }
    }, 350);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
          <i className="bi bi-person-plus-fill"></i>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          Create FinPulse Account
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Personalized Financial Goals & Secure Session Vault
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-8 border border-slate-200">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <i className="bi bi-exclamation-triangle-fill text-rose-500 text-sm mt-0.5"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Miller"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
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
                placeholder="jordan.miller@example.com"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (BCrypt Hashed)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
              />
              {password && (
                <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                  <span className={hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    ✓ 8+ chars
                  </span>
                  <span className={hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}>
                    ✓ 1+ number
                  </span>
                  <span className={isStrong ? 'text-emerald-600 font-bold ml-auto' : 'text-amber-500 ml-auto'}>
                    {isStrong ? 'Strong' : 'Moderate'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Currency Symbol
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
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
                  Savings Goal (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="80"
                  value={targetSavings}
                  onChange={(e) => setTargetSavings(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Monthly Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">
                  {currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(e.target.value)}
                  className="w-full px-3 py-2 pl-7 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm text-light" role="status"></span>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle"></i>
                  <span>Create Account & Start Tracking</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">Already have an account? </span>
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
