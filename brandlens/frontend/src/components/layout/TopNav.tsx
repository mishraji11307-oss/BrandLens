import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Shield, LogOut, ChevronDown, Check, Sparkles, Activity, Command } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const TopNav: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Path to title mapping
  const routeTitles: Record<string, string> = {
    '/dashboard': 'Governance Overview',
    '/brand-kit': 'Brand Kit Management',
    '/review': 'Content Review & Ingestion',
    '/history': 'Submissions & Audit Trail',
    '/approvals': 'Manager Approval Centre',
    '/insights': 'Governance Intelligence & Analytics',
    '/visual-checker': 'Visual Brand & WCAG Checker',
    '/settings': 'Platform & AI Settings',
  };

  const currentTitle = routeTitles[location.pathname] || 'Governance Workspace';

  const handleRoleSwitch = async (role: 'CREATOR' | 'REVIEWER' | 'ADMIN') => {
    setShowRoleMenu(false);
    await demoLogin(role);
    showToast(`Switched to ${role} Role`, `You now have full ${role} governance authority in GlowCare demo.`, 'info');
  };

  return (
    <header className="h-18 bg-white/80 border-b border-border/80 px-6 sm:px-8 flex items-center justify-between z-30 shrink-0 backdrop-blur-md sticky top-0">
      {/* Left: Breadcrumbs / Page Title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">Workspace</span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {currentTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="hidden lg:flex items-center w-80">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, approved claims, copy..."
            className="w-full bg-surface-subtle/80 border border-border pl-10 pr-12 py-2 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition-all shadow-2xs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] text-slate-400 bg-white border border-border px-1.5 py-0.5 rounded-md font-mono shadow-2xs">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Hybrid AI Status Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50/70 border border-violet-200/60 text-xs font-semibold text-violet-800">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-pulse" />
          <span className="text-[11px]">Hybrid AI Active</span>
        </div>

        {/* Quick Judge Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-200/90 bg-white hover:bg-brand-50/50 text-xs font-semibold text-slate-800 transition-all shadow-subtle hover:border-brand-300"
          >
            <Shield className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-brand-700 font-extrabold">{user?.role || 'CREATOR'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-border-subtle mb-1">
                Judge Fast Role Switching
              </div>
              <button
                onClick={() => handleRoleSwitch('CREATOR')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl text-left transition-all ${
                  user?.role === 'CREATOR'
                    ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">Creator</p>
                  <p className="text-[10px] text-slate-500">Upload content & apply AI fixes</p>
                </div>
                {user?.role === 'CREATOR' && <Check className="w-4 h-4 text-brand-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('REVIEWER')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl text-left transition-all ${
                  user?.role === 'REVIEWER'
                    ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">Manager / Reviewer</p>
                  <p className="text-[10px] text-slate-500">Approve, reject & request changes</p>
                </div>
                {user?.role === 'REVIEWER' && <Check className="w-4 h-4 text-brand-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl text-left transition-all ${
                  user?.role === 'ADMIN'
                    ? 'bg-brand-50 text-brand-800 font-bold border border-brand-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="font-bold">Brand Admin</p>
                  <p className="text-[10px] text-slate-500">Manage rules, facts & claims</p>
                </div>
                {user?.role === 'ADMIN' && <Check className="w-4 h-4 text-brand-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-slate-500 hover:bg-brand-50 hover:text-brand-700 transition-all border border-transparent hover:border-brand-200 relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600 ring-2 ring-white animate-pulse" />
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 glass-dropdown rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle mb-2">
                <span className="text-xs font-bold text-slate-800">Governance Notifications</span>
                <span className="text-[10px] text-brand-600 font-bold cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100/80">
                  <p className="font-bold text-slate-800">AI Review Finished</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Found 2 brand violations in 'Clarifying Serum Launch Announcement'.
                  </p>
                  <span className="text-[9px] text-brand-600 font-semibold mt-1 block">Just now</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-border-subtle">
                  <p className="font-bold text-slate-800">Ready for Review</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    'Blemish Clarifying Serum Carousel' submitted to approval queue.
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">15 min ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign out"
          className="p-2 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
