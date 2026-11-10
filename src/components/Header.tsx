import React from 'react';
import { School, CalendarX2, ShieldCheck, BookOpen, LogOut, MailCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'form' | 'admin' | 'directory';
  setActiveTab: (tab: 'form' | 'admin' | 'directory') => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  onLogout: () => void;
  requestsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  onAdminClick,
  onLogout,
  requestsCount = 0
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('form')}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
              <School className="w-7 h-7 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-white">BCAS CAMPUS</span>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Academic Portal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Class Cancellation &amp; Rescheduling Automation</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'form'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <CalendarX2 className="w-4 h-4" />
              <span>Cancel Lecture Form</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'directory'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Staff Directory</span>
            </button>

            <button
              onClick={() => {
                if (!isAdmin) {
                  onAdminClick();
                } else {
                  setActiveTab('admin');
                }
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
              {isAdmin ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/20"></span>
              ) : null}
              {requestsCount > 0 && isAdmin ? (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-900 text-amber-400 text-xs rounded-full font-mono">
                  {requestsCount}
                </span>
              ) : null}
            </button>

            {isAdmin && (
              <button
                onClick={onLogout}
                title="Logout Admin"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Institutional Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-1.5 text-xs text-slate-400 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <MailCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Automated dispatch to Coordinator &amp; HOD | CC: <strong className="text-slate-300">sangeeth@bcas.lk</strong>, <strong className="text-slate-300">priyalini@bcas.lk</strong></span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-slate-500">Firebase Firestore Synchronized</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live
          </span>
        </div>
      </div>
    </header>
  );
};
