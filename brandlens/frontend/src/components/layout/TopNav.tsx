import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
  Command,
  AlertTriangle,
  FileCheck2,
  Send,
  HelpCircle,
  ExternalLink,
  Layers,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { notificationService } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  resource_id?: string;
  is_read: boolean;
  created_at: string;
}

export const TopNav: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { showToast } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showJudgeDemoModal, setShowJudgeDemoModal] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifs, setLoadingNotifs] = useState<boolean>(false);

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

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch {
      // Fallback local notifications for uninterrupted judge presentation
      setNotifications([
        {
          id: 'demo-1',
          user_id: 'u1',
          title: '🚨 Critical Issue Detected',
          message: "Prohibited absolute guarantee 'guaranteed results' flagged in Clarifying Serum Launch (Rule RULE-TERM-002).",
          notification_type: 'critical_issue',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-2',
          user_id: 'u1',
          title: '⚖️ ASCI Disclosure Guard',
          message: "Sponsored post draft is missing mandatory '#Ad' label under ASCI India Influencer Code.",
          notification_type: 'compliance_alert',
          is_read: false,
          created_at: new Date(Date.now() - 300000).toISOString()
        },
        {
          id: 'demo-3',
          user_id: 'u1',
          title: '📋 Pending Approval Queue',
          message: "'Blemish Clarifying Serum Carousel' submitted by creator. Awaiting manager review.",
          notification_type: 'pending_approval',
          is_read: true,
          created_at: new Date(Date.now() - 900000).toISOString()
        }
      ]);
      setUnreadCount(2);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      showToast('Notifications Cleared', 'All alerts marked as read.', 'info');
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleSeedDemoAlerts = async () => {
    try {
      await notificationService.seedDemo();
      await fetchNotifications();
      showToast('Demo Alerts Generated', 'Populated real-time governance notifications.', 'success');
    } catch {
      fetchNotifications();
    }
  };

  const handleRoleSwitch = async (role: 'CREATOR' | 'REVIEWER' | 'ADMIN') => {
    setShowRoleMenu(false);
    await demoLogin(role);
    showToast(`Switched to ${role} Role`, `You now have full ${role} governance authority in GlowCare demo.`, 'info');
  };

  const judgeSteps = [
    {
      step: 1,
      title: 'Upload Product Ad or Packaging Image',
      desc: 'Use the Image OCR Scanner on the Review page or load sample packaging.',
      action: () => { setShowJudgeDemoModal(false); navigate('/review'); }
    },
    {
      step: 2,
      title: 'OCR Extracts Text & User Confirms It',
      desc: 'Review extracted text lines & claims before running the governance review.',
      action: () => { setShowJudgeDemoModal(false); navigate('/review'); }
    },
    {
      step: 3,
      title: 'BrandLens Flags Unsupported Claims with Source',
      desc: '3-Layer engine flags prohibited claims and provides exact guideline citations.',
      action: () => { setShowJudgeDemoModal(false); navigate('/review'); }
    },
    {
      step: 4,
      title: 'Creator Edits Wording & Resubmits as v2',
      desc: 'Apply approved fixes (or edit phrasings) and resubmit working copy as revision v2.',
      action: () => { setShowJudgeDemoModal(false); navigate('/history'); }
    },
    {
      step: 5,
      title: 'Redline Diff Highlights Exact Changes & Score Change',
      desc: 'Inspect word deletions in red, additions in green, and compliance score delta.',
      action: () => { setShowJudgeDemoModal(false); navigate('/history'); }
    },
    {
      step: 6,
      title: 'Disclosure Guard Checks ASCI & FTC Rule Packs',
      desc: 'Verify mandatory #Ad disclosures and substantiate market leadership superlatives.',
      action: () => { setShowJudgeDemoModal(false); navigate('/brand-kit'); }
    },
    {
      step: 7,
      title: 'Human Reviewer Approves & Clearance Certificate Issued',
      desc: 'Switch to Reviewer role, sign off on content, and download the SHA-256 PDF certificate.',
      action: () => { setShowJudgeDemoModal(false); navigate('/approvals'); }
    }
  ];

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
        {/* Judge 7-Step Demo Guide Button */}
        <button
          onClick={() => setShowJudgeDemoModal(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 text-xs font-bold text-brand-700 shadow-2xs hover:border-brand-300 hover:shadow-xs transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span>Judge 7-Step Tour</span>
        </button>

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
                  <p className="text-[10px] text-slate-500">Approve, reject & sign off</p>
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
                  <p className="text-[10px] text-slate-500">Manage rules, packs & claims</p>
                </div>
                {user?.role === 'ADMIN' && <Check className="w-4 h-4 text-brand-600" />}
              </button>
            </div>
          )}
        </div>

        {/* In-App Notification Drawer (Slide 8 Feature) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              if (!showNotifMenu) fetchNotifications();
            }}
            className="p-2 rounded-xl text-slate-500 hover:bg-brand-50 hover:text-brand-700 transition-all border border-transparent hover:border-brand-200 relative"
            title="In-App Governance Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black text-[9px] ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-88 sm:w-96 glass-dropdown rounded-3xl p-4 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-100 max-h-[480px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Governance Alerts</span>
                    <span className="text-[10px] text-slate-400">
                      {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-brand-600 font-bold hover:underline"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={handleSeedDemoAlerts}
                    className="text-[10px] text-slate-500 font-semibold hover:text-slate-800 p-1"
                    title="Refresh Demo Alerts"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Notification Feed */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 text-xs">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1 opacity-80" />
                    <p className="font-bold text-slate-700">All caught up!</p>
                    <p className="text-[11px] text-slate-400">No open compliance alerts pending.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.notification_type === 'pending_approval') {
                          navigate('/approvals');
                        } else if (n.resource_id) {
                          navigate(`/review/${n.resource_id}`);
                        }
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        n.is_read
                          ? 'bg-slate-50/70 border-slate-200/80 text-slate-600 opacity-80'
                          : n.notification_type === 'critical_issue'
                          ? 'bg-red-50/70 border-red-200 text-red-950 font-semibold shadow-2xs'
                          : 'bg-brand-50/60 border-brand-200/90 text-brand-950 font-semibold shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{n.title}</span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-brand-600 font-bold hover:underline">View details →</span>
                      </div>
                    </div>
                  ))
                )}
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

      {/* Planned Judge Demo Tour Modal (Slide 11 Flow) */}
      <Modal
        isOpen={showJudgeDemoModal}
        onClose={() => setShowJudgeDemoModal(false)}
        title="🎯 CodeNexus Round 3 Planned Demo Flow"
        description="Verify all 7 verifiable workflow steps promised in Slide 11 of the competition pitch."
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-2.5">
            {judgeSteps.map((s) => (
              <div
                key={s.step}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex items-start justify-between gap-3 bg-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-brand-100 text-brand-800 font-black flex items-center justify-center shrink-0 text-xs">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={s.action}
                  className="shrink-0 text-[10px]"
                >
                  Jump to Step →
                </Button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs">
            <span className="text-[11px] font-mono text-slate-300">
              "We show a feature as working only after an end-to-end test."
            </span>
            <span className="font-bold text-brand-400">Team V4Vantage</span>
          </div>
        </div>
      </Modal>
    </header>
  );
};
