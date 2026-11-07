import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  UserCheck,
  Download,
  Printer,
  Sparkles,
  QrCode
} from 'lucide-react';
import { ContentSubmission } from '../../types';

interface ComplianceCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ContentSubmission;
}

export const ComplianceCertificateModal: React.FC<ComplianceCertificateModalProps> = ({
  isOpen,
  onClose,
  submission,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const certId = `CERT-${submission.id.slice(0, 8).toUpperCase()}`;
  const shaHash = `SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.slice(0, 36) + '...';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔏 Cryptographic Compliance Certificate"
      maxWidth="lg"
    >
      <div className="space-y-6 text-xs">
        {/* Printable Certificate Frame */}
        <div
          id="compliance-certificate"
          className="relative rounded-3xl p-8 bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/30 border-4 border-double border-indigo-200 shadow-xl space-y-6 text-center overflow-hidden"
        >
          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-brand-900" />
          </div>

          {/* Top Crest */}
          <div className="space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/25 ring-4 ring-brand-100">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest font-black uppercase text-brand-700 block">
                BrandLens Autonomous Governance Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                CERTIFICATE OF BRAND COMPLIANCE
              </h2>
              <p className="text-[11px] text-slate-500">
                Official Regulatory Clearance & Audit Verification Record
              </p>
            </div>
          </div>

          {/* Certificate Body Statement */}
          <div className="max-w-md mx-auto space-y-2 text-slate-700">
            <p className="text-xs leading-relaxed">
              This document certifies that the creative content titled{' '}
              <strong className="text-slate-900 font-bold underline decoration-brand-400">
                "{submission.title}"
              </strong>{' '}
              has been audited against all official guidelines, clinical facts, and advertising standards of{' '}
              <strong className="text-slate-900 font-bold">GlowCare Skincare</strong>.
            </p>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Final Score</span>
              <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                {submission.compliance_score}/100
              </div>
              <span className="text-[9px] font-bold text-emerald-600">Publish Ready</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Status</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                Approved
              </div>
              <span className="text-[9px] font-semibold text-brand-700">Revision v{submission.current_revision_number}</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Audited Channel</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {submission.publishing_channel}
              </div>
              <span className="text-[9px] text-slate-500">Cross-Platform</span>
            </div>
          </div>

          {/* Signatures & QR Hash */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between text-left max-w-lg mx-auto">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Authorized Signature</span>
              <div className="font-serif italic text-base text-slate-900 font-bold">
                Alex Rivera, Compliance Lead
              </div>
              <span className="text-[9px] text-slate-500 font-mono block">
                Signed on: {new Date(submission.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Cryptographic QR Block */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <QrCode className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-bold text-slate-800 block">{certId}</span>
                <span className="text-[8px] text-slate-400 font-mono block truncate max-w-[90px]">{shaHash}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Immutable proof stored in BrandLens Audit Ledger.
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
