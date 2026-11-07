import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Palette,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sliders,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Image as ImageIcon,
  ShieldCheck,
  CheckCheck,
  XCircle,
  HelpCircle,
  Maximize2,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { visualService } from '../services/api';
import { VisualAuditResult } from '../types';
import { useNotification } from '../context/NotificationContext';

export const VisualCheckerPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [textColor, setTextColor] = useState('#0F172A');
  const [bgColor, setBgColor] = useState('#F8FAFC');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<VisualAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      // Use FileReader for robust data URI rendering
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunVisualCheck = async () => {
    setLoading(true);
    try {
      const result = await visualService.check(textColor, bgColor, imageFile || undefined);
      setAuditResult(result);
      if (result.findings && result.findings.length > 0) {
        showToast('Visual Divergence Detected', 'Asset contains colors outside the approved Brand Kit.', 'error');
      } else {
        showToast('Visual Check Complete', 'Dominant palette and WCAG contrast evaluated.', 'success');
      }
    } catch {
      showToast('Error', 'Failed to run visual compliance check.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    showToast('Copied', `Color ${hex} copied to clipboard.`, 'info');
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const applyPreset = (text: string, bg: string) => {
    setTextColor(text);
    setBgColor(bg);
  };

  const hasBrandDivergence = auditResult && auditResult.findings && auditResult.findings.some(f => f.type === 'unapproved_color');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200/60">
            <Palette className="w-3 h-3 text-violet-600" />
            Computer Vision & Palette Auditing
          </span>
          <span className="text-[11px] text-slate-400">• OpenCV + Pillow + WCAG 2.1</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Smart Brand Visual & Palette Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Inspects creative imagery with computer vision against official Brand Kit color guidelines, and tests WCAG 2.1 text contrast ratios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input & Upload Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Creative Image Dropzone */}
          <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900">Upload Product or Ad Image</h3>
              <span className="text-[10px] text-slate-400 font-mono">PNG / JPG / WEBP</span>
            </div>

            <div
              onClick={() => document.getElementById('visual-file-upload')?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 bg-slate-50/50 hover:bg-brand-50/20 group"
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative mx-auto max-w-xs overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white p-1">
                    <img
                      src={imagePreview}
                      alt="Uploaded creative"
                      className="max-h-48 w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{imageFile?.name}</p>
                    <span className="text-[10px] text-brand-600 underline font-medium">Replace</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 py-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform duration-200">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Drop Product Image or Creative Banner</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Click to browse your device</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="visual-file-upload"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Color Pickers for Contrast Ratio Testing */}
            <div className="pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">WCAG Text & Surface Check</h4>
                  <p className="text-[10px] text-slate-400">Independent color contrast test for typography</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => applyPreset('#0F172A', '#F8FAFC')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Dark/Light
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('#6366F1', '#FFFFFF')}
                    className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 hover:bg-brand-100"
                  >
                    Brand
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Text Color</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full text-xs font-mono uppercase focus:outline-none text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Background Surface</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-6 h-6 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full text-xs font-mono uppercase focus:outline-none text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div
                className="p-4 rounded-xl text-center space-y-1 border shadow-xs transition-colors duration-200"
                style={{ backgroundColor: bgColor, color: textColor, borderColor: '#E2E8F0' }}
              >
                <div className="text-sm font-extrabold tracking-tight">GlowCare Skincare</div>
                <div className="text-[11px] opacity-80 max-w-xs mx-auto">
                  Typography readability sample on selected background surface
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleRunVisualCheck}
              className="w-full"
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Analyze Visual & Palette Compliance
            </Button>
          </div>

          {/* Helper Card: Direct to Content Review */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/50 border border-indigo-100 text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-950 font-bold">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Checking Product Claims or Packaging Text?</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              To detect prohibited medical claims (e.g. <em>"cures acne"</em>), fake guarantees, or unapproved marketing claims, use the <strong>Content Review Workspace</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/review')}
              className="w-full text-xs bg-white text-indigo-700"
              icon={<ArrowRight className="w-3 h-3" />}
            >
              Go to Content Review Workspace
            </Button>
          </div>
        </div>

        {/* Right: Results Display */}
        <div className="lg:col-span-7 space-y-5">
          {auditResult ? (
            <div className="space-y-5">
              {/* 1. OVERALL BRAND KIT ALIGNMENT BANNER (Prominent Front & Center) */}
              {hasBrandDivergence ? (
                <div className="rounded-2xl border-2 border-red-300 bg-red-50/80 p-5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-red-950">
                          BRAND DIVERGENCE DETECTED — UNAPPROVED ASSET
                        </h4>
                        <p className="text-[11px] text-red-700 mt-0.5">
                          This image diverges from GlowCare Skincare's official visual brand kit.
                        </p>
                      </div>
                    </div>
                    <Badge variant="critical" dotPulse>Divergent</Badge>
                  </div>

                  {auditResult.findings.map((f, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-red-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{f.title}</div>
                      <p className="text-slate-600 text-[11px]">{f.suggestion}</p>
                      <div className="text-[11px] text-slate-500 font-mono pt-1">
                        Expected: <span className="text-emerald-700 font-bold">{f.expected}</span>
                      </div>
                      <div className="text-[11px] text-red-700 font-mono font-bold">
                        {f.actual}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-emerald-950">Brand Palette Compliant</h4>
                      <p className="text-[11px] text-emerald-700">Dominant colors match approved brand guidelines.</p>
                    </div>
                  </div>
                  <Badge variant="success">Approved Tone</Badge>
                </div>
              )}

              {/* 2. EXTRACTED DOMINANT COLOR PALETTE BENTO */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-violet-600" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider block">
                        Extracted Dominant Color Palette
                      </span>
                      <span className="text-[10px] text-slate-400">Quantized with Pillow from uploaded asset</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {auditResult.dominant_colors.length} Swatches
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {auditResult.dominant_colors.map((c, i) => (
                    <div
                      key={i}
                      onClick={() => copyToClipboard(c.hex)}
                      className="group cursor-pointer rounded-xl border border-slate-200 hover:border-brand-400 overflow-hidden shadow-2xs hover:shadow-xs transition-all duration-200"
                    >
                      <div className="h-14 w-full relative" style={{ backgroundColor: c.hex }}>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs flex items-center gap-1">
                            {copiedHex === c.hex ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copiedHex === c.hex ? 'Copied' : 'Copy'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 bg-white space-y-0.5">
                        <div className="font-mono font-bold text-xs text-slate-900">{c.hex}</div>
                        <div className="text-[10px] text-slate-500">{c.percentage}% of pixels</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multimodal Packaging & Banner Text Extractor */}
              {(auditResult as any).packaging_text && (
                <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider block">
                          Extracted Packaging & Banner Text (Multimodal OCR)
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Text printed on product bottle or creative graphic detected via computer vision
                        </span>
                      </div>
                    </div>
                    <Badge variant="brand">OCR Verified</Badge>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono leading-relaxed text-slate-800 whitespace-pre-wrap">
                    {(auditResult as any).packaging_text}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Claims printed on packaging were inspected against active Brand Rules.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/review')}
                      icon={<ArrowRight className="w-3 h-3 text-brand-600" />}
                    >
                      Audit Full Copy in Review
                    </Button>
                  </div>
                </div>
              )}

              {/* 3. WCAG 2.1 TEXT CONTRAST METER (Explicitly labeled for Accessibility) */}
              <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider block">
                        WCAG 2.1 Text Readability Contrast
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Evaluates contrast between text color ({textColor}) & background surface ({bgColor})
                      </span>
                    </div>
                  </div>
                  <Badge variant={auditResult.contrast_analysis.aa_normal_pass ? 'success' : 'critical'}>
                    Text Readability: {auditResult.contrast_analysis.status}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                    {auditResult.contrast_analysis.ratio}:1
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/60">
                    {auditResult.contrast_analysis.aaa_normal_pass ? 'Exceeds AAA Standard' : 'Meets AA Standard'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {auditResult.contrast_analysis.feedback}
                </p>

                {/* 3 Tier WCAG Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <span className="text-slate-500 block text-[10px] font-medium">Normal Body Text (AA)</span>
                    <div className="flex items-center justify-center gap-1 font-bold text-xs">
                      {auditResult.contrast_analysis.aa_normal_pass ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">PASS (≥ 4.5:1)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-red-700">FAIL</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <span className="text-slate-500 block text-[10px] font-medium">Large Headlines (AA)</span>
                    <div className="flex items-center justify-center gap-1 font-bold text-xs">
                      {auditResult.contrast_analysis.aa_large_pass ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">PASS (≥ 3.0:1)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-red-700">FAIL</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                    <span className="text-slate-500 block text-[10px] font-medium">Enhanced Vision (AAA)</span>
                    <div className="flex items-center justify-center gap-1 font-bold text-xs">
                      {auditResult.contrast_analysis.aaa_normal_pass ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">PASS (≥ 7.0:1)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-amber-700">ADVISORY</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center text-slate-500 shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Palette className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-slate-800">Visual Compliance Workspace Ready</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Upload a product image or creative asset to detect brand color divergence and test text accessibility.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
