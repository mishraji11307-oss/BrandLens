import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Shield,
  Lock,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Building,
  KeyRound,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoRoleLoading, setDemoRoleLoading] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back!', 'Successfully signed in to BrandLens.', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast('Sign In Failed', err.response?.data?.detail || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (role: 'CREATOR' | 'REVIEWER' | 'ADMIN') => {
    setDemoRoleLoading(role);
    try {
      await demoLogin(role);
      showToast(`Demo Session: ${role}`, `Logged in as GlowCare ${role}.`, 'success');
      navigate('/dashboard');
    } catch {
      showToast('Error', 'Failed to launch demo session.', 'error');
    } finally {
      setDemoRoleLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-canvas relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-brand-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-violet-400/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25 ring-4 ring-brand-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign In to BrandLens
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            AI-Powered Brand Governance & Content Compliance Platform
          </p>
        </div>

        {/* 1-Click Judge Access Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-brand-50/80 via-white to-violet-50/50 border border-brand-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Judge 1-Click Instant Demo
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
              Pre-Seeded Data
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Select any role to test the complete end-to-end governance lifecycle instantly:
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={demoRoleLoading !== null}
              onClick={() => handleDemoAccess('CREATOR')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-xs transition-all text-center group disabled:opacity-50"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-brand-600">Creator</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Upload & Edit</div>
            </button>

            <button
              type="button"
              disabled={demoRoleLoading !== null}
              onClick={() => handleDemoAccess('REVIEWER')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-xs transition-all text-center group disabled:opacity-50"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-brand-600">Reviewer</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Approve/Reject</div>
            </button>

            <button
              type="button"
              disabled={demoRoleLoading !== null}
              onClick={() => handleDemoAccess('ADMIN')}
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-brand-500 hover:shadow-xs transition-all text-center group disabled:opacity-50"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-brand-600">Admin</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Brand Kit Lead</div>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@glowcare.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">Password</label>
                <span className="text-[10px] text-brand-600 font-medium cursor-pointer hover:underline">
                  Forgot?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Sign In to Workspace
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Don't have an organization?{' '}
            <Link to="/register" className="text-brand-600 font-semibold hover:underline">
              Register New Brand
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SHA-256 JWT Encrypted
          </span>
          <span>•</span>
          <span>CodeNexus India 2026</span>
          <span>•</span>
          <span>Inkloom AI</span>
        </div>
      </div>
    </div>
  );
};
