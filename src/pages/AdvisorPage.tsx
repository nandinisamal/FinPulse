import React, { useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { User, ExpenseCategory } from '../types/finance';

interface AdvisorPageProps {
  user: User;
}

export const AdvisorPage: React.FC<AdvisorPageProps> = ({ user }) => {
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const advisorData = useMemo(() => apiService.getAdvisorAnalysis(selectedMonth), [selectedMonth]);

  // Simulator State: allow user to test hypothetical category cuts
  const [simulatedCuts, setSimulatedCuts] = useState<Record<string, number>>({});

  const handleCutChange = (category: string, percentCut: number) => {
    setSimulatedCuts((prev) => ({
      ...prev,
      [category]: percentCut,
    }));
  };

  // Calculate simulated savings impact
  const simulatedSavings = useMemo(() => {
    let totalCutAmount = 0;
    for (const [cat, cutPercent] of Object.entries(simulatedCuts)) {
      const orig = advisorData.categoryTotals[cat] || 0;
      totalCutAmount += orig * (cutPercent / 100);
    }
    const newNet = advisorData.netCashflow + totalCutAmount;
    const newRate = advisorData.totalIncome > 0 ? (newNet / advisorData.totalIncome) * 100 : 0;
    return {
      monthlySaved: totalCutAmount,
      annualSaved: totalCutAmount * 12,
      newSavingsRate: Math.max(0, Math.round(newRate * 10) / 10),
    };
  }, [simulatedCuts, advisorData]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Banner */}
      <div className="fin-card p-5 border-l-4 border-l-emerald-500 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-base font-bold text-slate-900">
              Rule-Based Personal Finance Advisory Engine
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Deterministic financial heuristics grounded in quantitative economics and the 50/30/20 balanced budget model. Every recommendation includes explicit mathematical justification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Cycle:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 bg-white"
          />
        </div>
      </div>

      {/* 50/30/20 Balanced Budget Model Overview */}
      <div className="fin-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              50/30/20 Budget Heuristic Framework
            </h3>
            <span className="text-xs text-slate-500">
              Benchmark allocation of monthly take-home income ({user.currency}{advisorData.totalIncome.toLocaleString()})
            </span>
          </div>
          <div className="text-xs font-semibold text-slate-600 font-mono">
            Total Income: {user.currency}{advisorData.totalIncome.toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Needs (Essentials)</span>
              <span className="text-[11px] font-mono text-slate-500">Target: 50%</span>
            </div>
            <div className="text-xl font-bold font-numeric text-slate-900 mt-2">
              {advisorData.fiftyThirtyTwenty.needs.percentage}%
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                ({user.currency}{advisorData.fiftyThirtyTwenty.needs.amount.toLocaleString()})
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${
                  advisorData.fiftyThirtyTwenty.needs.percentage > 55 ? 'bg-amber-500' : 'bg-slate-700'
                }`}
                style={{ width: `${Math.min(100, advisorData.fiftyThirtyTwenty.needs.percentage)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Bills, Healthcare, Education, and essential groceries.
            </p>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Wants (Discretionary)</span>
              <span className="text-[11px] font-mono text-slate-500">Target: 30%</span>
            </div>
            <div className="text-xl font-bold font-numeric text-slate-900 mt-2">
              {advisorData.fiftyThirtyTwenty.wants.percentage}%
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                ({user.currency}{advisorData.fiftyThirtyTwenty.wants.amount.toLocaleString()})
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className={`h-1.5 rounded-full ${
                  advisorData.fiftyThirtyTwenty.wants.percentage > 35 ? 'bg-rose-500' : 'bg-slate-700'
                }`}
                style={{ width: `${Math.min(100, advisorData.fiftyThirtyTwenty.wants.percentage)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Shopping, Dining out, Entertainment, and Travel.
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Savings & Investing</span>
              <span className="text-[11px] font-mono text-slate-500">Target: 20%</span>
            </div>
            <div className="text-xl font-bold font-numeric text-emerald-600 mt-2">
              {advisorData.fiftyThirtyTwenty.savings.percentage}%
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                ({user.currency}{advisorData.fiftyThirtyTwenty.savings.amount.toLocaleString()})
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="h-1.5 rounded-full bg-emerald-500"
                style={{ width: `${Math.min(100, advisorData.fiftyThirtyTwenty.savings.percentage)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Net unspent liquidity available for emergency buffer or growth.
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Recommendations Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>Active Recommendations & Diagnosis</span>
          <span className="text-xs text-slate-500 font-normal">
            ({advisorData.recommendations.length} evaluation triggers)
          </span>
        </h3>

        {advisorData.recommendations.map((rec) => {
          const isCritical = rec.type === 'critical';
          const isWarning = rec.type === 'warning';
          const isPositive = rec.type === 'positive';

          return (
            <div
              key={rec.id}
              className={`fin-card p-5 border-l-4 ${
                isCritical
                  ? 'border-l-rose-500'
                  : isWarning
                  ? 'border-l-amber-500'
                  : isPositive
                  ? 'border-l-emerald-500'
                  : 'border-l-indigo-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                    isCritical
                      ? 'bg-rose-100 text-rose-700'
                      : isWarning
                      ? 'bg-amber-100 text-amber-700'
                      : isPositive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <i className={`bi ${
                      isCritical
                        ? 'bi-exclamation-triangle-fill'
                        : isWarning
                        ? 'bi-exclamation-circle-fill'
                        : isPositive
                        ? 'bi-check-circle-fill'
                        : 'bi-lightbulb-fill'
                    }`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {rec.message}
                    </p>
                  </div>
                </div>

                {rec.potentialSavings && (
                  <div className="shrink-0 text-right sm:pl-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Target Savings
                    </span>
                    <span className="text-sm font-bold font-numeric text-emerald-600">
                      ~{user.currency}{rec.potentialSavings.toLocaleString()}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Data Reasoning & Suggested Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    Data Rationale:
                  </span>
                  <span className="text-slate-500 text-[11px] leading-relaxed">
                    {rec.reason}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="font-semibold text-emerald-800 block mb-0.5">
                    Prescribed Action:
                  </span>
                  <span className="text-emerald-700 text-[11px] leading-relaxed">
                    {rec.suggestedAction}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Savings Simulator */}
      <div className="fin-card p-5 bg-linear-to-b from-white to-slate-50/60">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <i className="bi bi-sliders text-emerald-600 text-base"></i>
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Financial Optimization Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Adjust hypothetical percentage reductions in discretionary categories to see projected annual savings impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sliders */}
          <div className="lg:col-span-2 space-y-4">
            {['Food', 'Shopping', 'Entertainment', 'Travel'].map((cat) => {
              const currentAmount = advisorData.categoryTotals[cat] || 0;
              const cut = simulatedCuts[cat] || 0;
              const saved = currentAmount * (cut / 100);

              return (
                <div key={cat} className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat}</span>
                    <span className="font-mono text-slate-600">
                      Current: {user.currency}{currentAmount.toLocaleString()} · Cut: <strong className="text-emerald-600">{cut}%</strong> (-{user.currency}{Math.round(saved).toLocaleString()})
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={cut}
                    onChange={(e) => handleCutChange(cat, parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0%</span>
                    <span>25% cut</span>
                    <span>50% max cut</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Results Summary Box */}
          <div className="fin-card p-5 bg-slate-900 text-white flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Simulation Projection
              </span>

              <div className="mt-4">
                <span className="text-xs text-slate-400 block">Monthly Savings Boost</span>
                <div className="text-2xl font-bold font-numeric text-emerald-400 mt-0.5">
                  +{user.currency}{Math.round(simulatedSavings.monthlySaved).toLocaleString()}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-400 block">Projected 12-Month Compound</span>
                <div className="text-xl font-bold font-numeric text-white mt-0.5">
                  +{user.currency}{Math.round(simulatedSavings.annualSaved).toLocaleString()}
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs text-slate-400 block">Adjusted Savings Rate</span>
                <div className="text-lg font-bold font-numeric text-emerald-400 mt-0.5">
                  {simulatedSavings.newSavingsRate}% (was {advisorData.savingsRate.toFixed(1)}%)
                </div>
              </div>
            </div>

            <button
              onClick={() => setSimulatedCuts({})}
              className="mt-4 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Reset Simulator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
