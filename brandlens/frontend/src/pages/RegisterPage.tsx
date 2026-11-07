import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Mail,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth() as any;
  const { showToast } = useNotification();

  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CREATOR' | 'REVIEWER' | 'ADMIN'>('CREATOR');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.register({
        email,
        password,
        full_name: fullName,
        org_name: orgName,
        role
      });
      localStorage.setItem('brandlens_token', data.access_token);
      localStorage.setItem('brandlens_user', JSON.stringify(data.user));
      showToast('Registration Successful', `Welcome to BrandLens, ${fullName}!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast('Registration Failed', err.response?.data?.detail || 'Failed to create organization.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas relative flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-brand-400/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 rounded-full bg-violet-400/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/25 ring-4 ring-brand-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Create an Organization
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Establish your Brand Kit, invite creators, and automate pre-publication brand compliance.
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Alex Rivera"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Organization / Brand Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., GlowCare Skincare"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Your Primary Role</label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('CREATOR')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'CREATOR'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs">Creator</div>
                  <div className="text-[10px] text-slate-400 font-normal">Authoring</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('REVIEWER')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'REVIEWER'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs">Reviewer</div>
                  <div className="text-[10px] text-slate-400 font-normal">Approver</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    role === 'ADMIN'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs">Admin</div>
                  <div className="text-[10px] text-slate-400 font-normal">Brand Kit</div>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-3"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Initialize Brand Workspace
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Tenant Isolated
          </span>
          <span>•</span>
          <span>Zero External Key Mandate</span>
        </div>
      </div>
    </div>
  );
};
