import React from 'react';
import { NavPage } from '../components/Sidebar';

interface LandingPageProps {
  onNavigate: (page: NavPage) => void;
  onQuickDemoLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onQuickDemoLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-xs">
              <i className="bi bi-currency-exchange"></i>
            </div>
            <div>
              <span className="font-bold text-white text-lg tracking-tight">FinPulse</span>
              <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">Personal Finance Advisor</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onQuickDemoLogin}
              className="text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 px-4 py-2 rounded-lg transition-all shadow-xs"
            >
              Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Subtle kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs font-medium text-emerald-400 mx-auto mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Personal Finance & Expense Management Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Intelligent Expense Tracking & Rule-Based Personal Finance Advisor
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A modern personal finance and advisory platform featuring real-time cashflow analytics, dynamic category budgets, CSV exports, and deterministic 50/30/20 heuristic recommendations.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onQuickDemoLogin}
            className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md flex items-center gap-2"
          >
            <i className="bi bi-speedometer2"></i>
            <span>Explore Dashboard (Alex Rivera)</span>
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
          >
            <i className="bi bi-person-plus"></i>
            <span>Register New Account</span>
          </button>
        </div>

        {/* Core Pillars Banner */}
        <div className="mt-16 pt-10 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Inflows</div>
            <div className="text-sm font-bold text-white mt-1">Multi-Source</div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Budgets</div>
            <div className="text-sm font-bold text-white mt-1">Dynamic Caps</div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Security</div>
            <div className="text-sm font-bold text-white mt-1">Encrypted Sessions</div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Exports</div>
            <div className="text-sm font-bold text-white mt-1">PapaParse CSV</div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Visuals</div>
            <div className="text-sm font-bold text-white mt-1">Chart.js Engine</div>
          </div>
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-400 font-mono">Advisor</div>
            <div className="text-sm font-bold text-white mt-1">50/30/20 Rules</div>
          </div>
        </div>
      </section>

      {/* Feature Breakdown Grid */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Enterprise-Grade Personal Finance
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Every component adheres to Clean Architecture, strict input validation, and transparent financial principles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <i className="bi bi-wallet2"></i>
              </div>
              <h3 className="text-base font-bold text-white">Full Income & Expense Tracking</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Atomic CRUD operations with BigDecimal financial precision, payment methods, multi-category tags, and instant balance recalculation.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <i className="bi bi-sliders"></i>
              </div>
              <h3 className="text-base font-bold text-white">Monthly Dynamic Budgets</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Category spending limits with tri-state threshold alerts (Normal, Approaching 80%, Overbudget 100%) and utilization progress bars.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl mb-4">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3 className="text-base font-bold text-white">Zero-Cost Heuristic Advisor</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Transparent rule engine evaluating 50/30/20 budget allocations, savings rates, burn rates, and actionable tips with calculated savings impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-400">
        <div>FinPulse — Expense Tracker & Personal Finance Advisory System</div>
        <div className="text-slate-400 mt-1 font-mono text-[11px]">Personal Finance Management · Chart.js Visuals · Automated 50/30/20 Advisory Engine</div>
      </footer>
    </div>
  );
};
