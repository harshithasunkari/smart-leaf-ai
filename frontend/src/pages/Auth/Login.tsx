import React from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, Leaf, Shield } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { login as apiLogin, apiErrorMessage } from '@/src/services/api';

interface AuthProps {
  onLogin: (token: string) => void;
  toggleView: () => void;
}

export default function Login({ onLogin, toggleView }: AuthProps) {
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
    setLoading(true);
    setError('');
    try {
      const res = await apiLogin(email.trim().toLowerCase(), password);
      onLogin(res.access_token);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F7F9F7]">
      {/* Form Side */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 lg:p-24 space-y-10 bg-white">
        <div className="w-full max-w-md space-y-10">
          <header className="space-y-4">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
              <Leaf size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                Welcome Back
              </h1>
              <p className="text-slate-500 font-medium">
                Sign in to your LegumeCare dashboard.
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
                placeholder="••••••••"
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
              rightIcon={<LogIn size={20} />}
            >
              Sign In
            </Button>
          </form>

          <footer className="text-center pt-8 border-t border-slate-100">
            <p className="text-slate-400 font-medium text-sm">
              Don't have an account?{' '}
              <button
                onClick={toggleView}
                className="text-brand-600 font-bold hover:underline"
              >
                Create Account
              </button>
            </p>
          </footer>
        </div>
      </div>

      {/* Hero Side */}
      <div className="hidden lg:flex bg-brand-900 relative items-center justify-center p-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg space-y-12"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <Shield size={12} /> Trusted by Farmers
            </div>
            <h2 className="text-5xl font-black text-white leading-none italic uppercase">
              Protect Your <br />
              <span className="text-emerald-400">Harvest</span>
            </h2>
            <p className="text-emerald-100/70 text-base font-medium leading-relaxed">
              AI-powered legume disease detection with precise pesticide recommendations.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-black text-white">19+</div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Disease Classes
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-white">80%+</div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Model Accuracy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}