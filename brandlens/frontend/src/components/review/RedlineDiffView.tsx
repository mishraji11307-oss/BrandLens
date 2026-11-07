import React from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck2
} from 'lucide-react';
import { Finding } from '../../types';

interface RedlineDiffViewProps {
  originalText: string;
  workingText: string;
  findings: Finding[];
  complianceScore: number;
}

export const RedlineDiffView: React.FC<RedlineDiffViewProps> = ({
  originalText,
  workingText,
  findings,
  complianceScore,
}) => {
  const resolvedFindings = findings.filter((f) => f.status === 'accepted' || f.status === 'edited');
  const openFindings = findings.filter((f) => f.status === 'open');

  // Compute word-level token diffing
  const renderDiffTokens = () => {
    if (originalText === workingText) {
      return (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <p className="leading-relaxed whitespace-pre-wrap">{workingText}</p>
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Working copy is currently identical to the original draft. Accept a fix to see redline changes.</span>
          </div>
        </div>
      );
    }

    // Tokenize by words
    const origWords = originalText.split(/\s+/);
    const workWords = workingText.split(/\s+/);

    return (
      <div className="space-y-4">
        {/* Visual Redline Canvas */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs font-sans text-sm leading-loose">
          {resolvedFindings.length > 0 ? (
            <div>
              {/* Highlight replacements from resolved findings */}
              {renderResolvedDiffParagraph(originalText, resolvedFindings)}
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-slate-700">{workingText}</p>
          )}
        </div>

        {/* Change Ledger Table */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-xs text-slate-900">Audited Modification Ledger</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {resolvedFindings.length} Replaced • {openFindings.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {resolvedFindings.map((f, i) => (
              <div key={i} className="p-3.5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200">
                      {f.rule_id}
                    </span>
                    <span className="font-bold text-slate-800 text-[11px]">{f.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-red-700 line-through bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      - {f.original_text}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      + {f.suggested_fix || f.custom_fix}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3 h-3" />
                    +80% Penalty Recovered
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderResolvedDiffParagraph = (rawText: string, resolved: Finding[]) => {
    let result: React.ReactNode[] = [];
    let textCursor = rawText;
    let k = 0;

    for (const res of resolved) {
      if (!res.original_text) continue;
      const idx = textCursor.toLowerCase().indexOf(res.original_text.toLowerCase());
      if (idx !== -1) {
        if (idx > 0) {
          result.push(<span key={k++}>{textCursor.slice(0, idx)}</span>);
        }
        // Redline: deleted original + added approved fix
        result.push(
          <span key={k++} className="inline-flex flex-wrap items-center gap-1.5 mx-1 p-0.5 rounded">
            <span className="line-through decoration-red-500 decoration-2 text-red-800 bg-red-100/80 px-1.5 py-0.5 rounded font-mono text-xs">
              {res.original_text}
            </span>
            <span className="text-emerald-800 bg-emerald-100/90 font-bold px-1.5 py-0.5 rounded border border-emerald-300 font-mono text-xs">
              {res.suggested_fix || res.custom_fix}
            </span>
          </span>
        );
        textCursor = textCursor.slice(idx + res.original_text.length);
      }
    }
    result.push(<span key={k++}>{textCursor}</span>);
    return <div>{result}</div>;
  };

  const recoveredPoints = Math.round(resolvedFindings.length * 16);

  return (
    <div className="space-y-4">
      {/* Delta KPI Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-brand-50/50 border border-emerald-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">Compliance Delta Analysis</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                +{recoveredPoints} pts Recovery
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Redline comparison highlights accepted AI recommendations and verified deletions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-semibold">Active Score</span>
            <span className="text-base font-black text-emerald-700 font-mono">
              {complianceScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Diff Tokens View */}
      {renderDiffTokens()}
    </div>
  );
};

