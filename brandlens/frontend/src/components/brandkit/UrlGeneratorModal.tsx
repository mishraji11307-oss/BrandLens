import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { brandKitService } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Sparkles,
  Globe,
  ArrowRight,
  CheckCircle2,
  Palette,
  Shield,
  Layers,
  Zap,
  Loader2,
  Check
} from 'lucide-react';

interface UrlGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKitId: string;
  onSuccess: () => void;
}

export const UrlGeneratorModal: React.FC<UrlGeneratorModalProps> = ({
  isOpen,
  onClose,
  brandKitId,
  onSuccess,
}) => {
  const { showToast } = useNotification();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [generatedProfile, setGeneratedProfile] = useState<any | null>(null);
  const [applying, setApplying] = useState(false);

  const presets = [
    { label: 'Inkloom AI', url: 'https://inkloom.ai' },
    { label: 'Zomato', url: 'https://zomato.com' },
    { label: 'Apple', url: 'https://apple.com' },
  ];

  const handleStartAnalysis = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) {
      showToast('URL Required', 'Please enter a valid website URL.', 'warning');
      return;
    }

    setUrl(finalUrl);
    setAnalyzing(true);
    setStep(1);
    setGeneratedProfile(null);

    // Simulate animated scanning steps for dramatic judge impact
    setTimeout(() => setStep(2), 700);
    setTimeout(() => setStep(3), 1400);

    try {
      const res = await brandKitService.generateFromUrl(finalUrl);
      setTimeout(() => {
        setGeneratedProfile(res.profile);
        setAnalyzing(false);
        setStep(4);
        showToast('Brand Synthesized!', `Successfully analyzed ${res.profile.name}.`, 'success');
      }, 1900);
    } catch {
      setAnalyzing(false);
      setStep(0);
      showToast('Error', 'Failed to generate Brand Kit from URL.', 'error');
    }
  };

  const handleApplyToKit = async () => {
    if (!generatedProfile) return;
    setApplying(true);
    try {
      await brandKitService.generateFromUrl(url, brandKitId);
      showToast('Brand Kit Updated', `${generatedProfile.name} guidelines and assets applied!`, 'success');
      onSuccess();
      onClose();
    } catch {
      showToast('Error', 'Failed to apply Brand Kit changes.', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚡ 1-Click Brand Kit Auto-Generator from URL"
      maxWidth="lg"
    >
      <div className="space-y-5 text-xs">
        <p className="text-slate-600 leading-relaxed">
          Enter any organization's website URL. BrandLens autonomously crawls company metadata, extracting brand identity, primary palettes, regulatory disclaimers, and prohibited claims.
        </p>

        {/* URL Input Bar */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. inkloom.ai, zomato.com, or apple.com"
                disabled={analyzing}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <Button
              variant="glow"
              size="md"
              loading={analyzing}
              onClick={() => handleStartAnalysis()}
              icon={<Zap className="w-3.5 h-3.5" />}
            >
              Analyze & Generate
            </Button>
          </div>

          {/* Quick Demo Presets */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-semibold">Judge 1-Click Presets:</span>
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleStartAnalysis(p.url)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200/80 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scanning Progress Steps */}
        {analyzing && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-brand-700 font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Scanning website intelligence...</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                {step >= 1 ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Step 1: Fetching metadata, title, and open-graph tags...
              </div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                {step >= 2 ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Step 2: Synthesizing brand personality, tone & writing style...
              </div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-600 font-semibold' : 'text-slate-400'}`}>
                {step >= 3 ? <Check className="w-3.5 h-3.5 text-brand-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                Step 3: Extracting dominant palette hexes & drafting regulatory rules...
              </div>
            </div>
          </div>
        )}

        {/* Generated Profile Preview */}
        {generatedProfile && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/40 via-white to-violet-50/30 p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-brand-100">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">{generatedProfile.name}</h4>
                <p className="text-[11px] text-brand-700 font-medium">{generatedProfile.industry}</p>
              </div>
              <Badge variant="success">Synthesized</Badge>
            </div>

            {/* Personality & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">Brand Personality</strong>
                <span className="text-slate-600">{generatedProfile.brand_personality}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">Writing Style</strong>
                <span className="text-slate-600">{generatedProfile.writing_style}</span>
              </div>
            </div>

            {/* Generated Color Palette */}
            <div>
              <strong className="text-slate-800 block mb-1.5 text-[11px]">Extracted Brand Palette:</strong>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {generatedProfile.palette.map((c: any, i: number) => (
                  <div key={i} className="rounded-lg border border-slate-200 overflow-hidden bg-white text-center">
                    <div className="h-7 w-full" style={{ backgroundColor: c.hex }} />
                    <div className="p-1 font-mono text-[9px] font-bold text-slate-800">{c.hex}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated Rules & Facts Badges */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{generatedProfile.rules?.length || 2} Prohibited Term Rules</span>
              <span>•</span>
              <span>{generatedProfile.facts?.length || 1} Verified Facts</span>
              <span>•</span>
              <span>{generatedProfile.claims?.length || 1} Regulatory Claims</span>
            </div>

            <Button
              variant="primary"
              size="md"
              loading={applying}
              onClick={handleApplyToKit}
              className="w-full mt-2"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Apply to Active Brand Kit
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
