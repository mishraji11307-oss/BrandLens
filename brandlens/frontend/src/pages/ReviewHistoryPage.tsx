import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  History,
  FileText,
  Shield,
  ArrowRight,
  Filter,
  CheckCircle,
  Clock,
  Lock,
  Search,
  Download,
  Share2,
  Instagram,
  Linkedin,
  Globe,
  Mail,
  Megaphone,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { contentService, auditService } from '../services/api';
import { ContentSubmission } from '../types';
import { useNotification } from '../context/NotificationContext';

export const ReviewHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'submissions' | 'audit'>('submissions');
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subs, logs] = await Promise.all([
          contentService.list(),
          auditService.getLogs(50)
        ]);
        setSubmissions(subs);
        setAuditLogs(logs);
      } catch {
        showToast('Error', 'Failed to fetch history records.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getChannelIcon = (channel: string) => {
    const c = channel.toLowerCase();
    if (c.includes('insta')) return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
    if (c.includes('linked')) return <Linkedin className="w-3.5 h-3.5 text-blue-600" />;
    if (c.includes('mail')) return <Mail className="w-3.5 h-3.5 text-amber-600" />;
    if (c.includes('ad')) return <Megaphone className="w-3.5 h-3.5 text-violet-600" />;
    return <Globe className="w-3.5 h-3.5 text-emerald-600" />;
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.campaign_name && sub.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesChannel =
      selectedChannel === 'all' ||
      sub.publishing_channel.toLowerCase().includes(selectedChannel.toLowerCase());
    return matchesSearch && matchesChannel;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    return (
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.user_name && log.user_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-600">Loading audit history & submissions ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Cryptographically Verified Ledger
            </span>
            <span className="text-[11px] text-slate-400">• ISO 27001 Auditable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Review History & Immutable Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Complete traceability for creator revisions, automated AI detections, and human manager decisions.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'submissions'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Submissions History</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-600">
              {submissions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === 'audit'
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 font-mono text-slate-600">
              {auditLogs.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'submissions' ? 'Search title or campaign...' : 'Search actor, action, or resource...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {activeTab === 'submissions' && (
          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            {['all', 'Instagram', 'LinkedIn', 'Web', 'Email', 'Ads'].map((channel) => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-[11px] whitespace-nowrap ${
                  selectedChannel === channel
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/80'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {channel === 'all' ? 'All Channels' : channel}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Table Tab */}
      {activeTab === 'submissions' ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Content Title & Campaign</th>
                  <th className="px-5 py-3.5 font-semibold">Channel</th>
                  <th className="px-5 py-3.5 font-semibold">Revision</th>
                  <th className="px-5 py-3.5 font-semibold">Compliance Score</th>
                  <th className="px-5 py-3.5 font-semibold">Review Status</th>
                  <th className="px-5 py-3.5 font-semibold">Submitted At</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No matching content submissions found.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {sub.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {sub.campaign_name || 'General Brand Asset'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          {getChannelIcon(sub.publishing_channel)}
                          <span className="font-medium text-[11px]">{sub.publishing_channel}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-[11px] text-slate-600 px-2 py-0.5 rounded bg-slate-100 border border-slate-200/60 font-semibold">
                          v{sub.current_revision_number}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs inline-flex items-center gap-1 ${
                            sub.compliance_score >= 85
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.compliance_score >= 60
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {sub.compliance_score >= 85 ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {sub.compliance_score}/100
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant={
                            sub.status === 'Approved'
                              ? 'success'
                              : sub.status === 'Pending Approval'
                              ? 'medium'
                              : sub.status === 'Rejected'
                              ? 'critical'
                              : 'neutral'
                          }
                          dotPulse={sub.status === 'Pending Approval'}
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px] font-mono">
                        {new Date(sub.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/review/${sub.id}`)}
                          icon={<ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />}
                        >
                          Open Review
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Immutable Audit Trail Tab */
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900">Cryptographically Chained Audit Ledger</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Every action is permanently recorded with user identity, timestamp, and payload</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Append-Only Storage
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Timestamp</th>
                  <th className="px-5 py-3.5 font-semibold">Actor Identity</th>
                  <th className="px-5 py-3.5 font-semibold">Action Performed</th>
                  <th className="px-5 py-3.5 font-semibold">Resource</th>
                  <th className="px-5 py-3.5 font-semibold">Event Payload</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 font-mono whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {(log.user_name || 'S').charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-800">{log.user_name || 'System Auto-Engine'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[10px] border border-brand-200/60">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 uppercase font-mono text-[10px]">
                        {log.resource_type}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-sm truncate font-mono text-[10px] bg-slate-50/50">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : String(log.details || '-')}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-400 text-[10px]">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
