import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  History,
  CheckCircle2,
  BarChart3,
  Palette,
  Settings,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Brand Kit', path: '/brand-kit', icon: BookOpen },
    { label: 'Content Review', path: '/review', icon: ShieldCheck },
    { label: 'Review History', path: '/history', icon: History },
    {
      label: 'Approval Centre',
      path: '/approvals',
      icon: CheckCircle2,
      badge: user?.role !== 'CREATOR' ? 'Review Queue' : undefined,
    },
    { label: 'Governance Insights', path: '/insights', icon: BarChart3 },
    { label: 'Visual Checker', path: '/visual-checker', icon: Palette },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white/95 border-r border-border flex flex-col h-screen select-none shrink-0 shadow-subtle backdrop-blur-md relative z-20">
      {/* Brand Logo Header */}
      <div className="h-18 flex items-center px-6 border-b border-border-subtle gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm shadow-brand-500/30">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
            BrandLens
            <span className="text-[10px] bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-brand-200/80">
              v2.0
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Inkloom AI • Watermelon UI</p>
        </div>
      </div>

      {/* Active Brand Kit Card */}
      <div className="p-3.5 mx-3.5 my-3 bg-gradient-to-br from-brand-50/50 via-white to-violet-50/40 border border-brand-100/80 rounded-2xl shadow-subtle relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-400/5 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
            Active Brand Kit
          </span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live
          </span>
        </div>
        <p className="font-bold text-xs text-slate-800 mt-1.5 truncate">
          {user?.org_name || 'GlowCare Skincare'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">Dermatology & Wellness</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Governance Workspace
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-brand-50 to-violet-50/70 text-brand-700 font-bold shadow-xs border border-brand-200/70'
                  : 'text-slate-600 hover:bg-brand-50/40 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-600/70 opacity-80" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Demo Indicator */}
      <div className="p-3.5 border-t border-border-subtle bg-surface-subtle/70">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-border/80 shadow-subtle">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-glow-sm">
            {user?.full_name?.charAt(0) || 'J'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {user?.full_name || 'Guest Judge'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200/60">
                {user?.role || 'CREATOR'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
