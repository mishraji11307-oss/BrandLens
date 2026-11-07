import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Check, ArrowRight, Wand2, ShieldCheck, MessageSquare, Zap, BookOpen } from 'lucide-react';
import { RewriteOption } from '../../types';

interface RewriteAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: Record<string, RewriteOption> | null;
  onApplyRewrite: (newText: string) => void;
}

export const RewriteAssistantModal: React.FC<RewriteAssistantModalProps> = ({
  isOpen,
  onClose,
  options,
  onApplyRewrite,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>('compliant');

  if (!options) return null;

  const currentOption = options[selectedKey] || Object.values(options)[0];

  const handleApply = () => {
    if (currentOption) {
      onApplyRewrite(currentOption.text);
      onClose();
    }
  };

  const tabIcons: Record<string, React.ReactNode> = {
    professional: <BookOpen className="w-3.5 h-3.5 text-indigo-600" />,
    conversational: <MessageSquare className="w-3.5 h-3.5 text-violet-600" />,
    compliant: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    concise: <Zap className="w-3.5 h-3.5 text-amber-600" />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Rewrite Assistant"
      description="Choose an AI-enhanced, brand-aligned version. Preserves your original intent while applying verified Brand Kit fixes and required disclaimers."
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Style Selector Tabs (Watermelon UI Chip Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {Object.entries(options).map(([key, opt]) => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              className={`p-3 rounded-2xl text-left border transition-all text-xs ${
                selectedKey === key
                  ? 'border-brand-500 bg-gradient-to-br from-brand-50/80 to-violet-50/50 text-brand-900 font-extrabold shadow-xs ring-2 ring-brand-500/10'
                  : 'border-border hover:bg-slate-50 text-slate-700 bg-surface-subtle/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-bold capitalize">
                  {tabIcons[key] || <Wand2 className="w-3.5 h-3.5 text-brand-600" />}
                  <span>{key}</span>
                </div>
                {selectedKey === key && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </div>
              <p className="text-[10px] text-slate-500 font-normal line-clamp-1">{opt.title}</p>
            </button>
          ))}
        </div>

        {/* Selected Rewrite Card */}
        {currentOption && (
          <div className="border border-brand-200/90 rounded-3xl p-5 bg-gradient-to-br from-brand-50/30 via-white to-violet-50/20 space-y-3.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-brand-600" />
                {currentOption.title}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 shadow-2xs">
                100% Brand Compliant
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-border text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
              {currentOption.text}
            </div>

            <div className="text-[11px] text-slate-600 bg-surface-subtle p-3 rounded-xl border border-border-subtle leading-relaxed">
              <strong className="text-slate-800 font-semibold">Governance Rationale: </strong>
              {currentOption.explanation}
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-border-subtle">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={handleApply}
            icon={<ArrowRight className="w-3.5 h-3.5 text-white" />}
          >
            Apply to Working Copy
          </Button>
        </div>
      </div>
    </Modal>
  );
};
