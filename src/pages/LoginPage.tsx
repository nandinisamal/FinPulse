import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { NavPage } from '../components/Sidebar';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onNavigate: (page: NavPage) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [email, setEmail] = useState('alex.rivera@example.com');
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = apiService.login(email, password);
      setIsLoading(false);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(result.error || 'Authentication failed. Check your credentials.');
      }
    }, 350);
  };

  const handleDemoLogin = () => {
    setEmail('alex.rivera@example.com');
    setPassword('Password@123');
    setIsLoading(true);
    setTimeout(() => {
      apiService.login('alex.rivera@example.com', 'Password@123');
      setIsLoading(false);
      onLoginSuccess();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
          <i className="bi bi-currency-exchange"></i>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">
          Sign In to FinPulse
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Secure Session-Based Authentication
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-8 border border-slate-200">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <i className="bi bi-exclamation-triangle-fill text-rose-500 text-sm mt-0.5"></i>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3 py-2 pl-9 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900"
                />
                <i className="bi bi-envelope text-slate-400 absolute left-3 top-2.5 text-xs"></i>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 pl-9 pr-9 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-mono"
                />
                <i className="bi bi-lock text-slate-400 absolute left-3 top-2.5 text-xs"></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                <span>Remember session</span>
              </label>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Auto-fill Demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm text-light" role="status"></span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right"></i>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Card */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-2"
            >
              <i className="bi bi-lightning-charge-fill text-emerald-600"></i>
              <span>One-Click Demo Login (Pre-loaded Portfolio Data)</span>
            </button>
          </div>

          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">Don't have an account? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Register here
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs text-slate-400 hover:text-slate-300 font-mono flex items-center justify-center gap-1.5 mx-auto"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back to FinPulse Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
