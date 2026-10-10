/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sidebar, NavPage } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { QuickAddModal } from './components/QuickAddModal';
import { apiService } from './services/apiService';
import { User } from './types/finance';

// Page components
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncomePage } from './pages/IncomePage';
import { ExpensePage } from './pages/ExpensePage';
import { BudgetPage } from './pages/BudgetPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(() => apiService.getCurrentUser());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
    setCurrentUser(apiService.getCurrentUser());
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    setCurrentPage('landing');
  };

  const handleLoginSuccess = () => {
    setCurrentUser(apiService.getCurrentUser());
    setCurrentPage('dashboard');
  };

  const handleQuickDemoLogin = () => {
    apiService.login('alex.rivera@example.com', 'Password@123');
    setCurrentUser(apiService.getCurrentUser());
    setCurrentPage('dashboard');
  };

  // Compute alert counts for the bell notification
  const alertCount = useMemo(() => {
    if (!currentUser) return 0;
    try {
      const analysis = apiService.getAdvisorAnalysis();
      return analysis.recommendations.filter((r) => r.type === 'critical' || r.type === 'warning').length;
    } catch {
      return 0;
    }
  }, [currentUser, refreshKey]);

  // Page title mapping
  const getPageInfo = (): { title: string; subtitle: string } => {
    switch (currentPage) {
      case 'dashboard':
        return {
          title: 'Financial Command Center',
          subtitle: `Welcome back, ${currentUser?.name || 'User'} · Real-time ledger summary`,
        };
      case 'income':
        return {
          title: 'Income Management',
          subtitle: 'Record revenues, salary deposits, freelance client invoices, and capital dividends',
        };
      case 'expenses':
        return {
          title: 'Expense Management',
          subtitle: 'Categorized disbursements, payment methods, and expenditure audit',
        };
      case 'budgets':
        return {
          title: 'Budget Allocation',
          subtitle: 'Dynamic monthly category spending limits with threshold indicators',
        };
      case 'transactions':
        return {
          title: 'Transaction Audit Log',
          subtitle: 'Chronological unified ledger of inflows and outflows with CSV download',
        };
      case 'analytics':
        return {
          title: 'Spending & Trend Analytics',
          subtitle: 'Multi-month cashflow velocity, daily burn rates, and distribution charts',
        };
      case 'advisor':
        return {
          title: 'Personal Finance Advisor',
          subtitle: 'Transparent 50/30/20 heuristic rules and interactive savings simulator',
        };
      case 'profile':
        return {
          title: 'User Profile & Financial Targets',
          subtitle: 'Manage take-home income targets, savings goals, and BCrypt security',
        };
      case 'settings':
        return {
          title: 'System Settings & Data Migration',
          subtitle: 'Currency symbols, JSON backup/restore, and demo state controls',
        };
      default:
        return { title: 'FinPulse', subtitle: '' };
    }
  };

  // Public Unauthenticated Pages
  if (currentPage === 'landing' && !currentUser) {
    return (
      <LandingPage
        onNavigate={(p) => setCurrentPage(p)}
        onQuickDemoLogin={handleQuickDemoLogin}
      />
    );
  }

  if (currentPage === 'login' && !currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onNavigate={(p) => setCurrentPage(p)}
      />
    );
  }

  if (currentPage === 'register' && !currentUser) {
    return (
      <RegisterPage
        onRegisterSuccess={handleLoginSuccess}
        onNavigate={(p) => setCurrentPage(p)}
      />
    );
  }

  // Fallback if not logged in
  if (!currentUser) {
    return (
      <LandingPage
        onNavigate={(p) => setCurrentPage(p)}
        onQuickDemoLogin={handleQuickDemoLogin}
      />
    );
  }

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => setCurrentPage(p)}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        userName={currentUser.name}
        userEmail={currentUser.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <Navbar
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.subtitle}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          currency={currentUser.currency}
          alertsCount={alertCount}
          onNavigateToAdvisor={() => setCurrentPage('advisor')}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto" key={refreshKey}>
          {currentPage === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              onNavigate={(p) => setCurrentPage(p)}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}

          {currentPage === 'income' && (
            <IncomePage
              user={currentUser}
              onRefresh={triggerRefresh}
            />
          )}

          {currentPage === 'expenses' && (
            <ExpensePage
              user={currentUser}
              onRefresh={triggerRefresh}
            />
          )}

          {currentPage === 'budgets' && (
            <BudgetPage
              user={currentUser}
              onRefresh={triggerRefresh}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              user={currentUser}
              onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsPage user={currentUser} />
          )}

          {currentPage === 'advisor' && (
            <AdvisorPage user={currentUser} />
          )}

          {currentPage === 'profile' && (
            <ProfilePage
              user={currentUser}
              onRefreshUser={triggerRefresh}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              user={currentUser}
              onRefreshAll={triggerRefresh}
            />
          )}
        </main>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        user={currentUser}
        onSuccess={triggerRefresh}
      />
    </div>
  );
}
