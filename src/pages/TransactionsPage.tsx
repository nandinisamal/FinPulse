import React, { useState, useMemo } from 'react';
import Papa from 'papaparse';
import { apiService } from '../services/apiService';
import { TransactionUnified, User } from '../types/finance';

interface TransactionsPageProps {
  user: User;
  onOpenQuickAdd: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  user,
  onOpenQuickAdd,
}) => {
  const [transactions] = useState<TransactionUnified[]>(() => apiService.getUnifiedTransactions());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 8;

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = typeFilter === 'ALL' || t.type === typeFilter;
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(search.toLowerCase()));
      const matchStart = !startDate || t.date >= startDate;
      const matchEnd = !endDate || t.date <= endDate;
      return matchType && matchSearch && matchStart && matchEnd;
    });
  }, [transactions, typeFilter, search, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  /**
   * Formats transaction data and triggers file download using PapaParse
   */
  const handleExportCsv = (exportOnlyFiltered: boolean = false) => {
    setIsExporting(true);
    const dataset = exportOnlyFiltered ? filtered : transactions;

    if (dataset.length === 0) {
      setExportNotification('No transactions available to export.');
      setIsExporting(false);
      setTimeout(() => setExportNotification(null), 3000);
      return;
    }

    try {
      // Map domain transactions to formatted table rows
      const formattedData = dataset.map((tx) => ({
        'Transaction ID': tx.id,
        'Type': tx.type,
        'Description / Source': tx.title,
        'Category': tx.category,
        'Amount': tx.amount.toFixed(2),
        'Currency': user.currency,
        'Date': tx.date,
        'Payment Method': tx.paymentMethod || 'N/A',
        'Notes': tx.notes || '',
      }));

      // Generate CSV string using PapaParse unparse
      const csvString = Papa.unparse(formattedData, {
        quotes: true, // Quotes around fields for CSV standard compliance
        header: true,
        newline: '\r\n',
      });

      // Create Blob with UTF-8 BOM so Excel and Google Sheets open foreign currencies & special chars cleanly
      const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `FinPulse_Transactions_${exportOnlyFiltered ? 'Filtered_' : 'All_'}${new Date().toISOString().slice(0, 10)}.csv`;

      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotification(`Successfully exported ${dataset.length} transactions to "${filename}" via PapaParse.`);
      setTimeout(() => setExportNotification(null), 4000);
    } catch (err) {
      setExportNotification('Failed to export CSV. Please try again.');
      setTimeout(() => setExportNotification(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Toast notification on export */}
      {exportNotification && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <i className="bi bi-check-circle-fill text-emerald-600"></i>
            <span>{exportNotification}</span>
          </div>
          <button
            onClick={() => setExportNotification(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Top Banner & CSV Export Button */}
      <div className="fin-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Unified Transaction Audit Log
          </h2>
          <p className="text-xs text-slate-500">
            Combined journal of all income receipts and expense disbursements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* PapaParse CSV Export Button Group */}
          <div className="inline-flex rounded-lg shadow-2xs border border-slate-300 overflow-hidden bg-white">
            <button
              onClick={() => handleExportCsv(false)}
              disabled={isExporting}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border-r border-slate-200 disabled:opacity-50"
              title="Export all transactions in database using PapaParse"
            >
              <i className="bi bi-file-earmark-spreadsheet text-emerald-600"></i>
              <span>{isExporting ? 'Generating...' : `Export All CSV (${transactions.length})`}</span>
            </button>
            {filtered.length !== transactions.length && (
              <button
                onClick={() => handleExportCsv(true)}
                disabled={isExporting}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors disabled:opacity-50"
                title="Export only matching filtered records"
              >
                Filtered ({filtered.length})
              </button>
            )}
          </div>

          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="fin-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-44 flex-1 sm:flex-initial">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title, category, notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
            <i className="bi bi-search text-slate-400 absolute left-2.5 top-2 text-xs"></i>
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTypeFilter('INCOME');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'INCOME'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Income Only
            </button>
            <button
              onClick={() => {
                setTypeFilter('EXPENSE');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                typeFilter === 'EXPENSE'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expenses Only
            </button>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800"
            />
            <span className="text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> matching entries
        </div>
      </div>

      {/* Transactions Table */}
      <div className="fin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description / Source</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment / Note</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => {
                  const isInc = tx.type === 'INCOME';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono">
                        <span className={`font-semibold ${isInc ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {tx.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tx.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {tx.paymentMethod || tx.notes || '—'}
                      </td>
                      <td className={`py-3 px-4 text-right font-bold font-numeric ${
                        isInc ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {isInc ? '+' : '-'}{user.currency}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div>
              Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
