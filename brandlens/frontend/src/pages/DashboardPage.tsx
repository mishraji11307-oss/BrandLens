import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  BookOpen,
  Palette,
  Sparkles,
  Layers,
  Activity,
  TrendingUp,
  FileText,
  ExternalLink
} from 'lucide-react';
import { contentService, insightsService } from '../services/api';
import { ContentSubmission, GovernanceInsights } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningSample, setRunningSample] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [subsData, insightsData] = await Promise.all([
        contentService.list(),
        insightsService.getOverview(),
      ]);
      setSubmissions(subsData);
      setInsights(insightsData);
    } catch {
      showToast('Error', 'Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunSampleAudit = async () => {
    setRunningSample(true);
    try {
      const formData = new FormData();
      formData.append('title', 'Summer Clarifying Serum Ad Copy (Judge Demo)');
      formData.append(
        'text_content',
        'Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula.'
      );
      formData.append('publishing_channel', 'Instagram');
      formData.append('content_category', 'Social Ad Copy');

      const newSub = await contentService.upload(formData);
      const reviewed = await contentService.runReview(newSub.id);
      showToast(
        'Review Completed!',
        `Identified ${reviewed.findings.length} brand compliance issues with guidelines evidence.`,
        'success'
      );
      navigate(`/review/${reviewed.id}`);
    } catch {
      showToast('Error', 'Failed to execute sample review.', 'error');
    } finally {
      setRunningSample(false);
    }
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              Brand Governance Dashboard
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {user?.org_name || 'GlowCare Skincare'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time brand compliance monitoring, deterministic rule checks, and human sign-off pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunSampleAudit}
            loading={runningSample}
            icon={<Sparkles className="w-3.5 h-3.5 text-brand-600 animate-spin" />}
          >
            1-Click Demo Review
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={() => navigate('/review')}
            icon={<Plus className="w-3.5 h-3.5 text-white" />}
          >
            Review New Content
          </Button>
        </div>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Compliance Score */}
        <div className="p-5 rounded-3xl bg-white/90 border border-border shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg. Compliance
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {insights?.average_compliance_score || 88}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> Passing
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${insights?.average_compliance_score || 88}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">Formula-weighted across all active campaigns</p>
        </div>

        {/* Metric 2: Pending Approvals */}
        <div className="p-5 rounded-3xl bg-white/90 border border-border shadow-subtle hover:shadow-card-hover hover:border-amber-200 transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {insights?.pending_count || 0}
            </span>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Manager Queue
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-2/3" />
          </div>
          <p className="text-[11px] text-slate-400">Submissions awaiting human review sign-off</p>
        </div>

        {/* Metric 3: Critical Violations */}
        <div className="p-5 rounded-3xl bg-white/90 border border-border shadow-subtle hover:shadow-card-hover hover:border-red-200 transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Violations Intercepted
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {insights?.critical_violations_caught || 3}
            </span>
            <span className="text-[11px] font-bold text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Pre-Publication
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full w-full" />
          </div>
          <p className="text-[11px] text-slate-400">Exaggerated curative claims prevented</p>
        </div>

        {/* Metric 4: Approved & Published */}
        <div className="p-5 rounded-3xl bg-white/90 border border-border shadow-subtle hover:shadow-card-hover hover:border-emerald-200 transition-all duration-200 space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cleared & Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {insights?.approved_count || 1}
            </span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Publish Ready
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-4/5" />
          </div>
          <p className="text-[11px] text-slate-400">100% compliant with approved Brand Kit</p>
        </div>
      </div>

      {/* Smart Governance Intelligence Bento Card */}
      {insights?.smart_insights && insights.smart_insights.length > 0 && (
        <div className="p-6 rounded-3xl border border-brand-200/90 bg-gradient-to-r from-brand-50/60 via-white to-violet-50/50 shadow-subtle relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center shadow-glow-sm shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">
                    Governance Intelligence Recommendation
                  </span>
                  <Badge variant="high">Action Recommended</Badge>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {insights.smart_insights[0].title}
                </h3>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  {insights.smart_insights[0].message}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/insights')}
              icon={<ArrowRight className="w-3.5 h-3.5 text-brand-600" />}
              className="shrink-0"
            >
              Inspect Governance Analytics
            </Button>
          </div>
        </div>
      )}

      {/* Recent Submissions Table (Watermelon UI Table Style) */}
      <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
              Recent Content Submissions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live tracking of copy drafts, formula compliance scores, and approval state.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/history')}
            icon={<ExternalLink className="w-3.5 h-3.5 text-brand-600" />}
          >
            View Complete History
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-border-subtle">
              <tr>
                <th className="px-6 py-3.5">Content Item</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5">Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Flagged Items</th>
                <th className="px-6 py-3.5 text-right">Review Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {submissions.map((sub) => {
                const openCount = (sub.findings || []).filter((f) => f.status === 'open').length;
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-brand-50/30 transition-colors duration-150 group"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-brand-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{sub.title}</p>
                          <p className="text-[11px] text-slate-400 font-normal">
                            {sub.campaign_name || 'Standard Post'} • v{sub.current_revision_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-lg bg-surface-subtle border border-border text-[11px] font-medium">
                        {sub.publishing_channel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-extrabold px-2.5 py-1 rounded-full text-[11px] font-mono border ${
                          sub.compliance_score >= 85
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : sub.compliance_score >= 60
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-800 border-red-200'
                        }`}
                      >
                        {sub.compliance_score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        dot
                        variant={
                          sub.status === 'Approved'
                            ? 'success'
                            : sub.status === 'Pending Approval'
                            ? 'medium'
                            : sub.status === 'Rejected'
                            ? 'critical'
                            : 'neutral'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {openCount > 0 ? (
                        <span className="text-red-600 font-bold text-xs flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {openCount} Unresolved
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          0 Issues
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/review/${sub.id}`)}
                        icon={<ArrowRight className="w-3 h-3 text-brand-600" />}
                      >
                        Workspace
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
