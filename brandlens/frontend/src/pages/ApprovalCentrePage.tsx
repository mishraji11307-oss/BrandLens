import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { approvalService, contentService } from '../services/api';
import { ApprovalRequest, ContentSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const ApprovalCentrePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval Modal Actions
  const [activeReq, setActiveReq] = useState<ApprovalRequest | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [managerComments, setManagerComments] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Preview Submission Modal
  const [previewSub, setPreviewSub] = useState<ContentSubmission | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchPending = async () => {
    try {
      const data = await approvalService.getPending();
      setRequests(data);
    } catch {
      showToast('Notice', 'Unable to fetch pending approvals. Verify your reviewer role.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [user?.role]);

  const handleOpenActionModal = (req: ApprovalRequest, type: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    setActiveReq(req);
    setActionType(type);
    setDecisionReason(
      type === 'APPROVE'
        ? 'Verified against Brand Kit guidelines and approved claims. Content is approved for publication.'
        : type === 'REJECT'
        ? 'Violates core brand governance standards. Substantive rewrite required.'
        : 'Please address the flagged terminology and ensure the mandatory disclaimer is included.'
    );
    setManagerComments('');
  };

  const handleExecuteDecision = async () => {
    if (!activeReq || !actionType) return;
    if (!decisionReason.trim()) {
      showToast('Reason Required', 'Please enter a decision reason for compliance records.', 'warning');
      return;
    }

    setSubmittingAction(true);
    try {
      if (actionType === 'APPROVE') {
        await approvalService.approve(activeReq.id, decisionReason, managerComments);
        showToast('Approval Granted!', 'Content marked Publish Ready.', 'success');
      } else if (actionType === 'REJECT') {
        await approvalService.reject(activeReq.id, decisionReason, managerComments);
        showToast('Submission Rejected', 'Creator notified with rejection rationale.', 'info');
      } else {
        await approvalService.requestChanges(activeReq.id, decisionReason, managerComments);
        showToast('Changes Requested', 'Revisions requested from creator.', 'info');
      }

      setActiveReq(null);
      setActionType(null);
      fetchPending();
    } catch (err: any) {
      showToast('Action Blocked', err.response?.data?.detail || 'Failed to process approval decision.', 'error');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handlePreviewContent = async (submissionId: string) => {
    setLoadingPreview(true);
    try {
      const sub = await contentService.getById(submissionId);
      setPreviewSub(sub);
    } catch {
      showToast('Error', 'Failed to load submission preview.', 'error');
    } finally {
      setLoadingPreview(false);
    }
  };

  const isReviewerOrAdmin = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Manager Approval Centre
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop review queue. BrandLens AI explains issues; humans make final publishing decisions.
          </p>
        </div>

        {/* Role Switcher Pill for Judges */}
        {!isReviewerOrAdmin && (
          <div className="flex items-center gap-2 p-2 px-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span className="text-amber-800 font-semibold">Currently in Creator Mode:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => demoLogin('REVIEWER')}
              icon={<Sparkles className="w-3 h-3 text-brand-600" />}
            >
              Switch to Reviewer Role
            </Button>
          </div>
        )}
      </div>

      {/* Pending Queue Table */}
      <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
        <div className="p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Awaiting Manager Sign-Off ({requests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Strict RBAC Enforced</span>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 text-slate-500 space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-extrabold text-sm text-slate-800">Approval queue is empty!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All submitted content has been processed. New drafts submitted by creators will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-border-subtle">
                <tr>
                  <th className="px-6 py-3.5">Content Item</th>
                  <th className="px-6 py-3.5">Creator</th>
                  <th className="px-6 py-3.5">Revision</th>
                  <th className="px-6 py-3.5">Creator Notes</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Manager Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-brand-50/20 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div>{req.submission_title || 'Content Submission'}</div>
                      <button
                        onClick={() => handlePreviewContent(req.submission_id)}
                        className="text-[11px] text-brand-600 font-semibold hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Eye className="w-3 h-3" /> Inspect copy & findings
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{req.creator_name || 'Creator'}</td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold bg-surface-subtle border border-border px-2.5 py-0.5 rounded-full">
                        v{req.revision_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate italic">
                      "{req.creator_notes || 'No notes provided'}"
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-[11px] font-mono">
                      {new Date(req.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenActionModal(req, 'APPROVE')}
                        icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenActionModal(req, 'REQUEST_CHANGES')}
                        icon={<AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
                      >
                        Request Changes
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenActionModal(req, 'REJECT')}
                        icon={<XCircle className="w-3.5 h-3.5 text-red-500" />}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={!!actionType}
        onClose={() => {
          setActiveReq(null);
          setActionType(null);
        }}
        title={
          actionType === 'APPROVE'
            ? 'Grant Compliance Approval'
            : actionType === 'REJECT'
            ? 'Reject Content Submission'
            : 'Request Changes from Creator'
        }
        description="Your decision and rationale will be permanently recorded in the immutable audit trail."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Decision Rationale <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              className="w-full border border-border p-3 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
              placeholder="State rationale for audit log..."
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Internal Reviewer Comments (Optional)
            </label>
            <input
              type="text"
              value={managerComments}
              onChange={(e) => setManagerComments(e.target.value)}
              placeholder="Guidance for creator or brand team..."
              className="w-full border border-border p-3 rounded-xl font-sans"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveReq(null);
                setActionType(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === 'APPROVE'
                  ? 'primary'
                  : actionType === 'REJECT'
                  ? 'danger'
                  : 'secondary'
              }
              size="sm"
              loading={submittingAction}
              onClick={handleExecuteDecision}
            >
              Confirm {actionType?.replace('_', ' ')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Content Modal */}
      <Modal
        isOpen={!!previewSub}
        onClose={() => setPreviewSub(null)}
        title={previewSub?.title || 'Content Inspection'}
        description={`Channel: ${previewSub?.publishing_channel} • Compliance Score: ${previewSub?.compliance_score}/100`}
        maxWidth="2xl"
      >
        {previewSub && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                Working Copy Ready for Publication:
              </span>
              <div className="p-5 rounded-2xl bg-surface-subtle border border-border text-slate-800 leading-relaxed font-sans text-xs">
                {previewSub.working_text}
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
                Findings Summary ({previewSub.findings?.length || 0}):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {previewSub.findings?.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-xl border border-border bg-white flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-slate-900">{f.title}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                    </div>
                    <Badge variant={f.status === 'accepted' ? 'success' : f.severity}>
                      {f.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewSub(null)}>
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
