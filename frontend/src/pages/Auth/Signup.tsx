import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, UserPlus, Leaf, ShieldCheck, Globe } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { signup as apiSignup, apiErrorMessage } from '@/src/services/api';

interface AuthProps {
  onLogin: (token: string) => void;
  toggleView: () => void;
}

export default function Signup({ onLogin, toggleView }: AuthProps) {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiSignup(
        email.trim().toLowerCase(),
        password,
        fullName.trim()
      );
      onLogin(res.access_token);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F9F7]">
      {/* Hero Side */}
      <div className="hidden lg:flex bg-brand-900 relative items-center justify-center p-24 overflow-hidden order-last lg:order-first">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 to-emerald-950/50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg space-y-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-400 rounded-xl flex items-center justify-center text-brand-950">
              <Leaf size={24} />
            </div>
            <span className="text-2xl font-black text-white uppercase tracking-tighter">
              LegumeCare
            </span>
          </div>

          <div className="space-y-6">
            <h2 className="text-5xl font-black text-white leading-tight">
              Start managing <br />
              <span className="text-emerald-400">your farm health</span>
            </h2>
            <p className="text-emerald-100/60 font-medium text-base leading-relaxed">
              Join farmers using AI-powered disease detection to protect crops.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Globe, label: 'Multi-language', desc: 'English, Hindi, Telugu support' },
              { icon: ShieldCheck, label: 'Secure & Private', desc: 'Your data stays safe' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-3xl bg-white/5 border border-white/10"
              >
                <div className="w-10 h-10 bg-emerald-400/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-white font-black text-sm">{item.label}</p>
                  <p className="text-emerald-100/50 text-[11px] font-bold mt-1 uppercase tracking-wider">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-10">
          <header className="space-y-4">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none italic uppercase">
              Create <span className="text-brand-600 underline underline-offset-8">Account</span>
            </h1>
            <p className="text-slate-500 font-medium">
              Set up your LegumeCare account to get started.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Full Name (optional)"
                placeholder="John Miller"
                icon={<User size={18} />}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Email Address"
                placeholder="farmer@legume.care"
                type="email"
                icon={<Mail size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                placeholder="Min. 6 characters"
                type="password"
                icon={<Lock size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="xl"
              className="w-full"
              isLoading={loading}
              rightIcon={<UserPlus size={20} />}
            >
              Create Account
            </Button>
          </form>

          <footer className="text-center pt-8 border-t border-slate-100">
            <p className="text-slate-400 font-medium text-sm">
              Already have an account?{' '}
              <button
                onClick={toggleView}
                className="text-brand-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}