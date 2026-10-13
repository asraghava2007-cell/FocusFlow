import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { FocusTimerPage } from './pages/FocusTimerPage';
import { ScreenTimePage } from './pages/ScreenTimePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LogScreenTimeModal } from './components/screentime/LogScreenTimeModal';
import { ShieldCheck } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentPage } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'timer':
        return <FocusTimerPage />;
      case 'screentime':
        return <ScreenTimePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-midnight-bg text-midnight-text antialiased selection:bg-lavender-400/25 selection:text-lavender-300">
      {/* Sleek Linear-style Left Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Top Header / Breadcrumb Bar */}
        <TopBar
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenLogModal={() => setIsLogModalOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-12 max-w-7xl w-full mx-auto">
          {renderCurrentPage()}
        </main>

        {/* Minimalist Footer */}
        <footer className="border-t border-white/[0.06] py-5 px-6 text-xs text-midnight-muted">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-300">FocusFlow</span>
              <span>— Midnight Focus UI</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5 text-lavender-400" />
                Local storage encrypted in-browser
              </span>
              <span>•</span>
              <span>Production SaaS Grade</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Quick Screen Time Modal (Accessible from TopBar button) */}
      <LogScreenTimeModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
