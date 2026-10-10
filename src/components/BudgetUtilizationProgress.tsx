import React, { useState, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { User, ExpenseCategory, BudgetStatus } from '../types/finance';

interface BudgetUtilizationProgressProps {
  user: User;
  onNavigateToBudgets: () => void;
  monthFilter?: string; // YYYY-MM
}

// Category icon map for visual flair
const CATEGORY_ICONS: Record<string, string> = {
  Food: 'bi-cup-hot',
  Travel: 'bi-airplane',
  Shopping: 'bi-bag',
  Bills: 'bi-lightning-charge',
  Education: 'bi-mortarboard',
  Healthcare: 'bi-heart-pulse',
  Entertainment: 'bi-controller',
  Other: 'bi-tags',
};

export const BudgetUtilizationProgress: React.FC<BudgetUtilizationProgressProps> = ({
  user,
  onNavigateToBudgets,
  monthFilter,
}) => {
  const currentMonth = monthFilter || new Date().toISOString().slice(0, 7);
  const [filterState, setFilterState] = useState<'all' | 'alert' | 'safe'>('all');

  // Fetch current budget & spending state from API service
  const advisorData = useMemo(() => {
    return apiService.getAdvisorAnalysis(currentMonth);
  }, [currentMonth]);

  const budgetStatuses: BudgetStatus[] = advisorData.budgetStatuses;

  // Rollup totals
  const totalLimit = useMemo(() => {
    return budgetStatuses.reduce((acc, b) => acc + Number(b.limitAmount), 0);
  }, [budgetStatuses]);

  const totalSpent = useMemo(() => {
    return budgetStatuses.reduce((acc, b) => acc + Number(b.spent), 0);
  }, [budgetStatuses]);

  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  // Filtered list
  const filteredBudgets = useMemo(() => {
    if (filterState === 'alert') {
      return budgetStatuses.filter((b) => b.status === 'danger' || b.status === 'warning');
    }
    if (filterState === 'safe') {
      return budgetStatuses.filter((b) => b.status === 'safe');
    }
    return budgetStatuses;
  }, [budgetStatuses, filterState]);

  const dangerCount = budgetStatuses.filter((b) => b.status === 'danger').length;
  const warningCount = budgetStatuses.filter((b) => b.status === 'warning').length;

  return (
    <div className="fin-card p-5 h-full flex flex-col justify-between">
      {/* Header with Title and Action Link */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xs">
                <i className="bi bi-pie-chart-fill"></i>
              </div>
              <h2 className="text-sm font-bold text-slate-900">
                Budget Utilization Tracker
              </h2>
            </div>
            <span className="text-xs text-slate-500 mt-0.5 block">
              Real-time category spending vs. monthly allocations
            </span>
          </div>

          <button
            onClick={onNavigateToBudgets}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>Manage Caps</span>
            <i className="bi bi-chevron-right text-[10px]"></i>
          </button>
        </div>

        {/* Global Summary Progress Meter */}
        {budgetStatuses.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">
                Overall Budget Health
              </span>
              <span className="font-numeric text-slate-900 font-bold">
                {user.currency}{totalSpent.toLocaleString()} / {user.currency}{totalLimit.toLocaleString()}
                <span className="text-slate-500 font-normal ml-1">({overallPercentage}%)</span>
              </span>
            </div>

            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  overallPercentage >= 100
                    ? 'bg-rose-500'
                    : overallPercentage >= 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overallPercentage)}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                {dangerCount > 0 && (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <i className="bi bi-exclamation-octagon-fill text-[10px]"></i>
                    {dangerCount} exceeded
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="text-amber-600 font-semibold flex items-center gap-1">
                    <i className="bi bi-exclamation-triangle-fill text-[10px]"></i>
                    {warningCount} near cap
                  </span>
                )}
                {dangerCount === 0 && warningCount === 0 && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <i className="bi bi-check-circle-fill text-[10px]"></i>
                    All within limits
                  </span>
                )}
              </div>

              {/* Segmented filter tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-200/70 rounded-md text-[10px]">
                <button
                  onClick={() => setFilterState('all')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    filterState === 'all'
                      ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({budgetStatuses.length})
                </button>
                {(dangerCount > 0 || warningCount > 0) && (
                  <button
                    onClick={() => setFilterState('alert')}
                    className={`px-1.5 py-0.5 rounded transition-colors ${
                      filterState === 'alert'
                        ? 'bg-white text-rose-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Alerts ({dangerCount + warningCount})
                  </button>
                )}
                <button
                  onClick={() => setFilterState('safe')}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    filterState === 'safe'
                      ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Safe
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {budgetStatuses.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <i className="bi bi-piggy-bank text-3xl block mb-2 text-slate-300"></i>
            <span className="text-xs text-slate-600 font-medium block">
              No active budgets found for this month.
            </span>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1 mb-3">
              Establish category spending caps to activate threshold progress bars.
            </p>
            <button
              onClick={onNavigateToBudgets}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              + Create Category Budget
            </button>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No category budgets match the "{filterState}" filter.
          </div>
        ) : (
          /* Individual Category Progress Bars List */
          <div className="space-y-3.5 mt-2">
            {filteredBudgets.map((b) => {
              const isOver = b.status === 'danger';
              const isWarning = b.status === 'warning';
              const iconClass = CATEGORY_ICONS[b.category] || 'bi-tag';

              // Dynamic styling by threshold
              const barColor = isOver
                ? 'bg-linear-to-r from-rose-500 to-rose-600'
                : isWarning
                ? 'bg-linear-to-r from-amber-500 to-amber-600'
                : 'bg-linear-to-r from-emerald-500 to-emerald-600';

              const badgeColor = isOver
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isWarning
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

              return (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs">
                        <i className={`bi ${iconClass}`}></i>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {b.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-slate-900 font-bold text-xs">
                        {user.currency}{b.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {' '}/ {user.currency}{b.limitAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar Container */}
                  <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ease-out ${barColor}`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    ></div>
                  </div>

                  {/* Footer Metrics Row */}
                  <div className="mt-1.5 flex items-center justify-between text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border font-semibold ${badgeColor}`}>
                      {b.percentage}% utilized
                    </span>

                    <span
                      className={`font-mono text-[11px] ${
                        isOver
                          ? 'text-rose-600 font-bold'
                          : isWarning
                          ? 'text-amber-600 font-semibold'
                          : 'text-slate-500'
                      }`}
                    >
                      {isOver
                        ? `Exceeded by ${user.currency}${Math.abs(b.remaining).toLocaleString()}`
                        : `${user.currency}${b.remaining.toLocaleString()} remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Insight */}
      {budgetStatuses.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Threshold: 80% Warning · 100% Exceeded</span>
          <span className="font-mono">Cycle: {currentMonth}</span>
        </div>
      )}
    </div>
  );
};
