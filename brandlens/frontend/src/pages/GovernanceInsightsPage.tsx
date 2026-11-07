import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  PieChart,
  ArrowRight,
  Info,
  RefreshCw,
  Download,
  Filter,
  Check,
  FileCheck2,
  ShieldAlert,
  Layers,
  Activity
} from 'lucide-react';
import { insightsService } from '../services/api';
import { GovernanceInsights } from '../types';
import { useNotification } from '../context/NotificationContext';

export const GovernanceInsightsPage: React.FC = () => {
  const { showToast } = useNotification();
  const [insights, setInsights] = useState<GovernanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchInsights = async () => {
    try {
      const data = await insightsService.getOverview();
      setInsights(data);
    } catch {
      showToast('Error', 'Failed to fetch governance insights.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsights();
    showToast('Updated', 'Analytics metrics refreshed from database.', 'success');
  };

  if (loading || !insights) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-slate-600">Calculating compliance metrics & audit trends...</span>
      </div>
    );
  }

  const approvalRate = insights.total_submissions > 0
    ? Math.round((insights.approved_count / insights.total_submissions) * 100)
    : 100;

  const totalViolations = Object.values(insights.severity_distribution).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-200/60">
              <Activity className="w-3 h-3 text-brand-600" />
              Real-Time Governance Analytics
            </span>
            <span className="text-[11px] text-slate-400">• Section 15 Compliant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Governance Intelligence & Compliance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Derived directly from immutable database records, audit history, and deterministic rule violations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === '7d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === '30d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                timeRange === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Overview Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Compliance Score</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {insights.average_compliance_score}%
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Passing
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Weighted penalty model</span>
            <span className="font-semibold text-emerald-600">+3.2% vs baseline</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: `${insights.average_compliance_score}%` }}
            />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">First-Pass Approval Rate</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {approvalRate}%
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
              Publish Ready
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>{insights.approved_count} of {insights.total_submissions} submissions</span>
            <span className="font-semibold text-brand-600">High efficiency</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-violet-500 rounded-full"
              style={{ width: `${approvalRate}%` }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Critical Interceptions</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {insights.critical_violations_caught}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Risks Blocked
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Severe claims prevented</span>
            <span className="font-semibold text-slate-700">100% intercepted</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-rose-400 rounded-full"
              style={{ width: `${Math.min(100, (insights.critical_violations_caught / (totalViolations || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Monitored Content</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              {insights.total_submissions}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Multi-Channel
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>Instagram, LinkedIn, Web, Ads</span>
            <span className="font-semibold text-slate-700">GlowCare Org</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Compliance Score Formula Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-indigo-50/70 via-violet-50/40 to-white border border-indigo-100/90 p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Documented Brand Compliance Score Formula (Section 15)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Deterministic mathematical scoring ensuring complete transparency and zero arbitrary LLM penalties.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white border border-indigo-200 text-indigo-700">
            Auditable Formula
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-900 font-bold">1. Base Score</strong>
              <span className="font-mono text-[11px] font-bold text-indigo-600">100 pts</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Every newly submitted draft begins with a full 100-point perfect compliance quota.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-900 font-bold">2. Weighted Penalty</strong>
              <span className="font-mono text-[11px] font-bold text-red-600">-3 to -25 pts</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Critical: <span className="font-semibold text-red-600">-25</span> • High: <span className="font-semibold text-orange-600">-15</span> • Medium: <span className="font-semibold text-amber-600">-8</span> • Low: <span className="font-semibold text-blue-600">-3</span>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-900 font-bold">3. Resolution Recovery</strong>
              <span className="font-mono text-[11px] font-bold text-emerald-600">+80% refund</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Accepting recommended suggestions recovers 80% of deducted penalty points instantly.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/90 border border-indigo-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <strong className="text-xs text-slate-900 font-bold">4. Critical Gate Cap</strong>
              <span className="font-mono text-[11px] font-bold text-rose-600">Max ≤ 69</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
              Any unresolved critical violation hard-caps the final score below passing threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Category Distribution */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-500" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Violations by Brand Category</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
              Deterministic Aggregation
            </span>
          </div>

          <div className="space-y-4 pt-4 text-xs">
            {Object.entries(insights.category_distribution).map(([cat, count]) => {
              const total = Object.values(insights.category_distribution).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat} className="space-y-1.5 group">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="capitalize font-semibold text-slate-800 flex items-center gap-1.5">
                      {cat}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">{count} incidents</span>
                      <span className="font-mono font-bold text-brand-700 text-xs w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 via-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-card-hover transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Severity Distribution</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
              Audit Counts
            </span>
          </div>

          <div className="space-y-4 pt-4 text-xs">
            {Object.entries(insights.severity_distribution).map(([sev, count]) => {
              const total = Object.values(insights.severity_distribution).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);

              const sevConfig: Record<string, { bar: string; badge: string; text: string }> = {
                critical: {
                  bar: 'from-red-500 to-rose-400',
                  badge: 'bg-red-50 text-red-700 border-red-200',
                  text: 'text-red-700'
                },
                high: {
                  bar: 'from-orange-500 to-amber-400',
                  badge: 'bg-orange-50 text-orange-700 border-orange-200',
                  text: 'text-orange-700'
                },
                medium: {
                  bar: 'from-amber-500 to-yellow-400',
                  badge: 'bg-amber-50 text-amber-700 border-amber-200',
                  text: 'text-amber-700'
                },
                low: {
                  bar: 'from-blue-500 to-cyan-400',
                  badge: 'bg-blue-50 text-blue-700 border-blue-200',
                  text: 'text-blue-700'
                }
              };

              const config = sevConfig[sev] || {
                bar: 'from-slate-500 to-slate-400',
                badge: 'bg-slate-50 text-slate-700 border-slate-200',
                text: 'text-slate-700'
              };

              return (
                <div key={sev} className="space-y-1.5 group">
                  <div className="flex justify-between items-center text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize border ${config.badge}`}>
                        {sev}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 text-[11px]">{count} logged</span>
                      <span className={`font-mono font-bold text-xs w-10 text-right ${config.text}`}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full bg-gradient-to-r ${config.bar} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smart Insight Engine Recommendations */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-card-hover transition-all duration-300 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">
                Smart Insight Engine — Historical Pattern Intelligence
              </h3>
              <p className="text-[11px] text-slate-500">
                Proactive guideline recommendations generated from repeated submission discrepancies.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200/60">
            AI Automated Audit
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.smart_insights.map((insight) => (
            <div
              key={insight.id}
              className="group p-4 rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/60 to-white hover:border-brand-300 hover:shadow-xs transition-all duration-200 space-y-3 text-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={insight.severity === 'high' ? 'critical' : insight.severity === 'medium' ? 'medium' : 'low'}>
                    {insight.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">{insight.id}</span>
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  {insight.title}
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">{insight.message}</p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 text-[11px] font-semibold text-brand-700 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span>Action: {insight.action_prompt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Frequently Violated Rules Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Most Frequently Violated Rules</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Top brand rules triggering content revision warnings across all teams</p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Section 14 Analytics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 uppercase text-[10px] tracking-wider text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Rule Code</th>
                <th className="px-5 py-3.5 font-semibold">Rule Title</th>
                <th className="px-5 py-3.5 font-semibold text-right">Violations Logged</th>
                <th className="px-5 py-3.5 font-semibold text-right">Relative Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insights.most_violated_rules.map((rule) => {
                const maxViolations = Math.max(...insights.most_violated_rules.map(r => r.violations)) || 1;
                const pct = Math.round((rule.violations / maxViolations) * 100);
                return (
                  <tr key={rule.rule_code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px] border border-brand-200/60">
                        {rule.rule_code}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      {rule.title}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                      {rule.violations}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-600 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 w-8 text-right">{pct}%</span>
                      </div>
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
