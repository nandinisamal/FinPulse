import React, { useState, useMemo } from 'react';
import { ChartWrapper } from '../components/ChartWrapper';
import { MonthlyReportView } from '../components/MonthlyReportView';
import { apiService } from '../services/apiService';
import { User } from '../types/finance';

interface AnalyticsPageProps {
  user: User;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'reports'>('trends');
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const monthlyData = useMemo(() => apiService.getMonthlyAnalytics(), []);
  const advisorData = useMemo(() => apiService.getAdvisorAnalysis(currentMonthStr), [currentMonthStr]);
  const expenses = useMemo(() => apiService.getExpenses(), []);

  // Compute Daily Average & Peak Day for Current Month
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentMonthStr));
  }, [expenses, currentMonthStr]);

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = Math.min(new Date().getDate(), daysInMonth);
  const dailyAverage = currentMonthExpenses.length > 0
    ? advisorData.totalExpense / Math.max(1, currentDay)
    : 0;

  // Find highest expense
  const highestExpense = useMemo(() => {
    if (currentMonthExpenses.length === 0) return null;
    return [...currentMonthExpenses].sort((a, b) => Number(b.amount) - Number(a.amount))[0];
  }, [currentMonthExpenses]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const exp of currentMonthExpenses) {
      counts[exp.paymentMethod] = (counts[exp.paymentMethod] || 0) + Number(exp.amount);
    }
    return counts;
  }, [currentMonthExpenses]);

  // 1. Chart: 6-Month Income vs Expense Trend
  const trendChartConfig = useMemo(() => {
    return {
      type: 'bar' as const,
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Total Income',
            data: monthlyData.incomeData,
            backgroundColor: '#10b981',
            borderRadius: 4,
          },
          {
            label: 'Total Expenses',
            data: monthlyData.expenseData,
            backgroundColor: '#0f172a',
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
            labels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.dataset.label}: ${user.currency}${Number(ctx.raw).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (val: any) => `${user.currency}${val}`,
              font: { family: "'JetBrains Mono', monospace" },
            },
          },
        },
      },
    };
  }, [monthlyData, user.currency]);

  // 2. Chart: Net Savings Trajectory (Line Chart)
  const savingsChartConfig = useMemo(() => {
    return {
      type: 'line' as const,
      data: {
        labels: monthlyData.labels,
        datasets: [
          {
            label: 'Net Monthly Savings',
            data: monthlyData.savingsData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#10b981',
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` Savings: ${user.currency}${Number(ctx.raw).toLocaleString()}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: {
              callback: (val: any) => `${user.currency}${val}`,
              font: { family: "'JetBrains Mono', monospace" },
            },
          },
        },
      },
    };
  }, [monthlyData, user.currency]);

  // 3. Category Pie Chart
  const categoryChartConfig = useMemo(() => {
    const cats = Object.keys(advisorData.categoryTotals);
    const vals = Object.values(advisorData.categoryTotals);
    const colors = ['#0f172a', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

    return {
      type: 'doughnut' as const,
      data: {
        labels: cats.length > 0 ? cats : ['No data'],
        datasets: [
          {
            data: vals.length > 0 ? vals : [1],
            backgroundColor: vals.length > 0 ? colors.slice(0, cats.length) : ['#e2e8f0'],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' as const, labels: { boxWidth: 10, font: { size: 10 } } },
          tooltip: {
            callbacks: {
              label: (ctx: any) => ` ${ctx.label}: ${user.currency}${Number(ctx.raw).toLocaleString()}`,
            },
          },
        },
        cutout: '68%',
      },
    };
  }, [advisorData.categoryTotals, user.currency]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Navigation View Switcher */}
      <div className="fin-card p-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'trends'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="bi bi-graph-up text-emerald-600"></i>
            <span>Spending Trends & Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="bi bi-file-earmark-pdf text-rose-500"></i>
            <span>Monthly Reports & PDF</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold ml-0.5">
              New
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-500 pr-2 hidden sm:block">
          {activeTab === 'trends' ? 'Visual cashflow trajectory & velocity' : 'Executive financial statement generator'}
        </div>
      </div>

      {activeTab === 'reports' ? (
        <MonthlyReportView user={user} />
      ) : (
        <>
          {/* Top Banner Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Daily Burn Rate
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {user.currency}{dailyAverage.toFixed(2)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Across {currentDay} days this month
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Highest Single Expense
          </span>
          <div className="text-2xl font-bold font-numeric text-rose-600 mt-1">
            {highestExpense ? `${user.currency}${Number(highestExpense.amount).toLocaleString()}` : '—'}
          </div>
          <span className="text-xs text-slate-400 mt-1 block truncate">
            {highestExpense ? highestExpense.description : 'No records'}
          </span>
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Average Savings Rate (6M)
          </span>
          {(() => {
            const validMonths = monthlyData.incomeData.filter(i => i > 0).length;
            const avgRate = validMonths > 0
              ? Math.round(
                  monthlyData.incomeData.reduce((acc, inc, idx) => {
                    const exp = monthlyData.expenseData[idx];
                    return acc + (inc > 0 ? ((inc - exp) / inc) * 100 : 0);
                  }, 0) / validMonths
                )
              : 0;
            return (
              <div>
                <div className="text-2xl font-bold font-numeric text-emerald-600 mt-1">
                  {avgRate}%
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Target benchmark: {user.savingsTargetGoal}%
                </span>
              </div>
            );
          })()}
        </div>

        <div className="fin-card p-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Discretionary Ratio
          </span>
          <div className="text-2xl font-bold font-numeric text-slate-900 mt-1">
            {advisorData.fiftyThirtyTwenty.wants.percentage}%
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Target cap: 30% of income
          </span>
        </div>
      </div>

      {/* Row 2: Charts (Monthly Comparison & Net Savings Trajectory) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="fin-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              6-Month Income vs. Expense Trends
            </h3>
            <span className="text-xs text-slate-500">
              Bar comparison evaluating cash velocity
            </span>
          </div>
          <ChartWrapper config={trendChartConfig} height={250} />
        </div>

        <div className="fin-card p-5">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Net Savings Trajectory Curve
            </h3>
            <span className="text-xs text-slate-500">
              Accumulated monthly liquidity growth
            </span>
          </div>
          <ChartWrapper config={savingsChartConfig} height={250} />
        </div>
      </div>

      {/* Row 3: Category Breakdown & Payment Method Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="fin-card p-5 lg:col-span-1">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Category Spending Share
            </h3>
            <span className="text-xs text-slate-500">
              Current month proportions
            </span>
          </div>
          <ChartWrapper config={categoryChartConfig} height={230} />
        </div>

        <div className="fin-card p-5 lg:col-span-2">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Payment Method Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              Distribution of spending across cards, transfer, and cash
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(paymentBreakdown).map(([method, amount]) => {
              const pct = advisorData.totalExpense > 0
                ? Math.round((amount / advisorData.totalExpense) * 100)
                : 0;

              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{method}</span>
                    <span className="font-mono text-slate-600">
                      {user.currency}{amount.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-slate-800 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
