import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
  Megaphone
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
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Validation Error', 'Please specify a title for this content piece.', 'warning');
      return;
    }

    if (inputMode === 'text' && !textContent.trim()) {
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
        formData.append('text_content', textContent);
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
    { id: 'Website', label: 'Website', icon: Globe },
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

          {/* Submission Mode Selector */}
          <div className="pt-2 border-t border-border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submission Format
              </span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    inputMode === 'text'
                      ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Direct Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                    inputMode === 'file'
                      ? 'bg-white text-brand-700 shadow-xs border border-brand-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Document / Image Upload
                </button>
              </div>
            </div>

            {inputMode === 'text' ? (
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
            ) : (
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
              Run Brand Review
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
