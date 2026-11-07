import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { UrlGeneratorModal } from '../components/brandkit/UrlGeneratorModal';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  UploadCloud,
  Check,
  AlertTriangle,
  Palette,
  Shield,
  Layers,
  CheckCircle2,
  Copy,
  Info,
  Zap
} from 'lucide-react';
import { brandKitService } from '../services/api';
import { BrandKit, BrandRule, ApprovedFact, ApprovedClaim } from '../types';
import { useNotification } from '../context/NotificationContext';

export const BrandKitPage: React.FC = () => {
  const { showToast } = useNotification();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [activeKit, setActiveKit] = useState<BrandKit | null>(null);
  const [activeTab, setActiveTab] = useState<
    'terminology' | 'identity' | 'tone' | 'facts' | 'claims' | 'visual' | 'documents'
  >('terminology');
  const [loading, setLoading] = useState(true);

  // Add Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [ruleCode, setRuleCode] = useState('');
  const [ruleCategory, setRuleCategory] = useState<'terminology' | 'tone' | 'claims' | 'disclaimer'>(
    'terminology'
  );
  const [ruleTitle, setRuleTitle] = useState('');
  const [prohibitedTerm, setProhibitedTerm] = useState('');
  const [preferredTerm, setPreferredTerm] = useState('');
  const [ruleSeverity, setRuleSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [ruleEvidence, setRuleEvidence] = useState('');
  const [savingRule, setSavingRule] = useState(false);

  // Document Upload
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchBrandKit = async () => {
    try {
      const data = await brandKitService.getAll();
      setKits(data);
      if (data.length > 0) {
        setActiveKit(data[0]);
      }
    } catch {
      showToast('Error', 'Failed to load brand kits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandKit();
  }, []);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeKit) return;
    setSavingRule(true);
    try {
      await brandKitService.addRule(activeKit.id, {
        rule_code: ruleCode || `RULE-${Math.floor(Math.random() * 900 + 100)}`,
        category: ruleCategory,
        title: ruleTitle,
        description: `Prohibits '${prohibitedTerm}' in favor of '${preferredTerm}'.`,
        prohibited_term: prohibitedTerm,
        preferred_term: preferredTerm,
        severity: ruleSeverity,
        confidence: '0.96',
        suggested_fix: preferredTerm,
        evidence_citation: ruleEvidence || 'Brand Guidelines Document',
      });
      showToast('Rule Created', `Added rule for '${prohibitedTerm}'.`, 'success');
      setIsRuleModalOpen(false);
      setRuleTitle('');
      setProhibitedTerm('');
      setPreferredTerm('');
      fetchBrandKit();
    } catch {
      showToast('Error', 'Failed to create rule.', 'error');
    } finally {
      setSavingRule(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeKit || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await brandKitService.uploadDocument(activeKit.id, formData);
      showToast(
        'Document Indexed',
        `Guidelines file '${file.name}' chunked and searchable for RAG.`,
        'success'
      );
      fetchBrandKit();
    } catch {
      showToast('Error', 'Failed to upload guidelines document.', 'error');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    showToast('Copied Color', `${hex} copied to clipboard.`, 'info');
  };

  if (loading || !activeKit) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading Brand Kit...</div>;
  }

  const tabs = [
    { id: 'terminology', label: `Terminology (${activeKit.rules.length})`, icon: Shield },
    { id: 'identity', label: 'Brand Identity', icon: BookOpen },
    { id: 'tone', label: 'Tone & Voice', icon: Sparkles },
    { id: 'facts', label: `Approved Facts (${activeKit.approved_facts.length})`, icon: CheckCircle2 },
    { id: 'claims', label: `Approved Claims (${activeKit.approved_claims.length})`, icon: Layers },
    { id: 'visual', label: 'Visual Palette', icon: Palette },
    { id: 'documents', label: 'Guidelines (RAG)', icon: FileText },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {activeKit.name}
            </h1>
            <span className="text-[10px] bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-brand-200">
              Master Brand Kit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeKit.description ||
              'Pre-publication governance standards, clinical facts, regulatory claims, and visual palette.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUrlModalOpen(true)}
            icon={<Zap className="w-3.5 h-3.5 text-brand-600" />}
          >
            Auto-Generate from URL
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsRuleModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-white" />}
          >
            Add Brand Rule
          </Button>
        </div>
      </div>

      {/* Watermelon Animated Tab Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-surface-subtle border border-border shadow-2xs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-card shadow-brand-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Terminology */}
      {activeTab === 'terminology' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
            <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Prohibited Terminology & Approved Phrasing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The Deterministic Rule Engine checks these terms with regex word boundaries to prevent false positives.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle/80 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-border-subtle">
                  <tr>
                    <th className="px-6 py-3.5">Rule Code</th>
                    <th className="px-6 py-3.5">Prohibited Term</th>
                    <th className="px-6 py-3.5">Approved Replacement</th>
                    <th className="px-6 py-3.5">Severity</th>
                    <th className="px-6 py-3.5">Source Evidence Citation</th>
                    <th className="px-6 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {activeKit.rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-brand-50/30 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-600">
                        {rule.rule_code}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-600 bg-red-50/80 px-2.5 py-1 rounded-lg border border-red-200/80 font-mono">
                          {rule.prohibited_term || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 font-mono">
                          {rule.preferred_term || rule.suggested_fix}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={rule.severity} dot>
                          {rule.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {rule.evidence_citation || 'Brand Guidelines'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Brand Identity */}
      {activeTab === 'identity' && (
        <div className="p-7 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Organization Name</label>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-slate-800 font-semibold">
                {activeKit.name}
              </div>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Industry Category</label>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-slate-800 font-semibold">
                {activeKit.industry || 'Dermatology & Clean Cosmetics'}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-slate-800 font-medium leading-relaxed">
                {activeKit.target_audience ||
                  'Consumers seeking scientifically substantiated, gentle skincare formulas.'}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Brand Personality Traits</label>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border text-slate-800 font-medium leading-relaxed">
                {activeKit.brand_personality || 'Friendly, science-backed, trustworthy, professional.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Tone & Voice */}
      {activeTab === 'tone' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-white shadow-subtle space-y-3">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approved Tone Guidelines
            </span>
            <h4 className="font-extrabold text-sm text-slate-900">Science-Backed & Measured</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use measured dermatological language. Emphasize active percentages (2% Encapsulated Salicylic Acid), clinical timelines (14 days), and skin pH balance (pH 5.5).
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-red-200/80 bg-gradient-to-br from-red-50/40 to-white shadow-subtle space-y-3">
            <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Prohibited Tone & Phrasing
            </span>
            <h4 className="font-extrabold text-sm text-slate-900">Hyperbole & Absolute Guarantees</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never use sensational buzzwords like "miracle cure", "instant fix", "100% permanent", or "guaranteed results". Under cosmetics regulation, skincare does not claim to cure pathology.
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Approved Facts */}
      {activeTab === 'facts' && (
        <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="font-extrabold text-sm text-slate-900">
              Verified Clinical Facts Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Claims referencing these verified values are substantiated by the RAG search engine.
            </p>
          </div>
          <div className="divide-y divide-border-subtle text-xs">
            {activeKit.approved_facts.map((fact) => (
              <div
                key={fact.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-50/20 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-brand-50 text-brand-700 font-extrabold px-2 py-0.5 rounded-full border border-brand-200">
                      {fact.fact_code}
                    </span>
                    <strong className="text-slate-900 text-sm">{fact.name}</strong>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-sans">{fact.approved_value}</p>
                  <p className="text-[10px] text-slate-400">Supporting Source: {fact.supporting_source}</p>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Approved Claims */}
      {activeTab === 'claims' && (
        <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="font-extrabold text-sm text-slate-900">
              Approved Regulatory Marketing Claims
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pre-cleared marketing copy verified for paid advertising and social media promotions.
            </p>
          </div>
          <div className="divide-y divide-border-subtle text-xs">
            {activeKit.approved_claims.map((claim) => (
              <div
                key={claim.id}
                className="p-5 space-y-2 hover:bg-brand-50/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] bg-brand-50 text-brand-700 font-extrabold px-2 py-0.5 rounded-full border border-brand-200">
                      {claim.claim_code}
                    </span>
                    <strong className="text-slate-900 text-sm font-sans">
                      "{claim.approved_statement}"
                    </strong>
                  </div>
                  <Badge variant="success">Approved Claim</Badge>
                </div>
                <p className="text-slate-500 text-[11px]">
                  <strong>Condition:</strong> {claim.conditions || 'Standard product context'}
                </p>
                <p className="text-slate-400 text-[10px]">Evidence: {claim.supporting_evidence}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Visual Palette */}
      {activeTab === 'visual' && (
        <div className="p-7 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Official Brand Color Palette</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any color swatch to copy its hexadecimal code to the clipboard.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
            {[
              { name: 'Sky Primary', hex: '#0284C7', usage: 'Primary CTA & Accents' },
              { name: 'Botanical Teal', hex: '#0D9488', usage: 'Organic Callouts' },
              { name: 'Slate Navy', hex: '#0F172A', usage: 'Typography & Headers' },
              { name: 'Clean White', hex: '#F8FAFC', usage: 'Surfaces & Cards' },
              { name: 'Amber Alert', hex: '#F59E0B', usage: 'Warnings & Highlights' },
            ].map((color) => (
              <div
                key={color.hex}
                onClick={() => handleCopyHex(color.hex)}
                className="border border-border rounded-2xl overflow-hidden shadow-subtle hover:shadow-card-hover hover:border-brand-300 transition-all cursor-pointer group"
              >
                <div
                  className="h-20 w-full transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-3 bg-white text-xs space-y-0.5">
                  <div className="font-bold text-slate-900">{color.name}</div>
                  <div className="font-mono text-[11px] text-brand-700 font-semibold flex items-center justify-between">
                    <span>{color.hex}</span>
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">{color.usage}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Guidelines Upload (RAG) */}
      {activeTab === 'documents' && (
        <div className="p-7 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-6">
          <div className="border-2 border-dashed border-brand-200/90 rounded-3xl p-8 text-center bg-gradient-to-b from-brand-50/20 to-transparent hover:bg-brand-50/40 transition-colors">
            <UploadCloud className="w-10 h-10 text-brand-600 mx-auto mb-2" />
            <h3 className="font-bold text-xs text-slate-900">Upload Guidelines PDF or DOCX</h3>
            <p className="text-[11px] text-slate-500 mt-1 max-w-md mx-auto">
              Documents are parsed into semantic chunks, preserved with page numbers, and indexed into the RAG vector store for retrieval.
            </p>
            <input
              type="file"
              id="guideline-file-upload"
              accept=".pdf,.docx"
              onChange={handleDocUpload}
              className="hidden"
            />
            <div className="mt-4">
              <Button
                variant="glow"
                size="sm"
                loading={uploadingDoc}
                onClick={() => document.getElementById('guideline-file-upload')?.click()}
              >
                Upload Guideline Document
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700">Currently Indexed Guidelines</h4>
            <div className="p-4 rounded-2xl border border-border bg-surface-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="font-bold text-slate-900">
                    GlowCare_Brand_Guidelines_v2.4.pdf
                  </div>
                  <div className="text-[10px] text-slate-400">
                    18 pages • 4 vector chunks indexed • Version 2.4
                  </div>
                </div>
              </div>
              <Badge variant="success">RAG Active</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      <Modal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title="Add Prohibited or Preferred Brand Rule"
        description="Creates a deterministic check that executes during pre-publication content reviews."
      >
        <form onSubmit={handleAddRule} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Rule Title</label>
            <input
              type="text"
              required
              value={ruleTitle}
              onChange={(e) => setRuleTitle(e.target.value)}
              placeholder="e.g., Prohibited Term: 'cures acne'"
              className="w-full border border-border p-3 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={ruleCategory}
                onChange={(e) => setRuleCategory(e.target.value as any)}
                className="w-full border border-border p-3 rounded-xl bg-surface-subtle"
              >
                <option value="terminology">Terminology</option>
                <option value="claims">Regulatory Claims</option>
                <option value="tone">Brand Tone</option>
                <option value="disclaimer">Disclaimer</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Severity</label>
              <select
                value={ruleSeverity}
                onChange={(e) => setRuleSeverity(e.target.value as any)}
                className="w-full border border-border p-3 rounded-xl bg-surface-subtle"
              >
                <option value="critical">Critical (-25 pts)</option>
                <option value="high">High (-15 pts)</option>
                <option value="medium">Medium (-8 pts)</option>
                <option value="low">Low (-3 pts)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Prohibited Phrase</label>
              <input
                type="text"
                required
                value={prohibitedTerm}
                onChange={(e) => setProhibitedTerm(e.target.value)}
                placeholder="e.g., cures acne"
                className="w-full border border-border p-3 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Approved Replacement</label>
              <input
                type="text"
                required
                value={preferredTerm}
                onChange={(e) => setPreferredTerm(e.target.value)}
                placeholder="e.g., helps reduce appearance of blemishes"
                className="w-full border border-border p-3 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Guideline Citation Evidence</label>
            <input
              type="text"
              value={ruleEvidence}
              onChange={(e) => setRuleEvidence(e.target.value)}
              placeholder="e.g., Brand Guidelines Section 4.1: Medical Claims"
              className="w-full border border-border p-3 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" loading={savingRule}>
              Save Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* 1-Click URL Auto-Generator Modal */}
      <UrlGeneratorModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        brandKitId={activeKit.id}
        onSuccess={fetchBrandKit}
      />
    </div>
  );
};
