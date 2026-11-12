import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck2,
  GitCompare,
  RotateCcw
} from 'lucide-react';
import { Finding } from '../../types';

interface RedlineDiffViewProps {
  originalText: string;
  workingText: string;
  findings: Finding[];
  complianceScore: number;
  initialScore?: number;
  revisionNumber?: number;
}

export const RedlineDiffView: React.FC<RedlineDiffViewProps> = ({
  originalText,
  workingText,
  findings,
  complianceScore,
  initialScore = 40,
  revisionNumber = 2,
}) => {
  const resolvedFindings = findings.filter((f) => f.status === 'accepted' || f.status === 'edited');
  const openFindings = findings.filter((f) => f.status === 'open');

  // Compute standard Word-Level Longest Common Subsequence (LCS) Diff
  const computeWordDiff = (orig: string, work: string) => {
    const origWords = orig.trim().split(/\s+/).filter(Boolean);
    const workWords = work.trim().split(/\s+/).filter(Boolean);

    const m = origWords.length;
    const n = workWords.length;

    // LCS table
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (origWords[i - 1].toLowerCase() === workWords[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff tokens
    let i = m;
    let j = n;
    const tokens: Array<{ type: 'equal' | 'delete' | 'insert'; text: string }> = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origWords[i - 1].toLowerCase() === workWords[j - 1].toLowerCase()) {
        tokens.unshift({ type: 'equal', text: workWords[j - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        tokens.unshift({ type: 'insert', text: workWords[j - 1] });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        tokens.unshift({ type: 'delete', text: origWords[i - 1] });
        i--;
      }
    }

    return tokens;
  };

  const diffTokens = computeWordDiff(originalText, workingText);
  const scoreDelta = Math.max(0, complianceScore - initialScore);

  return (
    <div className="space-y-5">
      {/* Visual Redline Header & Delta KPI Banner (Slide 9 & 11 Step 5) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50/90 via-white to-brand-50/70 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Visual Redline Diff (Revision v1 vs v{revisionNumber})
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                +{scoreDelta} pts Score Change
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Removed non-compliant phrasing shown in <span className="text-red-700 font-bold bg-red-100 px-1 py-0.2 rounded line-through">red strikethrough</span>, approved fixes in <span className="text-emerald-800 font-bold bg-emerald-100 px-1 py-0.2 rounded">green</span>.
            </p>
          </div>
        </div>

        {/* Score comparison pill */}
        <div className="flex items-center gap-3 shrink-0 bg-white p-2 px-3 rounded-2xl border border-slate-200 shadow-2xs text-right">
          <div className="border-r border-slate-200 pr-3">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">v1 Draft Score</span>
            <span className="font-mono text-xs font-bold text-slate-500">{initialScore}/100</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div>
            <span className="text-[9px] uppercase font-bold text-emerald-600 block">v{revisionNumber} Clean Score</span>
            <span className="font-mono text-sm font-black text-emerald-700">{complianceScore}/100</span>
          </div>
        </div>
      </div>

      {/* Visual Redline Canvas (Side-by-Side inline token rendering) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Comparative Revision Canvas
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {diffTokens.filter((t) => t.type === 'delete').length} Removed • {diffTokens.filter((t) => t.type === 'insert').length} Added
          </span>
        </div>

        <div className="leading-loose text-sm font-sans text-slate-800 select-text">
          {diffTokens.map((token, index) => {
            if (token.type === 'delete') {
              return (
                <span
                  key={index}
                  className="mx-0.5 px-1.5 py-0.5 rounded font-mono text-xs text-red-900 bg-red-100/90 border border-red-200 line-through decoration-red-600 decoration-2 font-semibold"
                  title="Deleted from original draft (v1)"
                >
                  {token.text}
                </span>
              );
            } else if (token.type === 'insert') {
              return (
                <span
                  key={index}
                  className="mx-0.5 px-1.5 py-0.5 rounded font-mono text-xs text-emerald-950 bg-emerald-100/90 border border-emerald-300 font-bold shadow-2xs"
                  title="Approved replacement added in revision (v2)"
                >
                  {token.text}
                </span>
              );
            } else {
              return <span key={index} className="mx-0.5">{token.text}</span>;
            }
          })}
        </div>
      </div>

      {/* Audited Modifications Ledger */}
      <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-subtle">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-brand-600" />
            <h4 className="font-bold text-xs text-slate-900">Audited Modification Ledger</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {resolvedFindings.length} Resolved • {openFindings.length} Remaining
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {resolvedFindings.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs italic">
              No modifications recorded yet. Accept an AI recommendation or apply a fix to log audit entries.
            </div>
          ) : (
            resolvedFindings.map((f, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {f.rule_id}
                    </span>
                    <span className="font-bold text-slate-800 text-xs">{f.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-red-700 line-through bg-red-50 px-2 py-0.5 rounded border border-red-200 font-medium">
                      - {f.original_text}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      + {f.suggested_fix || f.custom_fix}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3 h-3" />
                    Penalty Recovered
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
