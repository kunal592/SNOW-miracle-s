import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { Storage } from '../lib/storage';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('kunal@snow.app');
  const [password, setPassword] = useState('password123');
  const [displayName, setDisplayName] = useState('Kunal');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const { user } = await api.auth.login(email.trim(), password);
        const currentUser = Storage.getUser();
        const updatedUser: User = {
          ...currentUser,
          id: user.id || currentUser.id,
          name: user.displayName || currentUser.name,
          email: user.email || email
        };
        Storage.setUser(updatedUser);
        onLoginSuccess(updatedUser);
        onShowToast(`Welcome back, ${updatedUser.name}! Session authenticated.`, 'success');
        onClose();
      } else {
        const { user } = await api.auth.register(displayName.trim(), email.trim(), password);
        const currentUser = Storage.getUser();
        const updatedUser: User = {
          ...currentUser,
          id: user.id || currentUser.id,
          name: displayName.trim(),
          email: email.trim()
        };
        Storage.setUser(updatedUser);
        onLoginSuccess(updatedUser);
        onShowToast(`Account created successfully! Welcome to Winter Arc, ${updatedUser.name}.`, 'success');
        onClose();
      }
    } catch (err: any) {
      console.warn('API authentication issue, offering fallback:', err);
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    const demoUser = Storage.getUser();
    Storage.setTokens('mock_access_token_demo', 'mock_refresh_token_demo');
    onLoginSuccess(demoUser);
    onShowToast(`Signed in as ${demoUser.name} (Offline Demo Mode)`, 'success');
    onClose();
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8090/api/v1/auth/google';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#16120f] border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/90 overflow-hidden">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/50 transition cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* HEADER BRANDING */}
        <div className="p-6 pb-4 border-b border-amber-500/20 bg-[#1c1815] text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-neutral-950 font-black shadow-lg shadow-amber-950/60 mb-1">
            <Zap className="w-6 h-6 text-neutral-950 fill-neutral-950" />
          </div>
          <h2 className="text-xl font-extrabold text-amber-100 font-outfit tracking-wide">
            SNOW — Personal OS
          </h2>
          <p className="text-xs text-amber-300/80 font-medium">
            Winter Arc Protocol • Authenticate Identity
          </p>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {/* GOOGLE SIGN IN BUTTON (Primary Option as per login-flow.md) */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md transition cursor-pointer"
          >
            {/* Google G icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-[1px] bg-neutral-800" />
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
              OR EMAIL IDENTITY
            </span>
            <div className="flex-1 h-[1px] bg-neutral-800" />
          </div>

          {/* MODE TABS */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#12100e] border border-amber-500/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* EMAIL + PASSWORD FORM */}
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Kunal"
                    className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl py-2.5 pl-9 pr-3 text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kunal@snow.app"
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl py-2.5 pl-9 pr-3 text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 font-semibold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#12100e] border border-amber-500/30 rounded-xl py-2.5 pl-9 pr-3 text-amber-100 placeholder-neutral-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-neutral-950 font-bold text-xs shadow-lg shadow-amber-950/60 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with Go API...</span>
              ) : mode === 'signin' ? (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In to Personal OS
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" /> Start Winter Arc Protocol
                </>
              )}
            </button>
          </form>

          {/* QUICK 1-CLICK DEMO LOGIN BUTTON */}
          <div className="pt-2 border-t border-amber-500/15">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick 1-Click Sign In (Kunal • Day 1)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
