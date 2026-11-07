import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
  FileText,
  Palette,
  Eye,
  Sliders,
  Users,
  Check,
  AlertTriangle,
  Layers,
  ScanLine
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleLaunchDemo = async (role: 'CREATOR' | 'REVIEWER' | 'ADMIN' = 'CREATOR') => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-slate-900 selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Decorative ambient background orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[600px] h-[400px] bg-pink-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow-sm shadow-brand-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">BrandLens</span>
              <span className="ml-2 text-[10px] bg-gradient-to-r from-brand-50 to-violet-50 text-brand-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-brand-200/80">
                AI Brand Governance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={() => handleLaunchDemo('CREATOR')}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Launch Live Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-50 to-violet-50 border border-brand-200 text-xs font-bold text-brand-700 shadow-subtle animate-float">
          <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
          <span>Inkloom AI • CodeNexus India 2026 • Round 2</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
          Catch Brand Mistakes <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Before Content Goes Live.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Your AI-powered brand governance workspace. Review marketing copy, detect unsupported claims, explain every issue with traceable guideline citations, and keep humans firmly in control.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            size="lg"
            variant="glow"
            onClick={() => handleLaunchDemo('CREATOR')}
            icon={<Sparkles className="w-4 h-4 text-white" />}
          >
            Launch Live Demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              const el = document.getElementById('how-it-works');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Explore How It Works
          </Button>
        </div>

        {/* 1-Click Role Direct Launch Chips for Judges */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">1-Click Judge Access:</span>
          <button
            onClick={() => handleLaunchDemo('CREATOR')}
            className="px-2.5 py-1 rounded-lg bg-white border border-brand-200 hover:border-brand-400 font-semibold text-brand-700 shadow-2xs transition-all hover:bg-brand-50/50"
          >
            Creator Demo
          </button>
          <button
            onClick={() => handleLaunchDemo('REVIEWER')}
            className="px-2.5 py-1 rounded-lg bg-white border border-violet-200 hover:border-violet-400 font-semibold text-violet-700 shadow-2xs transition-all hover:bg-violet-50/50"
          >
            Manager Approval Demo
          </button>
          <button
            onClick={() => handleLaunchDemo('ADMIN')}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50"
          >
            Brand Admin Demo
          </button>
        </div>
      </section>

      {/* Interactive Mockup Preview (Watermelon UI Card Style) */}
      <section className="max-w-6xl mx-auto px-6 pb-20 relative z-10">
        <div className="rounded-3xl border border-brand-200/90 bg-white/95 shadow-glass p-5 sm:p-7 space-y-4 backdrop-blur-md relative overflow-hidden">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-border-subtle text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/90" />
              <span className="w-3 h-3 rounded-full bg-amber-400/90" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/90" />
              <span className="ml-3 font-mono text-[11px] text-slate-400">
                brandlens.inkloom.ai/review/demo-workspace
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-red-50 text-red-700 px-2.5 py-0.5 rounded-full font-bold border border-red-200 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                2 Violations Identified
              </span>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-mono font-bold border border-amber-200">
                Compliance Score: 52/100
              </span>
            </div>
          </div>

          {/* Split Content Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left Mockup Panel */}
            <div className="p-5 rounded-2xl bg-surface-subtle/80 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Submitted Ad Copy
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Instagram Ad</span>
              </div>
              <p className="text-slate-800 leading-relaxed font-sans text-sm">
                "Our serum{' '}
                <mark className="bg-red-100/90 text-red-900 border border-red-300 px-1.5 py-0.5 rounded-md font-bold shadow-2xs">
                  cures acne
                </mark>{' '}
                in 7 days! Get{' '}
                <mark className="bg-orange-100/90 text-orange-900 border border-orange-300 px-1.5 py-0.5 rounded-md font-bold shadow-2xs">
                  guaranteed results
                </mark>{' '}
                with our revolutionary formula."
              </p>
            </div>

            {/* Right Mockup Panel */}
            <div className="p-5 rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/40 to-violet-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  RAG Citation & Evidence
                </span>
                <span className="text-[10px] bg-white px-2.5 py-0.5 rounded-full text-brand-800 font-bold border border-brand-200 shadow-2xs">
                  GlowCare Guidelines p.7
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Violation:</strong> 'cures acne' violates cosmetic regulatory claim policy (Rule RULE-TERM-001).
              </p>
              <div className="p-3 rounded-xl bg-white border border-brand-200 text-emerald-800 font-mono text-xs shadow-subtle flex items-center justify-between">
                <span>"helps reduce the appearance of blemishes"</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Approved AC-12
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How BrandLens Works Bento Grid */}
      <section id="how-it-works" className="py-20 bg-white/80 border-y border-border/80 relative z-10 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How BrandLens Works
            </h2>
            <p className="text-slate-600 text-sm max-w-xl mx-auto">
              A closed-loop pre-publication governance pipeline ensuring brand integrity without sacrificing creator velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Brand Kit Setup',
                desc: 'Upload official tone rules, approved facts, regulatory claims, and visual palette.',
                gradient: 'from-brand-600 to-indigo-600',
              },
              {
                step: '02',
                title: 'Content Ingestion',
                desc: 'Submit drafts via direct text, PDF, DOCX (OpenXML), or creative image banners.',
                gradient: 'from-indigo-600 to-violet-600',
              },
              {
                step: '03',
                title: 'Hybrid AI Review',
                desc: 'Deterministic rules + RAG vector search + contextual LLM flag issues with page-numbered evidence.',
                gradient: 'from-violet-600 to-purple-600',
              },
              {
                step: '04',
                title: 'Human Approval',
                desc: 'Humans make final decisions. Reviewers approve, reject, or request changes before publish.',
                gradient: 'from-purple-600 to-pink-600',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-3xl border border-border bg-gradient-to-b from-white to-surface-subtle/50 shadow-subtle hover:shadow-card-hover hover:border-brand-300 transition-all duration-200 space-y-3"
              >
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${s.gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-glow-sm`}
                >
                  {s.step}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Capabilities Bento Grid */}
      <section className="py-20 max-w-6xl mx-auto px-6 space-y-12 relative z-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Enterprise Governance Modules
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Everything modern marketing teams need to safeguard brand consistency across all digital channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">3-Layer Hybrid AI Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deterministic regex rules guarantee zero hallucinations, combined with RAG semantic citations and LLM tone contextualization.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Human Decision Control</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              No automatic publishing. Accept, edit, dismiss, or dispute suggestions. Working revisions preserve originals intact.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Smart Visual Checker</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts dominant image color palettes with Pillow/OpenCV, verifies contrast against WCAG AA/AAA standards, and inspects palettes.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Formula Compliance Score</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent deterministic scoring based on violation severity, resolution recovery, and critical issue caps.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Role-Based Approval Workflow</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Creator submission, reviewer approval or change request queues, discussion comments, and audit logging.
            </p>
          </div>

          <div className="p-7 rounded-3xl border border-border bg-white/90 shadow-subtle hover:shadow-card-hover hover:border-brand-200 transition-all duration-200 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">OWASP Top 10 Security</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bcrypt hashing, short-lived JWT, CSP/HSTS headers, parameterised queries, tenant isolation, and prompt injection defense.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/80 py-12 bg-slate-900 text-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-violet-500 flex items-center justify-center font-extrabold text-sm shadow-glow-sm">
                B
              </div>
              <span className="font-extrabold text-base tracking-tight">BrandLens</span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Powered Brand Governance Platform • Inkloom AI • Team V4Vantage
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="glow"
              size="sm"
              onClick={() => handleLaunchDemo('CREATOR')}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Open Demo Workspace
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};
