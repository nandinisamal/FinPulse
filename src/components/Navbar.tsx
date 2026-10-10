import React from 'react';

interface NavbarProps {
  pageTitle: string;
  pageSubtitle?: string;
  onOpenMobileMenu: () => void;
  onOpenQuickAdd: () => void;
  currency: string;
  alertsCount: number;
  onNavigateToAdvisor: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pageTitle,
  pageSubtitle,
  onOpenMobileMenu,
  onOpenQuickAdd,
  currency,
  alertsCount,
  onNavigateToAdvisor,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open menu"
        >
          <i className="bi bi-list text-xl"></i>
        </button>

        <div>
          <h1 className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight leading-tight">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-xs text-slate-500 hidden sm:block">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Currency indicator, Quick action, Advisor alerts */}
      <div className="flex items-center gap-2.5">
        {/* Currency badge */}
        <span className="hidden sm:inline-flex items-center px-2 py-1 bg-slate-50 text-slate-600 rounded text-xs font-mono border border-slate-200">
          Currency: <strong className="ml-1 text-slate-900">{currency}</strong>
        </span>

        {/* Advisor alerts notification button */}
        <button
          onClick={onNavigateToAdvisor}
          className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Advisor Alerts"
        >
          <i className="bi bi-bell text-lg"></i>
          {alertsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono">
              {alertsCount}
            </span>
          )}
        </button>

        {/* Quick Add Expense / Income */}
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
        >
          <i className="bi bi-plus-lg"></i>
          <span className="hidden xs:inline">Add Record</span>
        </button>
      </div>
    </header>
  );
};
