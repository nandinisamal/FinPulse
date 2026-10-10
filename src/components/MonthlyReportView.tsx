import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiService } from '../services/apiService';
import { User, Income, Expense, BudgetStatus } from '../types/finance';

interface MonthlyReportViewProps {
  user: User;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({ user }) => {
  const currentMonthStr = useMemo(() => new Date().toISOString().slice(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Calculate selected month stats
  const incomes: Income[] = useMemo(() => {
    return apiService.getIncomes().filter((i) => i.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  const expenses: Expense[] = useMemo(() => {
    return apiService.getExpenses().filter((e) => e.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  const advisorData = useMemo(() => {
    return apiService.getAdvisorAnalysis(selectedMonth);
  }, [selectedMonth]);

  const totalIncome = useMemo(() => {
    return incomes.reduce((acc, i) => acc + Number(i.amount), 0);
  }, [incomes]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  }, [expenses]);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 && netBalance > 0
    ? Math.round((netBalance / totalIncome) * 1000) / 10
    : 0;

  // Month label e.g., "October 2026"
  const formattedMonthLabel = useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return d.toLocaleDateString('default', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // Quick month navigators
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    setSelectedMonth(d.toISOString().slice(0, 7));
  };

  // Generate and Download PDF using jsPDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setFeedbackMessage(null);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;
      let y = margin;

      // 1. Header Banner (Navy theme)
      doc.setFillColor(15, 23, 42); // Navy slate-900
      doc.rect(0, 0, pageWidth, 80, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('FinPulse Financial Performance Report', margin, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Monthly Statement · ${formattedMonthLabel}`, margin, 60);

      const generatedDateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      doc.text(`Generated: ${generatedDateStr}`, pageWidth - margin - 110, 60);

      y = 105;

      // 2. Account Profile & Summary Subheader
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Account Overview', margin, y);

      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`User: ${user.name} (${user.email})`, margin, y);
      doc.text(`Currency: ${user.currency} (INR)`, margin + 200, y);
      doc.text(`Income Target: ${user.currency}${user.monthlyIncomeTarget.toLocaleString('en-IN')}`, margin + 350, y);

      y += 20;

      // 3. Executive Summary KPI Table
      const summaryRows = [
        [
          'Total Monthly Income',
          `${user.currency}${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${incomes.length} deposit record(s)`,
        ],
        [
          'Total Monthly Expenses',
          `${user.currency}${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `${expenses.length} transaction(s)`,
        ],
        [
          'Net Balance (Surplus / Deficit)',
          `${netBalance >= 0 ? '+' : ''}${user.currency}${netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          netBalance >= 0 ? 'Liquid Cash Surplus' : 'Deficit Alert',
        ],
        [
          'Actual Savings Rate',
          `${savingsRate}%`,
          `Target: ${user.savingsTargetGoal}% (${savingsRate >= user.savingsTargetGoal ? 'Achieved' : 'Below benchmark'})`,
        ],
      ];

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Performance Metric', 'Amount', 'Status / Detail']],
        body: summaryRows,
        theme: 'striped',
        headStyles: {
          fillColor: [16, 185, 129], // emerald-500
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9.5,
        },
        styles: {
          fontSize: 9,
          cellPadding: 5.5,
          font: 'helvetica',
        },
        columnStyles: {
          0: { cellWidth: 180, fontStyle: 'bold' },
          1: { cellWidth: 150, halign: 'right' },
          2: { fontStyle: 'normal' },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 25;

      // 4. 50/30/20 Budget Framework Allocation Table
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('50/30/20 Financial Heuristic Analysis', margin, y);

      y += 10;
      const fiftyThirtyRows = [
        [
          'Needs (50% Target)',
          `${user.currency}${advisorData.fiftyThirtyTwenty.needs.amount.toLocaleString('en-IN')}`,
          `${advisorData.fiftyThirtyTwenty.needs.percentage}%`,
          advisorData.fiftyThirtyTwenty.needs.percentage <= 55 ? 'Optimal Allocation' : 'High Essential Outflows',
        ],
        [
          'Wants (30% Target)',
          `${user.currency}${advisorData.fiftyThirtyTwenty.wants.amount.toLocaleString('en-IN')}`,
          `${advisorData.fiftyThirtyTwenty.wants.percentage}%`,
          advisorData.fiftyThirtyTwenty.wants.percentage <= 35 ? 'Controlled Discretionary' : 'Discretionary Overspending',
        ],
        [
          'Savings (20% Target)',
          `${user.currency}${advisorData.fiftyThirtyTwenty.savings.amount.toLocaleString('en-IN')}`,
          `${advisorData.fiftyThirtyTwenty.savings.percentage}%`,
          advisorData.fiftyThirtyTwenty.savings.percentage >= 20 ? 'Target Met' : 'Shortfall Below Benchmark',
        ],
      ];

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Budget Pillar', 'Expenditure', '% of Total Income', 'Diagnostic Evaluation']],
        body: fiftyThirtyRows,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59], // slate-800
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'center' },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 25;

      // 5. Category-wise Spending & Budget Performance
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Category Spending & Budget Limits', margin, y);

      y += 10;
      const categoryRows = Object.entries(advisorData.categoryTotals).map(([cat, amount]) => {
        const budget = advisorData.budgetStatuses.find((b) => b.category === cat);
        const limitStr = budget ? `${user.currency}${budget.limitAmount.toLocaleString('en-IN')}` : 'No limit set';
        const pctStr = budget ? `${budget.percentage}%` : 'N/A';
        const status = budget
          ? budget.status === 'danger'
            ? 'EXCEEDED'
            : budget.status === 'warning'
            ? 'NEAR CAP'
            : 'NORMAL'
          : 'UNBUDGETED';

        return [
          cat,
          `${user.currency}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          limitStr,
          pctStr,
          status,
        ];
      });

      if (categoryRows.length === 0) {
        categoryRows.push(['No expenses recorded for this month', '-', '-', '-', '-']);
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Category', 'Amount Spent', 'Budget Limit', 'Utilization', 'Status']],
        body: categoryRows,
        theme: 'striped',
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: { fontSize: 8.5, cellPadding: 5 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'center' },
          4: { halign: 'center', fontStyle: 'bold' },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 25;

      // 6. Advisor Recommendations Section
      if (y > 700) {
        doc.addPage();
        y = margin;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Advisor Diagnosis & Action Items', margin, y);

      y += 10;
      const recRows = advisorData.recommendations.map((r) => [
        r.type.toUpperCase(),
        r.title,
        r.message,
        r.suggestedAction,
      ]);

      if (recRows.length === 0) {
        recRows.push(['POSITIVE', 'Healthy Financial Discipline', 'All metrics align with healthy standards.', 'Maintain positive cashflow pace.']);
      }

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Priority', 'Trigger Title', 'Financial Diagnosis', 'Suggested Action']],
        body: recRows,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        styles: { fontSize: 8, cellPadding: 4.5 },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold' },
          1: { cellWidth: 100, fontStyle: 'bold' },
          2: { cellWidth: 180 },
        },
      });

      // Footer disclaimer & page count
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `FinPulse Automated Personal Finance Statement · Page ${i} of ${pageCount}`,
          margin,
          doc.internal.pageSize.getHeight() - 20
        );
      }

      // Save and trigger browser download
      const filename = `FinPulse_Report_${selectedMonth}.pdf`;
      doc.save(filename);

      setFeedbackMessage(`Monthly PDF Statement successfully generated and downloaded: "${filename}"`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedbackMessage('Failed to compile PDF document. Please verify data.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <i className="bi bi-file-earmark-pdf-fill text-emerald-600 text-sm"></i>
            <span>{feedbackMessage}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Control Bar: Month Selector & Download Button */}
      <div className="fin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-slate-900 to-slate-800 text-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm font-bold">
              <i className="bi bi-file-earmark-text"></i>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Monthly Performance Audit & PDF Statement
              </h3>
              <p className="text-xs text-slate-400">
                Generate an executive printable statement for {formattedMonthLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Step Controls */}
          <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 text-xs">
            <button
              onClick={handlePrevMonth}
              className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Previous Month"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent border-none text-white text-xs font-mono px-2 py-1 focus:outline-hidden"
            />
            <button
              onClick={handleNextMonth}
              className="px-2 py-1 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Next Month"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>

          {/* Quick jump to current month */}
          {selectedMonth !== currentMonthStr && (
            <button
              onClick={() => setSelectedMonth(currentMonthStr)}
              className="px-2.5 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              Current Month
            </button>
          )}

          {/* Download PDF CTA */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
          >
            {isGeneratingPdf ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>Compiling Statement...</span>
              </>
            ) : (
              <>
                <i className="bi bi-file-earmark-arrow-down-fill text-base"></i>
                <span>Download PDF Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Report Document Preview Sheet */}
      <div className="fin-card p-6 border-t-4 border-t-emerald-500 space-y-6">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
              Financial Performance Summary
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">
              Statement of Inflows, Outflows & Savings
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Billing Cycle: {formattedMonthLabel} · Currency: {user.currency} (INR)
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-semibold text-slate-700 block">
              Account Holder: {user.name}
            </span>
            <span className="text-[11px] text-slate-400 font-mono block">
              Email: {user.email}
            </span>
          </div>
        </div>

        {/* 4 KPI Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Total Income</span>
            <div className="text-lg font-bold font-numeric text-emerald-600 mt-1">
              +{user.currency}{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {incomes.length} deposit(s) logged
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Total Expenses</span>
            <div className="text-lg font-bold font-numeric text-slate-900 mt-1">
              -{user.currency}{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {expenses.length} outflow transactions
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Net Balance Surplus</span>
            <div className={`text-lg font-bold font-numeric mt-1 ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netBalance >= 0 ? '+' : ''}{user.currency}{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              {netBalance >= 0 ? 'Retained Cash Buffer' : 'Deficit Alert'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 font-medium block">Savings Rate Achieved</span>
            <div className={`text-lg font-bold font-numeric mt-1 ${savingsRate >= user.savingsTargetGoal ? 'text-emerald-600' : 'text-amber-600'}`}>
              {savingsRate}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">
              Target Goal: {user.savingsTargetGoal}%
            </span>
          </div>
        </div>

        {/* 50/30/20 Rule Breakdown Preview */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            50/30/20 Heuristic Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-600 font-medium block">Needs (Essentials)</span>
                <span className="text-[11px] text-slate-400">Target: 50%</span>
              </div>
              <div className="text-right">
                <span className="font-bold font-numeric text-slate-900 block">
                  {user.currency}{advisorData.fiftyThirtyTwenty.needs.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-bold">
                  {advisorData.fiftyThirtyTwenty.needs.percentage}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-slate-600 font-medium block">Wants (Discretionary)</span>
                <span className="text-[11px] text-slate-400">Target: 30%</span>
              </div>
              <div className="text-right">
                <span className="font-bold font-numeric text-slate-900 block">
                  {user.currency}{advisorData.fiftyThirtyTwenty.wants.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 font-mono font-bold">
                  {advisorData.fiftyThirtyTwenty.wants.percentage}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex justify-between items-center">
              <div>
                <span className="text-emerald-800 font-medium block">Savings & Reserves</span>
                <span className="text-[11px] text-emerald-600">Target: 20%</span>
              </div>
              <div className="text-right">
                <span className="font-bold font-numeric text-emerald-700 block">
                  {user.currency}{advisorData.fiftyThirtyTwenty.savings.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-emerald-600 font-mono font-bold">
                  {advisorData.fiftyThirtyTwenty.savings.percentage}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Table Preview */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
            Category Breakdown & Spending Caps
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Spent</th>
                  <th className="py-2.5 px-3 text-right">Budget Limit</th>
                  <th className="py-2.5 px-3 text-center">Utilization</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-numeric">
                {Object.entries(advisorData.categoryTotals).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No expense disbursements recorded in {formattedMonthLabel}.
                    </td>
                  </tr>
                ) : (
                  Object.entries(advisorData.categoryTotals).map(([cat, amount]) => {
                    const budget = advisorData.budgetStatuses.find((b) => b.category === cat);
                    return (
                      <tr key={cat} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{cat}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {user.currency}{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {budget ? `${user.currency}${budget.limitAmount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold">
                          {budget ? `${budget.percentage}%` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {budget ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                budget.status === 'danger'
                                  ? 'bg-rose-100 text-rose-700'
                                  : budget.status === 'warning'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {budget.status === 'danger' ? 'EXCEEDED' : budget.status === 'warning' ? 'NEAR CAP' : 'SAFE'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Uncapped</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Button at Bottom of Sheet */}
        <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
          <span>* Click "Download PDF Summary" above to generate a client-ready vector PDF document.</span>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1.5"
          >
            <i className="bi bi-download"></i>
            <span>Download PDF ({selectedMonth})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
