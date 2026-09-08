import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Check, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string, role: UserRole, agency?: string) => Promise<void>;
  onQuickLogin: (role: UserRole) => Promise<void>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onQuickLogin,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('commander');
  const [agency, setAgency] = useState<string>('State Disaster Management Authority (Sikkim)');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister(email, password, name, role, agency);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoClick = async (demoRole: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await onQuickLogin(demoRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Lock className="w-4 h-4" />
            <span>Secure System Access</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {isRegisterMode ? 'Create GlacierGuard Account' : 'Sign in to GlacierGuard AI'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Role-based authentication ensuring operational authority for commanders, hydrologists, IoT engineers, and residents.
          </p>
        </div>

        {/* 1-Click Fast Evaluator Accounts */}
        <div className="mb-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
          <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Test Demo Logins:</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-login-commander"
              onClick={() => handleQuickDemoClick('commander')}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-xs transition-colors"
            >
              <div className="font-bold text-slate-200">Col. R. Sharma</div>
              <div className="text-[10px] text-cyan-400">Commander (NDMA)</div>
            </button>
            <button
              id="demo-login-hydrologist"
              onClick={() => handleQuickDemoClick('hydrologist')}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-xs transition-colors"
            >
              <div className="font-bold text-slate-200">Dr. Ananya Sen</div>
              <div className="text-[10px] text-purple-400">Glaciologist (WIHG)</div>
            </button>
            <button
              id="demo-login-engineer"
              onClick={() => handleQuickDemoClick('field_engineer')}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-xs transition-colors"
            >
              <div className="font-bold text-slate-200">Tashi Namgyal</div>
              <div className="text-[10px] text-amber-400">IoT Sensor Ops</div>
            </button>
            <button
              id="demo-login-public"
              onClick={() => handleQuickDemoClick('public')}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2 rounded-lg text-xs transition-colors"
            >
              <div className="font-bold text-slate-200">Pema Lepcha</div>
              <div className="text-[10px] text-emerald-400">Valley Resident</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name:</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  placeholder="e.g. Lt. Col. K. Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="commander@glacierguard.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                id="auth-password-input"
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Operational Role:</label>
                <select
                  id="auth-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="commander">Disaster Management Commander (Full Authority)</option>
                  <option value="hydrologist">Glaciologist / Scientific Analyst</option>
                  <option value="field_engineer">IoT Field Sensor Engineer (ESP32 Nodes)</option>
                  <option value="public">Downstream Community Resident</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Agency / Department:</label>
                <input
                  id="auth-agency-input"
                  type="text"
                  placeholder="State Disaster Management Authority"
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-lg shadow-cyan-950 mt-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegisterMode ? 'Complete Registration' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400">
          {isRegisterMode ? (
            <span>
              Already registered?{' '}
              <button
                id="switch-to-login-btn"
                onClick={() => setIsRegisterMode(false)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a specialized account?{' '}
              <button
                id="switch-to-register-btn"
                onClick={() => setIsRegisterMode(true)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
