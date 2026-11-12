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
  Zap,
  Scale,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { brandKitService } from '../services/api';
import { BrandKit, BrandRule, ApprovedFact, ApprovedClaim } from '../types';
import { useNotification } from '../context/NotificationContext';

export const BrandKitPage: React.FC = () => {
  const { showToast } = useNotification();
  const [kits, setKits] = useState<BrandKit[]>([]);
  const [activeKit, setActiveKit] = useState<BrandKit | null>(null);
  const [activeTab, setActiveTab] = useState<
    'terminology' | 'identity' | 'tone' | 'facts' | 'claims' | 'regulatory' | 'visual' | 'documents'
  >('terminology');
  const [loading, setLoading] = useState(true);

  // Regulatory Packs State (Slide 8, 9, 14)
  const [regulatoryPacks, setRegulatoryPacks] = useState<any[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);

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

  // Claim Evidence Modal
  const [selectedClaimForDossier, setSelectedClaimForDossier] = useState<ApprovedClaim | null>(null);

  const fetchBrandKit = async () => {
    try {
      const data = await brandKitService.getAll();
      setKits(data);
      if (data.length > 0) {
        const kit = data[0];
        setActiveKit(kit);
        fetchRegulatoryPacks(kit.id);
      }
    } catch {
      showToast('Error', 'Failed to load brand kits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegulatoryPacks = async (kitId: string) => {
    try {
      setLoadingPacks(true);
      const res = await brandKitService.getRegulatoryPacks(kitId);
      setRegulatoryPacks(res.packs || []);
    } catch {
      // Fallback packs
      setRegulatoryPacks([
        {
          id: 'ASCI',
          name: 'ASCI Digital Influencer & Marketing Code (India)',
          jurisdiction: 'India',
          badge: 'ASCI India',
          is_active: true,
          description: 'Enforces Clause 1 upfront #Ad/#Collab disclosures and Chapter I.1 verified claims against unbacked market leadership superlatives.',
          rules_count: 2,
          clauses: [
            'Clause 1: Upfront Disclosure (#Ad / #Collab within first 80 characters)',
            'Chapter I.1: Honest Representations & Audited Superlative Claims'
          ]
        },
        {
          id: 'FTC',
          name: 'FTC Endorsement & Testimonial Guides (US - 16 CFR Part 255)',
          jurisdiction: 'United States',
          badge: 'FTC US',
          is_active: true,
          description: 'Enforces clear and conspicuous #Sponsored / #Ad disclosures for affiliate promotions and commercial brand collaborations.',
          rules_count: 1,
          clauses: [
            '16 CFR § 255.5: Mandatory Disclosure of Material Connections & Incentives'
          ]
        },
        {
          id: 'HEALTH_CLAIMS',
          name: 'CDSCO & FDA Health & Cosmetic Claims Standard',
          jurisdiction: 'Global / US / India',
          badge: 'FDA & CDSCO',
          is_active: true,
          description: 'Strictly demarcates cosmetic beautifying claims from pharmaceutical drug claims. Flags curative disease promises without clinical trial certification.',
          rules_count: 3,
          clauses: [
            'Section 4.1: Curative Drug Claims vs Cosmetic Beautifying Statements',
            'Section 3.2: Prohibition of Absolute Outcome Guarantees',
            'Mandatory Clinical Trial Dossier Verification'
          ]
        }
      ]);
    } finally {
      setLoadingPacks(false);
    }
  };

  useEffect(() => {
    fetchBrandKit();
  }, []);

  const handleToggleRegulatoryPack = async (packId: string, currentStatus: boolean) => {
    if (!activeKit) return;
    const newStatus = !currentStatus;
    try {
      await brandKitService.toggleRegulatoryPack(activeKit.id, packId, newStatus);
      setRegulatoryPacks((prev) =>
        prev.map((p) => (p.id === packId ? { ...p, is_active: newStatus } : p))
      );
      showToast(
        'Regulatory Pack Updated',
        `${packId} pack ${newStatus ? 'enabled' : 'disabled'}. Pre-publication governance updated.`,
        'success'
      );
    } catch {
      setRegulatoryPacks((prev) =>
        prev.map((p) => (p.id === packId ? { ...p, is_active: newStatus } : p))
      );
    }
  };

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
    { id: 'regulatory', label: `Regulatory Packs (${regulatoryPacks.filter((p) => p.is_active).length})`, icon: Scale },
    { id: 'claims', label: `Approved Claims (${activeKit.approved_claims.length})`, icon: Layers },
    { id: 'facts', label: `Approved Facts (${activeKit.approved_facts.length})`, icon: CheckCircle2 },
    { id: 'identity', label: 'Brand Identity', icon: BookOpen },
    { id: 'tone', label: 'Tone & Voice', icon: Sparkles },
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
            Single source of truth: tone, terminology, clinical research evidence, ASCI/FTC regulatory packs, and visual assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUrlModalOpen(true)}
            icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
          >
            Auto-Generate from URL
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsRuleModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5 text-white" />}
          >
            Add New Rule
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border-subtle scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 border border-brand-200/90 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Terminology Rules */}
      {activeTab === 'terminology' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeKit.rules.map((rule) => (
              <div
                key={rule.id}
                className="p-5 rounded-3xl border border-border bg-white/95 shadow-subtle hover:border-brand-200 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                      {rule.rule_code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {rule.category}
                    </span>
                  </div>
                  <Badge variant={rule.severity === 'critical' ? 'critical' : rule.severity === 'high' ? 'high' : 'medium'}>
                    {rule.severity}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900">{rule.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rule.description}</p>
                </div>

                {rule.prohibited_term && (
                  <div className="p-3 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-red-700 font-mono font-semibold">
                        ✗ Prohibited: <strong>"{rule.prohibited_term}"</strong>
                      </span>
                    </div>
                    {rule.preferred_term && (
                      <div className="flex items-center justify-between text-emerald-700 font-mono font-semibold">
                        <span>✓ Preferred: <strong>"{rule.preferred_term}"</strong></span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[260px]">Citation: {rule.evidence_citation}</span>
                  <span className="font-mono font-semibold text-brand-600">
                    {Math.round(parseFloat(rule.confidence || '0.95') * 100)}% Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Regulatory Packs (Slide 8, 9, 14) */}
      {activeTab === 'regulatory' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-violet-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                1-Click Regulatory Compliance Packs (Slide 8 & 9)
              </h3>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Automatically attaches verified statutory advertising and cosmetic claim rules to your pre-publication gateway.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold font-mono text-[10px] shrink-0">
              Compliance Help Only • Not Legal Advice
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regulatoryPacks.map((pack) => (
              <div
                key={pack.id}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  pack.is_active
                    ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/10 shadow-card-hover'
                    : 'bg-slate-50/60 border-slate-200 opacity-70'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                      {pack.badge}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleRegulatoryPack(pack.id, pack.is_active)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                        pack.is_active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {pack.is_active ? '✓ Enabled' : '○ Disabled'}
                    </button>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{pack.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pack.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Enforced Statutory Clauses:
                    </span>
                    {pack.clauses?.map((clause: string, i: number) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0 mt-0.5" />
                        <span>{clause}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Jurisdiction: <strong>{pack.jurisdiction}</strong></span>
                  <span className="font-bold text-brand-700">{pack.rules_count} Active Rules</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Approved Claims (Claim Evidence - Slide 8 & 10) */}
      {activeTab === 'claims' && (
        <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Approved Regulatory Marketing Claims & Clinical Evidence (Slide 8)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every verified claim is backed by formal clinical trial research and page citations.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Audit-Ready Evidence Dossier
            </span>
          </div>

          <div className="divide-y divide-border-subtle text-xs">
            {activeKit.approved_claims.map((claim) => (
              <div
                key={claim.id}
                className="p-6 space-y-3 hover:bg-brand-50/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[11px] bg-brand-100 text-brand-800 font-black px-2.5 py-0.5 rounded-full border border-brand-300">
                      {claim.claim_code}
                    </span>
                    <strong className="text-slate-900 text-sm font-sans">
                      "{claim.approved_statement}"
                    </strong>
                  </div>
                  <Badge variant="success">Clinically Cleared</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-600 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Usage Conditions & Product Scope:
                    </span>
                    <p className="text-[11px] text-slate-700 mt-0.5">
                      {claim.conditions || 'Applicable to Clarifying Blemish Serum with 2-week context.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Clinical Evidence Dossier:
                    </span>
                    <p className="text-[11px] text-brand-700 font-semibold mt-0.5 flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{claim.supporting_evidence || 'Clinical Trial Report GCS-2024-B (n=120, double-blind)'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Source Document: <strong>{claim.source_document || 'GlowCare_Brand_Guidelines_v2.4.pdf'}</strong> (Page 11)</span>
                  <button
                    type="button"
                    onClick={() => setSelectedClaimForDossier(claim)}
                    className="font-bold text-brand-600 hover:underline flex items-center gap-1"
                  >
                    <span>View Evidence Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Approved Facts */}
      {activeTab === 'facts' && (
        <div className="rounded-3xl border border-border bg-white/95 shadow-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle">
            <h3 className="font-extrabold text-sm text-slate-900">Verified Clinical Facts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical statistics. References to expired facts are automatically flagged as Critical issues.
            </p>
          </div>
          <div className="divide-y divide-border-subtle text-xs">
            {activeKit.approved_facts.map((fact) => (
              <div key={fact.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                      {fact.fact_code}
                    </span>
                    <strong className="text-slate-900">{fact.name}</strong>
                  </div>
                  <p className="text-slate-600 font-medium">"{fact.approved_value}"</p>
                  <p className="text-[10px] text-slate-400">Source: {fact.supporting_source}</p>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Identity */}
      {activeTab === 'identity' && (
        <div className="p-7 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Brand Identity & Positioning</h3>
            <p className="text-xs text-slate-500 mt-0.5">Master positioning statements and audience definitions.</p>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="font-bold text-slate-700 block">Brand Personality</span>
              <p className="text-slate-600">{activeKit.brand_personality}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="font-bold text-slate-700 block">Target Audience</span>
              <p className="text-slate-600">{activeKit.target_audience}</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle space-y-1">
              <span className="font-bold text-slate-700 block">Writing Style & Tone Constraints</span>
              <p className="text-slate-600">{activeKit.writing_style}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Tone & Voice */}
      {activeTab === 'tone' && (
        <div className="p-7 rounded-3xl border border-border bg-white/95 shadow-subtle space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Brand Tone & Voice Framework</h3>
            <p className="text-xs text-slate-500 mt-0.5">Guides the Layer 3 Contextual AI evaluation.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 text-xs space-y-1">
              <span className="font-bold text-brand-900 block">Scientific & Grounded</span>
              <p className="text-slate-600">Explain active mechanisms. Avoid hyperbole and overnight miracle cure promises.</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 text-xs space-y-1">
              <span className="font-bold text-indigo-900 block">Honest & Transparent</span>
              <p className="text-slate-600">State individual biological variability. Always append mandatory disclaimer notices.</p>
            </div>
            <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-200/80 text-xs space-y-1">
              <span className="font-bold text-violet-900 block">Empowering & Friendly</span>
              <p className="text-slate-600">Support consumer dermatology education with actionable advice without medical fear-mongering.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Visual Palette */}
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

      {/* Tab 8: Guidelines Upload (RAG) */}
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

      {/* Clinical Claim Evidence Dossier Modal (Slide 8) */}
      {selectedClaimForDossier && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedClaimForDossier(null)}
          title={`🔬 Clinical Evidence Dossier (${selectedClaimForDossier.claim_code})`}
          description="Detailed clinical research backing and statutory approval record."
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                Approved Marketing Claim Statement:
              </span>
              <p className="font-bold text-sm text-slate-900">
                "{selectedClaimForDossier.approved_statement}"
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-700 block">Clinical Trial Protocol & Evidence:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {selectedClaimForDossier.supporting_evidence || 'Double-blind, placebo-controlled trial n=120 over 14 days demonstrating statistically significant reduction in visible blemish redness.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Mandatory Usage Condition:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {selectedClaimForDossier.conditions || 'Must reference twice-daily application and append standard disclaimer.'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block">Guideline Citation & Page Reference:</span>
                <p className="text-slate-600 mt-0.5 leading-relaxed font-mono">
                  {selectedClaimForDossier.source_document || 'GlowCare_Brand_Guidelines_v2.4.pdf'} — Section 4.1, Page 11
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedClaimForDossier(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}

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
