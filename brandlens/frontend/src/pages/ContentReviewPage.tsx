import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileCode,
  Image as ImageIcon,
  Check,
  Layers,
  Zap,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Megaphone,
  Scan,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { contentService } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export const ContentReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [title, setTitle] = useState('');
  const [campaign, setCampaign] = useState('');
  const [channel, setChannel] = useState('Instagram');
  const [category, setCategory] = useState('Social Ad Copy');
  const [inputMode, setInputMode] = useState<'text' | 'ocr' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Multimodal Image OCR Scanner State (Slide 8, 9, 11)
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    extracted_text: string;
    lines: string[];
    confidence: number;
    source: string;
    detected_claims?: string[];
  } | null>(null);
  const [ocrConfirmedText, setOcrConfirmedText] = useState('');
  const [selectedOcrPreset, setSelectedOcrPreset] = useState<string | null>(null);

  // Quick Demo Pre-fill for Judges
  const handleLoadDemoText = () => {
    setTitle('Summer Clarifying Serum Promo');
    setCampaign('Summer Clear Skin Campaign');
    setChannel('Instagram');
    setCategory('Social Ad Copy');
    setTextContent(
      'Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula.'
    );
    showToast(
      'Demo Content Loaded',
      'Loaded official competition test copy with 2 brand violations.',
      'info'
    );
  };

  // 1-Click OCR Scanner Trigger
  const handleTriggerOcr = async (presetType?: string, file?: File) => {
    setOcrScanning(true);
    setOcrResult(null);
    try {
      const data = await contentService.extractOcr(file, presetType);
      setOcrResult(data);
      setOcrConfirmedText(data.extracted_text);
      if (!title) {
        setTitle(data.title_suggestion || 'Scanned Packaging Asset');
      }
      setSelectedOcrPreset(presetType || null);
      showToast(
        'OCR Extraction Complete',
        `Extracted ${data.lines?.length || 0} lines with ${Math.round((data.confidence || 0.9) * 100)}% confidence. Review & confirm below.`,
        'success'
      );
    } catch {
      showToast('OCR Error', 'Failed to scan image. Please try again or paste text directly.', 'error');
    } finally {
      setOcrScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (inputMode === 'ocr') {
        handleTriggerOcr(undefined, file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Validation Error', 'Please specify a title for this content piece.', 'warning');
      return;
    }

    let finalContent = textContent;
    if (inputMode === 'ocr') {
      if (!ocrConfirmedText.trim()) {
        showToast('Validation Error', 'Please scan an image or confirm OCR text before submitting.', 'warning');
        return;
      }
      finalContent = ocrConfirmedText;
    }

    if (inputMode === 'text' && !finalContent.trim()) {
      showToast('Validation Error', 'Please paste or enter copy to review.', 'warning');
      return;
    }

    if (inputMode === 'file' && !selectedFile) {
      showToast('Validation Error', 'Please select a document or image file.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      if (campaign) formData.append('campaign_name', campaign);
      formData.append('publishing_channel', channel);
      formData.append('content_category', category);

      if (inputMode === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('text_content', finalContent);
      }

      // Step 1: Upload & create submission
      const submission = await contentService.upload(formData);

      // Step 2: Run Hybrid AI Review
      const reviewed = await contentService.runReview(submission.id);

      showToast(
        'Review Complete',
        `Generated ${reviewed.findings.length} findings with traceable guideline citations.`,
        'success'
      );
      navigate(`/review/${reviewed.id}`);
    } catch (err: any) {
      showToast(
        'Submission Failed',
        err.response?.data?.detail || 'An error occurred during content review.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const channelOptions = [
    { id: 'Instagram', label: 'Instagram', icon: Instagram },
    { id: 'LinkedIn', label: 'LinkedIn', icon: Linkedin },
    { id: 'Google Ads', label: 'Google Ads', icon: Globe },
    { id: 'Email', label: 'Email', icon: Mail },
    { id: 'Advertisement', label: 'Paid Ads', icon: Megaphone },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Submit Content for Governance Review
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates draft marketing copy against GlowCare Brand Kit rules, regulatory claims, and tone standards.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadDemoText}
          icon={<Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />}
        >
          Load Demo Copy (Judge Fast Test)
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-7 rounded-3xl bg-white/95 border border-border shadow-subtle space-y-6 backdrop-blur-sm">
          {/* Channel Selector Chips */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wider">
              Target Publishing Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {channelOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    channel === c.id
                      ? 'bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 border-brand-300 shadow-xs'
                      : 'bg-surface-subtle border-border text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <c.icon className={`w-4 h-4 ${channel === c.id ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Content Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Clarifying Serum Launch Announcement"
                className="w-full border border-border rounded-xl p-3 text-xs text-slate-800 bg-surface-subtle/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Campaign Name (Optional)
              </label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g., Summer Clear Skin 2026"
                className="w-full border border-border rounded-xl p-3 text-xs text-slate-800 bg-surface-subtle/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Submission Mode Selector (Direct Text vs Image OCR Scanner vs Document Upload) */}
          <div className="pt-2 border-t border-border-subtle space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submission Mode & Format
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    inputMode === 'text'
                      ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Direct Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('ocr')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    inputMode === 'ocr'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Image OCR Scanner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    inputMode === 'file'
                      ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Document Upload
                </button>
              </div>
            </div>

            {/* MODE 1: DIRECT TEXT */}
            {inputMode === 'text' && (
              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste or write marketing draft copy here... (e.g. 'Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula.')"
                  className="w-full border border-border rounded-2xl p-4 text-xs text-slate-800 font-sans leading-relaxed bg-surface-subtle/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-2xs transition-all"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                  <span>Preserves original draft intact. Suggestions applied only to working copy.</span>
                  <span className="font-mono font-medium">{textContent.length} characters</span>
                </div>
              </div>
            )}

            {/* MODE 2: MULTIMODAL IMAGE OCR SCANNER (Slide 8, 9, 11) */}
            {inputMode === 'ocr' && (
              <div className="space-y-4">
                {/* 1-Click OCR Presets Bento */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Step 1: Choose Product Creative or Upload Packaging Image (Slide 11 Flow)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTriggerOcr('sunscreen_packaging')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        selectedOcrPreset === 'sunscreen_packaging'
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 font-bold text-sm">
                        🧴
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">
                          GlowCare Sunscreen Packaging
                        </div>
                        <p className="text-[11px] text-slate-500">
                          "SPF 100+ Lotion • Cures Sun Damage & Melasma in 7 Days"
                        </p>
                        <span className="text-[10px] text-brand-600 font-bold block pt-1">
                          Click to scan bottle label →
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerOcr('influencer_banner')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                        selectedOcrPreset === 'influencer_banner'
                          ? 'bg-violet-50/80 border-violet-300 ring-2 ring-violet-500/20'
                          : 'bg-white border-slate-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 font-bold text-sm">
                        📢
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs text-slate-900">
                          Influencer Sponsored Banner Ad
                        </div>
                        <p className="text-[11px] text-slate-500">
                          "100% Guaranteed Results • Discount Code GLOW50"
                        </p>
                        <span className="text-[10px] text-violet-600 font-bold block pt-1">
                          Click to scan banner claims →
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Upload Custom Packaging Image */}
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-5 h-5 text-slate-500" />
                    <div>
                      <span className="font-bold text-slate-800 block">Or upload your own creative graphic</span>
                      <span className="text-[11px] text-slate-400">Supports PNG, JPG ads and physical product packaging photos</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('ocr-file-upload')?.click()}
                  >
                    Select Image File
                  </Button>
                  <input
                    type="file"
                    id="ocr-file-upload"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {/* Scanning Animation */}
                {ocrScanning && (
                  <div className="p-8 rounded-3xl bg-indigo-50/50 border border-indigo-200 text-center space-y-3">
                    <Scan className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-900">
                      Multimodal OCR Scanner Reading Text Printed on Packaging / Banner...
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Analyzing optical characters, segmenting claim lines, and cross-referencing brand rules.
                    </p>
                  </div>
                )}

                {/* Step 2: Confirmation Canvas (Slide 11 Step 2) */}
                {ocrResult && !ocrScanning && (
                  <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-xs text-slate-900">
                          Step 2: OCR Extracted Text & User Confirmation (Slide 11)
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        {Math.round(ocrResult.confidence * 100)}% Confidence
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      OCR extracted the printed packaging text below. You can edit, adjust phrasing, or confirm as-is before running the governance review:
                    </p>

                    <textarea
                      rows={5}
                      value={ocrConfirmedText}
                      onChange={(e) => setOcrConfirmedText(e.target.value)}
                      className="w-full border border-emerald-300 rounded-2xl p-3 text-xs text-slate-800 font-mono leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                    />

                    {/* Detected Claims Preview */}
                    {ocrResult.detected_claims && ocrResult.detected_claims.length > 0 && (
                      <div className="p-3 rounded-xl bg-white border border-emerald-200/80 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Pre-Scan Candidate Breaches Detected:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ocrResult.detected_claims.map((claim, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200"
                            >
                              ⚠️ {claim}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: DOCUMENT UPLOAD */}
            {inputMode === 'file' && (
              <div className="border-2 border-dashed border-brand-200/90 rounded-3xl p-8 text-center bg-gradient-to-b from-brand-50/20 to-transparent hover:bg-brand-50/40 transition-colors cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-2xs group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Drag & drop or browse local files'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                  Extracts text from PDF, DOCX (OpenXML), TXT, and PNG/JPG creative banner files.
                </p>
                <input
                  type="file"
                  id="content-file-upload"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('content-file-upload')?.click()}
                  >
                    {selectedFile ? 'Choose Another File' : 'Browse Local File'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>3-Layer Hybrid AI: Deterministic Rules • RAG Retrieval • Contextual LLM</span>
            </div>

            <Button
              type="submit"
              variant="glow"
              size="lg"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4 text-white" />}
            >
              Run Brand Governance Review
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
