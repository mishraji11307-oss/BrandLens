import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentService, approvalService } from '../services/api';
import { ContentSubmission, RewriteOption, Comment } from '../types';
import { SplitScreenWorkspace } from '../components/review/SplitScreenWorkspace';
import { RewriteAssistantModal } from '../components/review/RewriteAssistantModal';
import { ComplianceCertificateModal } from '../components/compliance/ComplianceCertificateModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useNotification } from '../context/NotificationContext';
import {
  ShieldCheck,
  Sparkles,
  Send,
  RefreshCw,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award
} from 'lucide-react';

export const ReviewWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [submission, setSubmission] = useState<ContentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reRunningReview, setReRunningReview] = useState(false);

  // Rewrite Assistant Modal
  const [rewriteOptions, setRewriteOptions] = useState<Record<string, RewriteOption> | null>(null);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [loadingRewrites, setLoadingRewrites] = useState(false);

  // Submit Approval Modal
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  // Discussion Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const fetchSubmission = async () => {
    if (!id) return;
    try {
      const data = await contentService.getById(id);
      setSubmission(data);
      const commentsData = await approvalService.getComments(id);
      setComments(commentsData);
    } catch {
      showToast('Error', 'Failed to load content submission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id]);

  const handleReRunReview = async () => {
    if (!id) return;
    setReRunningReview(true);
    try {
      const updated = await contentService.runReview(id);
      setSubmission(updated);
      showToast(
        'Review Complete',
        `AI engine re-evaluated copy: ${updated.findings.length} findings logged.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to re-run brand review.', 'error');
    } finally {
      setReRunningReview(false);
    }
  };

  const handleOpenRewriteModal = async () => {
    if (!submission) return;
    setLoadingRewrites(true);
    try {
      const options = await contentService.getRewrites(
        submission.working_text,
        submission.brand_kit_id
      );
      setRewriteOptions(options);
      setIsRewriteModalOpen(true);
    } catch {
      showToast('Error', 'Failed to generate AI rewrites.', 'error');
    } finally {
      setLoadingRewrites(false);
    }
  };

  const handleApplyRewrite = (newText: string) => {
    if (!submission) return;
    setSubmission({
      ...submission,
      working_text: newText,
      current_revision_number: submission.current_revision_number + 1,
    });
    showToast('Rewrite Applied', 'Working revision updated with compliant copy.', 'success');
  };

  const handleSubmitForApproval = async () => {
    if (!id) return;
    setSubmittingApproval(true);
    try {
      await contentService.submitApproval(id, approvalNotes);
      showToast('Submitted for Approval', 'Sent to manager review queue.', 'success');
      setIsApprovalModalOpen(false);
      fetchSubmission();
    } catch {
      showToast('Error', 'Failed to submit content for approval.', 'error');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const handlePostComment = async () => {
    if (!id || !newCommentText.trim()) return;
    setPostingComment(true);
    try {
      const added = await approvalService.addComment(id, newCommentText, 'creator_note');
      setComments([...comments, added]);
      setNewCommentText('');
      showToast('Comment Added', 'Your note was posted to the review thread.', 'info');
    } catch {
      showToast('Error', 'Failed to post comment.', 'error');
    } finally {
      setPostingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-xs font-bold text-slate-700">Loading Governance Review Workspace...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Submission Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            This submission could not be loaded or may have been deleted. You can start a new review or return to submission history.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/history')}>
            View History
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/review')}>
            New Content Review
          </Button>
        </div>
      </div>
    );
  }

  const score = submission.compliance_score || 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Control Actions (Watermelon UI Bar Style) */}
      <div className="p-5 bg-white/95 rounded-3xl border border-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-xl border border-border hover:bg-brand-50 hover:text-brand-700 text-slate-500 transition-colors shadow-2xs"
            title="Back to Submissions History"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {submission.title}
              </h2>
              <Badge
                dot
                variant={
                  submission.status === 'Approved'
                    ? 'success'
                    : submission.status === 'Pending Approval'
                    ? 'medium'
                    : submission.status === 'Rejected'
                    ? 'critical'
                    : 'neutral'
                }
              >
                {submission.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Campaign: <strong className="text-slate-700">{submission.campaign_name || 'Standard'}</strong> • Channel:{' '}
              <strong className="text-slate-700">{submission.publishing_channel}</strong> • Revision{' '}
              <span className="font-mono font-bold text-brand-700">v{submission.current_revision_number}</span>
            </p>
          </div>
        </div>

        {/* Score & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Compliance Score Pill */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border border-border bg-gradient-to-r from-surface-subtle to-white shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Compliance Score
              </span>
              <div
                className={`text-xs font-extrabold font-mono ${
                  score >= 85 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-red-700'
                }`}
              >
                {score}/100 {score >= 85 ? '• Publish Ready' : '• Fixes Needed'}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReRunReview}
            loading={reRunningReview}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Re-Run AI Review
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenRewriteModal}
            loading={loadingRewrites}
            icon={<Sparkles className="w-3.5 h-3.5 text-brand-300" />}
          >
            Smart Rewrite Assistant
          </Button>

          {submission.status === 'Approved' ? (
            <Button
              variant="glow"
              size="sm"
              onClick={() => setIsCertModalOpen(true)}
              icon={<Award className="w-3.5 h-3.5 text-white" />}
            >
              View Compliance Certificate
            </Button>
          ) : (
            <Button
              variant="glow"
              size="sm"
              onClick={() => setIsApprovalModalOpen(true)}
              icon={<Send className="w-3.5 h-3.5 text-white" />}
            >
              Submit for Approval
            </Button>
          )}
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <SplitScreenWorkspace submission={submission} onRefresh={fetchSubmission} />

      {/* Review Discussion & Comments Section */}
      <div className="p-6 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-xs text-slate-900 tracking-tight">
              Compliance & Review Discussion Thread
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              ({comments.length} notes)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Internal audit discussion between creators and reviewers
          </span>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 italic bg-surface-subtle/50 rounded-2xl border border-border-subtle">
              No notes in this discussion thread yet. Creators and reviewers can collaborate here.
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-surface-subtle border border-border text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[10px]">
                      {c.author_name?.charAt(0) || 'R'}
                    </div>
                    <strong className="text-slate-800">{c.author_name || 'Reviewer'}</strong>
                    <span className="text-[10px] uppercase font-bold text-brand-600 px-1.5 py-0.2 rounded bg-brand-50 border border-brand-200/60">
                      {c.comment_type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(c.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-slate-700 pl-7 leading-relaxed">{c.comment_text}</p>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <div className="flex gap-2.5 pt-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Add a compliance review note or reply..."
            className="flex-1 border border-border rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-surface-subtle/50 focus:bg-white transition-all"
            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
          />
          <Button
            variant="primary"
            size="sm"
            loading={postingComment}
            onClick={handlePostComment}
            icon={<Send className="w-3.5 h-3.5" />}
          >
            Post Note
          </Button>
        </div>
      </div>

      {/* Rewrite Assistant Modal */}
      <RewriteAssistantModal
        isOpen={isRewriteModalOpen}
        onClose={() => setIsRewriteModalOpen(false)}
        options={rewriteOptions}
        onApplyRewrite={handleApplyRewrite}
      />

      {/* Submit for Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Submit Content for Manager Approval"
        description="Notify the compliance lead that this content has passed your checks and is ready for final sign-off."
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notes for Reviewer (Optional)
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g., Replaced prohibited medical claim with approved claim AC-12 and verified 14-day clinical timeline. Ready for Instagram."
              className="w-full border border-border p-3 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-border-subtle">
            <Button variant="outline" size="sm" onClick={() => setIsApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              loading={submittingApproval}
              onClick={handleSubmitForApproval}
              icon={<Send className="w-3.5 h-3.5 text-white" />}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>

      {/* Compliance Certificate Modal */}
      {submission && (
        <ComplianceCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          submission={submission}
        />
      )}
    </div>
  );
};
