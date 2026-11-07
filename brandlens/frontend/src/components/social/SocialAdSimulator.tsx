import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ThumbsUp,
  Share2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Finding } from '../../types';

interface SocialAdSimulatorProps {
  content: string;
  findings: Finding[];
  channel?: string;
  onSelectFinding?: (findingId: string) => void;
  brandName?: string;
}

export const SocialAdSimulator: React.FC<SocialAdSimulatorProps> = ({
  content,
  findings,
  channel = 'Instagram',
  onSelectFinding,
  brandName = 'GlowCare Skincare',
}) => {
  const [platform, setPlatform] = useState<'instagram' | 'linkedin'>('instagram');
  const [liked, setLiked] = useState(false);

  // Render text inside caption with in-situ glowing highlights
  const renderInteractiveCaption = (text: string) => {
    if (!findings.length) return <span className="whitespace-pre-wrap">{text}</span>;

    const elements: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    const openFindings = findings.filter((f) => f.status === 'open' && f.original_text);
    if (!openFindings.length) {
      return <span className="whitespace-pre-wrap">{text}</span>;
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

      const sev = matchingFinding.severity || 'high';
      const isCritical = sev === 'critical' || sev === 'high';

      elements.push(
        <span
          key={keyIdx++}
          onClick={() => onSelectFinding && onSelectFinding(matchingFinding!.id)}
          className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded cursor-pointer font-bold text-[11px] transition-all duration-200 ${
            isCritical
              ? 'bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/50 hover:bg-red-600'
              : 'bg-amber-400 text-amber-950 hover:bg-amber-500'
          }`}
          title={`Violation: ${matchingFinding.title}. Click to inspect fix.`}
        >
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>{matchText}</span>
        </span>
      );

      remaining = remaining.slice(earliestMatchIndex + matchingFinding.original_text.length);
    }

    return <span className="leading-relaxed whitespace-pre-wrap">{elements}</span>;
  };

  const openCount = findings.filter((f) => f.status === 'open').length;

  return (
    <div className="space-y-3">
      {/* Platform Switcher Chips & Compliance Alert */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setPlatform('instagram')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              platform === 'instagram'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📸 Instagram Post
          </button>
          <button
            type="button"
            onClick={() => setPlatform('linkedin')}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              platform === 'linkedin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            💼 LinkedIn Ad
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {openCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse">
              <ShieldAlert className="w-3 h-3 text-red-600" />
              {openCount} Live Post Violations
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Live Feed Ready
            </span>
          )}
        </div>
      </div>

      {/* Realistic Mobile Device Mockup Frame */}
      <div className="relative mx-auto max-w-[340px] rounded-[36px] border-[5px] border-slate-800 bg-white shadow-2xl overflow-hidden font-sans">
        {/* Phone Speaker Notch */}
        <div className="pt-2 pb-1 bg-white flex justify-center">
          <div className="w-20 h-3.5 bg-slate-900 rounded-full" />
        </div>

        {platform === 'instagram' ? (
          /* ================= INSTAGRAM FEED POST ================= */
          <div className="text-xs text-slate-900">
            {/* Post Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[10px] text-brand-600">
                    GC
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-900">glowcare.official</span>
                    <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-none">Sponsored</div>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-slate-500" />
            </div>

            {/* Creative Banner Photo */}
            <div className="relative aspect-square w-full bg-gradient-to-br from-indigo-900 via-brand-900 to-slate-900 flex flex-col items-center justify-center text-white p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md mx-auto flex items-center justify-center border border-white/20">
                  <Sparkles className="w-6 h-6 text-brand-300" />
                </div>
                <div className="text-base font-black tracking-tight drop-shadow-sm">
                  GlowCare Clinical
                </div>
                <div className="text-[10px] text-indigo-200 max-w-[200px] leading-tight">
                  Dermatological Science for Radiant Blemish-Free Skin
                </div>
              </div>

              {/* Call-to-Action Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-brand-600 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-white">
                <span>Shop Formulation</span>
                <span className="text-xs">&gt;</span>
              </div>
            </div>

            {/* Engagement Action Row */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between text-slate-800">
                <div className="flex items-center gap-3.5">
                  <button type="button" onClick={() => setLiked(!liked)}>
                    <Heart className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 text-red-500' : 'text-slate-800'}`} />
                  </button>
                  <MessageCircle className="w-5 h-5 text-slate-800" />
                  <Send className="w-5 h-5 text-slate-800" />
                </div>
                <Bookmark className="w-5 h-5 text-slate-800" />
              </div>

              {/* Likes counter */}
              <div className="font-bold text-[11px] text-slate-900">
                {liked ? '1,843 likes' : '1,842 likes'}
              </div>

              {/* Caption with In-situ Highlights */}
              <div className="text-[11px] leading-relaxed text-slate-800">
                <strong className="font-bold mr-1.5 text-slate-900">glowcare.official</strong>
                {renderInteractiveCaption(content)}
              </div>

              {/* Hashtags & Timestamp */}
              <div className="text-[10px] text-brand-700 font-medium">
                #GlowCare #ClinicalSkin #BrandCompliance
              </div>
              <div className="text-[9px] uppercase text-slate-400 font-medium">
                2 HOURS AGO • SEE TRANSLATION
              </div>
            </div>
          </div>
        ) : (
          /* ================= LINKEDIN SPONSORED POST ================= */
          <div className="text-xs text-slate-900 p-3 space-y-2.5">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center font-bold text-xs">
                GC
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">GlowCare Skincare</div>
                <div className="text-[10px] text-slate-500">24,500 followers • Promoted</div>
              </div>
            </div>

            {/* Post Copy with Highlights */}
            <div className="text-xs text-slate-800 leading-relaxed pt-1">
              {renderInteractiveCaption(content)}
            </div>

            {/* Media Card */}
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
              <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-700 flex items-center justify-center text-white text-center p-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm">GlowCare Clinical Research</div>
                  <div className="text-[10px] text-indigo-100">Verified Formulations</div>
                </div>
              </div>
              <div className="p-2.5 flex items-center justify-between bg-white border-t border-slate-100">
                <div>
                  <div className="font-bold text-[11px] text-slate-900">glowcareskincare.com</div>
                  <div className="text-[10px] text-slate-400">Official Clinical Catalog</div>
                </div>
                <button className="px-2.5 py-1 rounded bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-200">
                  Learn more
                </button>
              </div>
            </div>

            {/* Reactions Row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-500 text-[10px] font-semibold">
              <span className="flex items-center gap-1 hover:text-brand-600 cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" /> Like
              </span>
              <span className="flex items-center gap-1 hover:text-brand-600 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> Comment
              </span>
              <span className="flex items-center gap-1 hover:text-brand-600 cursor-pointer">
                <Share2 className="w-3.5 h-3.5" /> Repost
              </span>
            </div>
          </div>
        )}

        {/* Phone Bottom Home Bar */}
        <div className="py-1.5 bg-white flex justify-center">
          <div className="w-28 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

