import React from 'react';

export type NavPage =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'income'
  | 'expenses'
  | 'budgets'
  | 'transactions'
  | 'analytics'
  | 'advisor'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  userName: string;
  userEmail: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  isMobileOpen,
  onCloseMobile,
  userName,
  userEmail,
}) => {
  const navItems = [
    { id: 'dashboard' as NavPage, label: 'Dashboard', icon: 'bi-grid-1x2' },
    { id: 'income' as NavPage, label: 'Income', icon: 'bi-graph-up-arrow' },
    { id: 'expenses' as NavPage, label: 'Expenses', icon: 'bi-graph-down-arrow' },
    { id: 'budgets' as NavPage, label: 'Budgets', icon: 'bi-piggy-bank' },
    { id: 'transactions' as NavPage, label: 'Transactions', icon: 'bi-receipt' },
    { id: 'analytics' as NavPage, label: 'Analytics', icon: 'bi-pie-chart' },
    { id: 'advisor' as NavPage, label: 'Financial Advisor', icon: 'bi-shield-check', badge: 'Rules' },
    { id: 'profile' as NavPage, label: 'Profile', icon: 'bi-person-circle' },
    { id: 'settings' as NavPage, label: 'Settings', icon: 'bi-gear' },
  ];

  const handleNavClick = (page: NavPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 fin-sidebar flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-sm">
              <i className="bi bi-currency-exchange"></i>
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">
                FinPulse
              </span>
              <span className="text-[11px] text-slate-400 font-mono block leading-none">
                Finance Advisor
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Close menu"
          >
            <i className="bi bi-x-lg text-lg"></i>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-3 mb-2">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 font-semibold border-l-3 border-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <i className={`bi ${item.icon} text-base ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}></i>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User profile footer & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-700 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                {userName.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-white truncate">{userName}</div>
                <div className="text-[11px] text-slate-400 truncate font-mono">{userEmail}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-slate-400 hover:text-rose-400 p-1.5 rounded transition-colors"
            >
              <i className="bi bi-box-arrow-right text-base"></i>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
