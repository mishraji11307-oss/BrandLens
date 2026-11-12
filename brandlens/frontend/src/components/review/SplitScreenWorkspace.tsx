import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Finding, ContentSubmission } from '../../types';
import { findingsService, contentService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { SocialAdSimulator } from '../social/SocialAdSimulator';
import { RedlineDiffView } from './RedlineDiffView';
import {
  Check,
  Edit2,
  XCircle,
  HelpCircle,
  BookOpen,
  FileText,
  AlertTriangle,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  Copy,
  Info,
  CheckCircle2,
  ShieldAlert,
  Smartphone,
  RotateCcw,
  GitCompare,
  FileCheck2,
  ExternalLink
} from 'lucide-react';

interface SplitScreenWorkspaceProps {
  submission: ContentSubmission;
  onRefresh: () => void;
}

export const SplitScreenWorkspace: React.FC<SplitScreenWorkspaceProps> = ({
  submission,
  onRefresh,
}) => {
  const { showToast } = useNotification();
  const [activeTab, setActiveTab] = useState<'working' | 'original' | 'diff'>('working');
  const [viewMode, setViewMode] = useState<'editor' | 'mockup'>('editor');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Resubmit as v2 Modal (Slide 11 Step 4)
  const [isResubmitModalOpen, setIsResubmitModalOpen] = useState(false);
  const [resubmitText, setResubmitText] = useState(submission.working_text);
  const [resubmitSummary, setResubmitSummary] = useState('');
  const [resubmitting, setResubmitting] = useState(false);

  // Clinical Claim Evidence Dossier Modal (Slide 8 & 10)
  const [claimEvidenceFinding, setClaimEvidenceFinding] = useState<Finding | null>(null);

  // Action Modals State
  const [editModalFinding, setEditModalFinding] = useState<Finding | null>(null);
  const [customFixText, setCustomFixText] = useState('');
  const [editReason, setEditReason] = useState('');

  const [dismissModalFinding, setDismissModalFinding] = useState<Finding | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  const [disputeModalFinding, setDisputeModalFinding] = useState<Finding | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const findings = submission.findings || [];

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  // Action Handlers
  const handleAccept = async (finding: Finding) => {
    try {
      await findingsService.accept(finding.id);
      showToast(
        'Fix Accepted',
        `Replaced '${finding.original_text}' with approved phrasing in working copy.`,
        'success'
      );
      onRefresh();
    } catch {
      showToast('Error', 'Failed to accept fix.', 'error');
    }
  };

  const handleEditSubmit = async () => {
    if (!editModalFinding) return;
    setLoadingAction(true);
    try {
      await findingsService.edit(editModalFinding.id, customFixText, editReason);
      showToast('Custom Edit Applied', 'Working revision updated with custom phrasing.', 'success');
      setEditModalFinding(null);
      onRefresh();
    } catch {
      showToast('Error', 'Failed to apply custom fix.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDismissSubmit = async () => {
    if (!dismissModalFinding) return;
    if (!dismissReason.trim()) {
      showToast('Reason Required', 'Please provide a justification for dismissal.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      await findingsService.dismiss(dismissModalFinding.id, dismissReason);
      showToast('Finding Dismissed', 'Logged in audit history for compliance verification.', 'info');
      setDismissModalFinding(null);
      onRefresh();
    } catch {
      showToast('Error', 'Failed to dismiss finding.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeModalFinding) return;
    if (!disputeReason.trim()) {
      showToast('Justification Required', 'Please state why you dispute this brand rule.', 'warning');
      return;
    }
    setLoadingAction(true);
    try {
      await findingsService.dispute(disputeModalFinding.id, disputeReason);
      showToast('Dispute Submitted', 'Logged for Governance Intelligence review.', 'warning');
      setDisputeModalFinding(null);
      onRefresh();
    } catch {
      showToast('Error', 'Failed to submit dispute.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // 1-Click Disclosure Guard Auto-Fix (Slide 9 & 11 Step 6)
  const handleAddDisclosureGuardFix = async () => {
    const disclosureFinding = findings.find(
      (f) => f.rule_id?.startsWith('ASCI') || f.rule_id?.startsWith('FTC')
    );
    if (disclosureFinding) {
      await handleAccept(disclosureFinding);
    } else {
      try {
        const updated = `#Ad • ${submission.working_text}`;
        await contentService.resubmit(
          submission.id,
          updated,
          'Appended upfront #Ad disclosure tag under ASCI Influencer Code'
        );
        showToast('Disclosure Added', 'Appended #Ad disclosure to promotional copy.', 'success');
        onRefresh();
      } catch {
        showToast('Error', 'Failed to apply disclosure.', 'error');
      }
    }
  };

  // Resubmit as Revision v2 (Slide 11 Step 4 -> 5)
  const handleResubmitRevision = async () => {
    setResubmitting(true);
    try {
      await contentService.resubmit(
        submission.id,
        resubmitText,
        resubmitSummary || `Creator modified copy and resubmitted as v${submission.current_revision_number + 1}`
      );
      showToast(
        'Revision Resubmitted',
        `Resubmitted as v${submission.current_revision_number + 1}. AI review re-evaluated copy.`,
        'success'
      );
      setIsResubmitModalOpen(false);
      onRefresh();
      setActiveTab('diff'); // Automatically switch to Redline Diff View!
    } catch {
      showToast('Error', 'Failed to resubmit revision.', 'error');
    } finally {
      setResubmitting(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', 'Text copied successfully.', 'info');
  };

  // Render text with interactive glowing severity-based highlights
  const renderHighlightedContent = (text: string) => {
    if (!findings.length) return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;

    const elements: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    const openFindings = findings.filter((f) => f.status === 'open' && f.original_text);
    if (!openFindings.length) {
      return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    while (remaining.length > 0) {
      let earliestMatchIndex = -1;
      let matchingFinding: Finding | null = null;

      for (const f of openFindings) {
        const idx = remaining.toLowerCase().indexOf(f.original_text.toLowerCase());
        if (idx !== -1 && (earliestMatchIndex === -1 || idx < earliestMatchIndex)) {
          earliestMatchIndex = idx;
          matchingFinding = f;
        }
      }

      if (earliestMatchIndex === -1 || !matchingFinding) {
        elements.push(<span key={keyIdx++}>{remaining}</span>);
        break;
      }

      if (earliestMatchIndex > 0) {
        elements.push(<span key={keyIdx++}>{remaining.slice(0, earliestMatchIndex)}</span>);
      }

      const matchText = remaining.slice(
        earliestMatchIndex,
        earliestMatchIndex + matchingFinding.original_text.length
      );
      const isSelected = selectedFindingId === matchingFinding.id;

      const highlightColors = {
        critical:
          'bg-red-100/90 text-red-950 border-red-300 hover:bg-red-200/90 shadow-glow-critical',
        high: 'bg-orange-100/90 text-orange-950 border-orange-300 hover:bg-orange-200/90',
        medium: 'bg-amber-100/90 text-amber-950 border-amber-300 hover:bg-amber-200/90',
        low: 'bg-blue-100/90 text-blue-950 border-blue-300 hover:bg-blue-200/90',
      };

      const sev = matchingFinding.severity || 'medium';

      elements.push(
        <mark
          key={keyIdx++}
          onClick={() => {
            setSelectedFindingId(matchingFinding!.id);
            const el = document.getElementById(`finding-${matchingFinding!.id}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className={`cursor-pointer px-2 py-0.5 rounded-lg border text-xs font-bold transition-all duration-200 ${
            highlightColors[sev]
          } ${isSelected ? 'ring-2 ring-brand-600 ring-offset-2 scale-105' : 'hover:scale-102'}`}
          title={`Click to inspect rule citation: ${matchingFinding.title}`}
        >
          {matchText}
        </mark>
      );

      remaining = remaining.slice(earliestMatchIndex + matchingFinding.original_text.length);
    }

    return <div className="leading-relaxed whitespace-pre-wrap text-sm">{elements}</div>;
  };

  const hasDisclosureIssue = findings.some(
    (f) => (f.rule_id?.startsWith('ASCI') || f.rule_id?.startsWith('FTC')) && f.status === 'open'
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANEL: Submitted Content Workspace */}
      <div className="lg:col-span-6 space-y-4">
        {/* ASCI India & FTC Disclosure Status Pill (Slide 9 & 11 Step 6) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/60 border border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[10px] uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Disclosure Guard (ASCI & FTC)
            </span>
            <span className="text-slate-700 text-[11px]">
              {hasDisclosureIssue ? (
                <span className="text-red-700 font-semibold">⚠️ Mandatory promotional #Ad disclosure required</span>
              ) : (
                <span className="text-emerald-700 font-semibold">✓ Mandatory influencer & marketing claims verified</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasDisclosureIssue && (
              <button
                type="button"
                onClick={handleAddDisclosureGuardFix}
                className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                + Add #Ad Tag
              </button>
            )}
            <span className="text-[10px] font-mono text-slate-400">Clause 1 Upfront</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 border-b border-border-subtle bg-surface-subtle/80">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-border text-xs">
                <button
                  onClick={() => setActiveTab('working')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'working'
                      ? 'bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 shadow-2xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Working (v{submission.current_revision_number})
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'original'
                      ? 'bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 shadow-2xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Original Draft
                </button>
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === 'diff'
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 shadow-2xs border border-emerald-300'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔍 Redline Diff
                </button>
              </div>

              {/* View Mode Toggle: Document vs Live Social Mockup */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all text-[11px] ${
                    viewMode === 'editor'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mockup')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all text-[11px] ${
                    viewMode === 'mockup'
                      ? 'bg-brand-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  Live Mockups
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Resubmit as v2 button (Slide 11 Step 4) */}
              <button
                type="button"
                onClick={() => {
                  setResubmitText(submission.working_text);
                  setIsResubmitModalOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg border border-brand-200 transition-colors"
                title="Resubmit working copy as revision v2"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Resubmit as v{submission.current_revision_number + 1}</span>
              </button>

              <button
                onClick={() =>
                  handleCopyText(
                    activeTab === 'working' ? submission.working_text : submission.original_text
                  )
                }
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                title="Copy text"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <div className="text-[11px] text-slate-400 font-mono font-medium">
                {activeTab === 'working'
                  ? submission.working_text.length
                  : submission.original_text.length}{' '}
                chars
              </div>
            </div>
          </div>

          {/* Text View or Social Ad Mockup Canvas */}
          <div className="p-6 min-h-[420px] bg-white font-sans text-slate-800 text-sm">
            {viewMode === 'mockup' ? (
              <div className="py-2">
                <SocialAdSimulator
                  content={activeTab === 'working' ? submission.working_text : submission.original_text}
                  findings={findings}
                  channel={submission.publishing_channel}
                  onSelectFinding={(id) => {
                    setSelectedFindingId(id);
                    const el = document.getElementById(`finding-${id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                />
              </div>
            ) : activeTab === 'working' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-subtle/40 border border-border-subtle">
                  {renderHighlightedContent(submission.working_text)}
                </div>

                {findings.some((f) => f.status === 'open') ? (
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50/60 to-violet-50/40 border border-brand-200/70 text-xs text-brand-900 flex items-center gap-2.5 shadow-2xs">
                    <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>
                      Colored glowing highlights mark brand breaches. Click any highlight to inspect its guideline citation and apply corrections.
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All brand breaches have been resolved! Ready to submit for manager approval.</span>
                  </div>
                )}
              </div>
            ) : activeTab === 'diff' ? (
              <RedlineDiffView
                originalText={submission.original_text}
                workingText={submission.working_text}
                findings={findings}
                complianceScore={submission.compliance_score}
                initialScore={40}
                revisionNumber={submission.current_revision_number}
              />
            ) : (
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-mono text-xs bg-surface-subtle/70 p-5 rounded-2xl border border-border">
                {submission.original_text}
              </div>
            )}
          </div>

          {/* Footer Metadata */}
          <div className="px-6 py-3.5 border-t border-border-subtle bg-surface-subtle/50 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              Channel: <strong className="text-slate-800">{submission.publishing_channel}</strong> • Category:{' '}
              <strong className="text-slate-800">{submission.content_category}</strong>
            </div>
            <div>
              {submission.status === 'Approved' ? (
                <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Publish Ready
                </span>
              ) : (
                <span className="font-semibold">Workflow Status: {submission.status}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Evidence-Backed Findings */}
      <div className="lg:col-span-6 space-y-4">
        {/* Filter Pills Header */}
        <div className="p-3.5 rounded-2xl bg-white/95 border border-border shadow-subtle flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            <span>Findings ({filteredFindings.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs border border-border rounded-xl px-3 py-1.5 bg-surface-subtle text-slate-700 font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-border rounded-xl px-3 py-1.5 bg-surface-subtle text-slate-700 font-medium focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="accepted">Accepted</option>
              <option value="dismissed">Dismissed</option>
              <option value="disputed">Disputed</option>
            </select>
          </div>
        </div>

        {/* Findings Feed */}
        <div className="space-y-3.5">
          {filteredFindings.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-border bg-white text-slate-500 space-y-2">
              <Check className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-sm text-slate-800">No matching issues</p>
              <p className="text-xs text-slate-400">All content aligns with Brand Kit requirements.</p>
            </div>
          ) : (
            filteredFindings.map((finding) => {
              const isSelected = selectedFindingId === finding.id;
              const isResolved = finding.status !== 'open';

              return (
                <div
                  key={finding.id}
                  id={`finding-${finding.id}`}
                  onClick={() => setSelectedFindingId(finding.id)}
                  className={`p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden ${
                    isSelected
                      ? 'border-brand-500 ring-4 ring-brand-500/10 bg-white shadow-card-hover'
                      : 'border-border bg-white hover:border-brand-300 shadow-subtle'
                  } ${isResolved ? 'opacity-80 bg-surface-subtle/60' : ''}`}
                >
                  {/* Top Bar: Badges & Severity */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={finding.severity} dot>
                        {finding.severity}
                      </Badge>
                      <Badge variant="neutral">{finding.category}</Badge>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {finding.rule_code || 'RULE'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold px-2 py-0.5 rounded-full bg-surface-subtle border border-border">
                        {Math.round(finding.confidence * 100)}% conf
                      </span>
                      {finding.status === 'accepted' && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          Accepted
                        </span>
                      )}
                      {finding.status === 'dismissed' && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                          Dismissed
                        </span>
                      )}
                      {finding.status === 'disputed' && (
                        <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          Disputed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1. What is wrong? */}
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 mb-1">
                    {finding.title}
                  </h4>

                  {/* 2. Why is it wrong? */}
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {finding.explanation}
                  </p>

                  {/* Side-by-Side: Flagged Text vs Approved Fix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3 text-xs">
                    <div className="p-3 rounded-2xl bg-red-50/80 border border-red-200 text-red-950 font-mono space-y-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                        Flagged Text
                      </span>
                      <p className="font-bold">"{finding.original_text}"</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 font-mono space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Approved Suggestion
                      </span>
                      <p className="font-bold">
                        "{finding.custom_fix || finding.suggested_fix || 'No suggested fix'}"
                      </p>
                    </div>
                  </div>

                  {/* 3. Which brand guideline was violated? (RAG Source Citation) */}
                  <div className="p-3.5 rounded-2xl bg-surface-subtle/80 border border-border text-[11px] text-slate-600 space-y-2 my-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
                        <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                        <span>{finding.source_document || 'Brand Guidelines'}</span>
                        {finding.source_page && (
                          <span className="text-brand-700 font-semibold">• Page {finding.source_page}</span>
                        )}
                        {finding.source_section && (
                          <span className="text-slate-400">• {finding.source_section}</span>
                        )}
                      </div>

                      {/* Clickable Claim Evidence Link (Slide 8 & 10) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClaimEvidenceFinding(finding);
                        }}
                        className="text-[10px] text-brand-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>🔬 Evidence Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    {finding.evidence_text && (
                      <p className="text-slate-500 italic font-sans pl-5 leading-relaxed">
                        "{finding.evidence_text}"
                      </p>
                    )}
                  </div>

                  {/* 4. Action Buttons (Only for open findings) */}
                  {finding.status === 'open' && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border-subtle mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(finding);
                        }}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Accept Fix
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditModalFinding(finding);
                          setCustomFixText(finding.suggested_fix || finding.original_text);
                        }}
                        icon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissModalFinding(finding);
                          setDismissReason('');
                        }}
                        icon={<XCircle className="w-3.5 h-3.5 text-slate-400" />}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDisputeModalFinding(finding);
                          setDisputeReason('');
                        }}
                        icon={<HelpCircle className="w-3.5 h-3.5 text-amber-500" />}
                      >
                        Dispute
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Resubmit as Revision v2 Modal (Slide 11 Step 4) */}
      <Modal
        isOpen={isResubmitModalOpen}
        onClose={() => setIsResubmitModalOpen(false)}
        title={`🔄 Resubmit as Revision v${submission.current_revision_number + 1}`}
        description="Save your working copy as a formal new revision and re-run the 3-layer hybrid AI review."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Revised Copy Text
            </label>
            <textarea
              rows={5}
              value={resubmitText}
              onChange={(e) => setResubmitText(e.target.value)}
              className="w-full border border-border p-3 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans leading-relaxed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Revision Summary Note (Optional)
            </label>
            <input
              type="text"
              value={resubmitSummary}
              onChange={(e) => setResubmitSummary(e.target.value)}
              placeholder="e.g., Replaced 'cures acne' with approved claim AC-12 and added #Ad tag"
              className="w-full border border-border p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsResubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              loading={resubmitting}
              onClick={handleResubmitRevision}
              icon={<RotateCcw className="w-3.5 h-3.5 text-white" />}
            >
              Confirm & Resubmit v{submission.current_revision_number + 1}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Clinical Claim Evidence Modal (Slide 8 & 10) */}
      {claimEvidenceFinding && (
        <Modal
          isOpen={true}
          onClose={() => setClaimEvidenceFinding(null)}
          title="🔬 Linked Clinical Evidence Dossier"
          description="Regulatory research substantiation and official guideline page reference."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Rule / Claim Citation:
              </span>
              <p className="font-bold text-sm text-slate-900">
                {claimEvidenceFinding.title} ({claimEvidenceFinding.rule_code || claimEvidenceFinding.rule_id})
              </p>
            </div>

            <div className="space-y-2 text-slate-700">
              <div>
                <span className="font-bold block">Regulatory Standard / Document:</span>
                <p className="text-slate-600 mt-0.5">
                  {claimEvidenceFinding.source_document || 'Brand Guidelines'} • Section {claimEvidenceFinding.source_section || '4.1'} (Page {claimEvidenceFinding.source_page || 11})
                </p>
              </div>

              <div>
                <span className="font-bold block">Clinical Research Dossier:</span>
                <p className="text-slate-600 mt-0.5">
                  Clinical Trial Report GCS-2024-B (n=120, double-blind study). Approved for cosmetic blemish appearance claims only. Curative medical claims strictly barred under cosmetic regulation.
                </p>
              </div>

              <div>
                <span className="font-bold block">Approved Phrasing Standard:</span>
                <p className="text-emerald-700 font-bold mt-0.5">
                  "{claimEvidenceFinding.suggested_fix || 'helps reduce the appearance of blemishes'}"
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setClaimEvidenceFinding(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Suggestion Modal */}
      <Modal
        isOpen={!!editModalFinding}
        onClose={() => setEditModalFinding(null)}
        title="Custom Phrasing Correction"
        description="Enter custom brand-compliant phrasing to apply directly to the working revision."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Original Text</label>
            <input
              type="text"
              disabled
              value={editModalFinding?.original_text || ''}
              className="w-full bg-surface-subtle border border-border p-3 rounded-xl text-xs text-slate-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Your Custom Fix</label>
            <textarea
              rows={3}
              value={customFixText}
              onChange={(e) => setCustomFixText(e.target.value)}
              className="w-full border border-border p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
              placeholder="Enter replacement phrasing..."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setEditModalFinding(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={loadingAction} onClick={handleEditSubmit}>
              Apply Custom Fix
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dismiss Finding Modal */}
      <Modal
        isOpen={!!dismissModalFinding}
        onClose={() => setDismissModalFinding(null)}
        title="Dismiss Brand Finding"
        description="Provide a justification reason for dismissing this violation for compliance auditing."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Dismissal Rationale</label>
            <textarea
              rows={3}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full border border-border p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="e.g., Quotation from external dermatologist interview; exempt from standard ad headline rules."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setDismissModalFinding(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={loadingAction} onClick={handleDismissSubmit}>
              Confirm Dismissal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispute Finding Modal */}
      <Modal
        isOpen={!!disputeModalFinding}
        onClose={() => setDisputeModalFinding(null)}
        title="Dispute Brand Rule"
        description="Explain why you believe this brand rule is ambiguous or inaccurate. Logged for Governance Intelligence."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Dispute Justification</label>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full border border-border p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              placeholder="e.g., The phrasing is a customer question hook, not a declarative medical guarantee."
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setDisputeModalFinding(null)}>
              Cancel
            </Button>
            <Button variant="secondary" size="sm" loading={loadingAction} onClick={handleDisputeSubmit}>
              Submit Dispute
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
