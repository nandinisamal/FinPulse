import React, { useMemo } from 'react';
import { MetricCard } from '../components/MetricCard';
import { ChartWrapper } from '../components/ChartWrapper';
import { BudgetUtilizationProgress } from '../components/BudgetUtilizationProgress';
import { apiService } from '../services/apiService';
import { User } from '../types/finance';
import { NavPage } from '../components/Sidebar';

interface DashboardPageProps {
  user: User;
  onNavigate: (page: NavPage) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);

  // Fetch live calculated data from API service
  const summary = useMemo(() => apiService.getDashboardSummary(currentMonthStr), [currentMonthStr]);
  const advisorData = useMemo(() => apiService.getAdvisorAnalysis(currentMonthStr), [currentMonthStr]);
  const monthlyTrends = useMemo(() => apiService.getMonthlyAnalytics(), []);
  const recentTransactions = useMemo(() => apiService.getUnifiedTransactions().slice(0, 6), []);

  // 1. Chart Config: Income vs Expenses (Bar Chart)
  const barChartConfig = useMemo(() => {
    return {
      type: 'bar' as const,
      data: {
        labels: monthlyTrends.labels,
        datasets: [
          {
            label: 'Income',
            data: monthlyTrends.incomeData,
            backgroundColor: '#10b981', // emerald-500
            borderRadius: 4,
          },
          {
            label: 'Expenses',
            data: monthlyTrends.expenseData,
            backgroundColor: '#0f172a', // navy-900
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              boxWidth: 12,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 },
              color: '#475569',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { size: 12, weight: 'bold' as const },
            bodyFont: { size: 11 },
            callbacks: {
              label: (ctx: any) => ` ${ctx.dataset.label}: ${user.currency}${ctx.raw.toLocaleString()}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" }, color: '#64748b' },
          },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              font: { size: 11, family: "'JetBrains Mono', monospace" },
              color: '#64748b',
              callback: (val: any) => `${user.currency}${val}`,
            },
          },
        },
      },
    };
  }, [monthlyTrends, user.currency]);

  // 2. Chart Config: Category-wise Expenses (Doughnut Chart)
  const categoryChartConfig = useMemo(() => {
    const cats = Object.keys(advisorData.categoryTotals);
    const amounts = Object.values(advisorData.categoryTotals);
    const colors = [
      '#0f172a', // Navy
      '#10b981', // Emerald
      '#3b82f6', // Blue
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#8b5cf6', // Violet
      '#06b6d4', // Cyan
      '#64748b', // Slate
    ];

    return {
      type: 'doughnut' as const,
      data: {
        labels: cats.length > 0 ? cats : ['No Expenses'],
        datasets: [
          {
            data: amounts.length > 0 ? amounts : [1],
            backgroundColor: amounts.length > 0 ? colors.slice(0, cats.length) : ['#e2e8f0'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right' as const,
            labels: {
              boxWidth: 10,
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 10 },
              color: '#475569',
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${user.currency}${Number(ctx.raw).toLocaleString()}`,
            },
          },
        },
        cutout: '72%',
      },
    };
  }, [advisorData.categoryTotals, user.currency]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Monthly Income"
          value={`${user.currency}${summary.totalMonthlyIncome.toLocaleString()}`}
          subtext={`Target: ${user.currency}${user.monthlyIncomeTarget.toLocaleString()}`}
          icon="bi-graph-up-arrow"
          accentColor="emerald"
          trend={{
            positive: summary.incomeTargetMet,
            text: summary.incomeTargetMet ? 'Target reached' : 'Pacing target',
          }}
        />

        <MetricCard
          title="Total Monthly Expenses"
          value={`${user.currency}${summary.totalMonthlyExpenses.toLocaleString()}`}
          subtext={
            summary.topExpenseCategory
              ? `Top: ${summary.topExpenseCategory.category} (${summary.topExpenseCategory.percentage}%)`
              : 'All categorized'
          }
          icon="bi-graph-down-arrow"
          accentColor="navy"
          trend={{
            positive: summary.totalMonthlyExpenses <= summary.totalMonthlyIncome,
            text: `${summary.totalMonthlyIncome > 0 ? Math.round((summary.totalMonthlyExpenses / summary.totalMonthlyIncome) * 100) : 0}% of income`,
          }}
        />

        <MetricCard
          title="Available Balance (Net)"
          value={`${user.currency}${summary.availableBalance.toLocaleString()}`}
          subtext="Net liquidity surplus"
          icon="bi-wallet2"
          accentColor={summary.availableBalance >= 0 ? 'emerald' : 'rose'}
          trend={{
            positive: summary.availableBalance >= 0,
            text: summary.availableBalance >= 0 ? 'Cash positive' : 'Deficit alert',
          }}
        />

        <MetricCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          subtext={`Target: ${summary.targetSavingsRate}%`}
          icon="bi-piggy-bank"
          accentColor={summary.savingsRate >= summary.targetSavingsRate ? 'emerald' : 'amber'}
          trend={{
            positive: summary.savingsRate >= summary.targetSavingsRate,
            text: summary.savingsRate >= summary.targetSavingsRate ? 'Above goal' : 'Below goal',
          }}
        />
      </div>

      {/* Row 2: Charts (Monthly Comparison & Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart */}
        <div className="fin-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Monthly Income vs. Expenses
              </h2>
              <span className="text-xs text-slate-500">
                Rolling 6-month historical cashflow comparison
              </span>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Detailed Trends</span>
              <i className="bi bi-chevron-right text-[10px]"></i>
            </button>
          </div>
          <ChartWrapper config={barChartConfig} height={240} />
        </div>

        {/* Category-wise Expenses Donut */}
        <div className="fin-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Category Spending
              </h2>
              <span className="text-xs text-slate-500">
                Distribution this month
              </span>
            </div>
            <button
              onClick={() => onNavigate('expenses')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              View All
            </button>
          </div>
          <ChartWrapper config={categoryChartConfig} height={240} />
        </div>
      </div>

      {/* Row 3: Budget Utilization Progress & Personalized Advisor Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Individual Category Budget Utilization Progress Bars */}
        <div className="lg:col-span-1">
          <BudgetUtilizationProgress
            user={user}
            onNavigateToBudgets={() => onNavigate('budgets')}
            monthFilter={currentMonthStr}
          />
        </div>

        {/* Right: Personalized Finance Recommendations & Recent Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Advisor Highlight Card */}
          <div className="fin-card p-5 border-l-4 border-l-emerald-500 bg-linear-to-r from-emerald-50/40 to-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-base">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Rule-Based Advisor Insights
                  </h3>
                  <span className="text-xs text-slate-500">
                    Transparent mathematical evaluation of your cashflow
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('advisor')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Full Advisory Report</span>
                <i className="bi bi-arrow-right text-[10px]"></i>
              </button>
            </div>

            {advisorData.recommendations.length > 0 ? (
              <div className="mt-3.5 space-y-2.5">
                {advisorData.recommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-lg bg-white border border-slate-200/80 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <span className={`w-2 h-2 rounded-full ${
                        rec.type === 'critical' ? 'bg-rose-500' :
                        rec.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}></span>
                      <span>{rec.title}</span>
                      {rec.potentialSavings && (
                        <span className="ml-auto font-mono text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Save ~{user.currency}{rec.potentialSavings.toLocaleString()}/mo
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {rec.message}
                    </p>
                    <div className="mt-1.5 text-[11px] text-slate-500 italic">
                      {rec.reason}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-600">
                All metrics align with healthy financial practices. Keep tracking daily expenses!
              </p>
            )}
          </div>

          {/* Recent Transactions List */}
          <div className="fin-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Transactions
                </h3>
                <span className="text-xs text-slate-500">
                  Latest recorded income and expenses
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenQuickAdd}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Add
                </button>
                <button
                  onClick={() => onNavigate('transactions')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  View All
                </button>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No recent transactions. Add your first record.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => {
                  const isInc = tx.type === 'INCOME';
                  return (
                    <div
                      key={tx.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50/50 px-1 rounded transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                            isInc
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <i className={`bi ${isInc ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                            {tx.title}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{tx.category}</span>
                            <span>·</span>
                            <span>{tx.date}</span>
                            {tx.paymentMethod && (
                              <>
                                <span>·</span>
                                <span>{tx.paymentMethod}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`text-xs font-bold font-numeric ${
                          isInc ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isInc ? '+' : '-'}{user.currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
