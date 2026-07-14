import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  HelpCircle, 
  CheckCircle,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (name: string) => void;
  onLoginDemo: () => void;
}

type AuthMode = 'login' | 'register';

export default function Auth({ onLogin, onLoginDemo }: AuthProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Inputs
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!name.trim() || !password) {
      setMessage('Please enter both name and password.');
      return;
    }

    if (mode === 'login') {
      // Simulate login
      setIsSuccess(true);
      setMessage('Successfully logged in! Setting up your workspace...');
      setTimeout(() => {
        // If it looks like our default user's name or demo
        if (name.toLowerCase().includes('user') || name.toLowerCase().includes('demo')) {
          onLoginDemo();
        } else {
          onLogin(name);
        }
      }, 1000);

    } else if (mode === 'register') {
      setIsSuccess(true);
      setMessage('Account created! Setting up your workspace...');
      setTimeout(() => {
        onLogin(name);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40 p-4" id="auth-screen-viewport">
      
      <div className="relative w-full max-w-md" id="auth-card-container">
        {/* Subtle background blurs */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-indigo-100/60 p-8 shadow-xl relative z-10"
          id="auth-main-card"
        >
          {/* Logo Heading */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 text-white rounded-2xl shadow-md mb-2 shadow-indigo-600/15">
              <Flame size={28} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">Skills Tracker</h1>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
              Build consistent learning habits by tracking multiple skills, milestone roadmaps, and focus Pomodoros.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form-body">
            
            {/* Name / Username Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Name / Username</label>
              <div className="relative">
                <input
                  id="auth-name-field"
                  type="text"
                  required
                  placeholder="e.g. Alex Carter or Student"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-500 bg-slate-50/40"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <UserPlus size={14} />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="auth-password-field"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-indigo-500 bg-slate-50/40"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-400">
                  <Lock size={14} />
                </div>
              </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    isSuccess 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-800 border border-rose-100'
                  }`}
                  id="auth-status-message"
                >
                  {isSuccess ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <HelpCircle size={14} className="shrink-0 mt-0.5" />}
                  <p>{message}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Action Button */}
            <button
              id="auth-submit-action-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {mode === 'login' && <><LogIn size={14} /> Log In & Study</>}
              {mode === 'register' && <><UserPlus size={14} /> Create Account</>}
            </button>
          </form>

          {/* Toggle between Register/Login mode */}
          <div className="mt-6 text-center border-t border-slate-50 pt-5 space-y-4">
            <p className="text-[11px] text-slate-400 font-semibold">
              {mode === 'login' && (
                <>
                  New to Skills Tracker?{' '}
                  <button 
                    id="auth-goto-register-btn"
                    onClick={() => setMode('register')} 
                    className="text-indigo-600 hover:text-indigo-800 font-bold ml-1"
                  >
                    Create an account
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  Already have an account?{' '}
                  <button 
                    id="auth-goto-login-btn"
                    onClick={() => setMode('login')} 
                    className="text-indigo-600 hover:text-indigo-800 font-bold ml-1"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>

            {/* Quick Demo Log In shortcut - super helpful for testing */}
            <div className="pt-2">
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block mb-2">Or, quick start directly:</span>
              <button
                id="auth-quick-demo-btn"
                onClick={onLoginDemo}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap size={12} className="text-amber-400" fill="currentColor" />
                Explore with Demo Profile <ArrowRight size={12} />
              </button>
            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
