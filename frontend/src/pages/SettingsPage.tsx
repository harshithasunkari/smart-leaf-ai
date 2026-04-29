import React from 'react';
import { Globe, Moon, Trash2 } from 'lucide-react';
import { cn } from '@/src/utils/helpers';

interface SettingsPageProps {
  onLogout?: () => void;
}

export default function SettingsPage({ onLogout }: SettingsPageProps) {
  const [theme, setTheme] = React.useState('light');
  const [lang, setLang] = React.useState(() => localStorage.getItem('language') || 'en');

  const handleLangChange = (l: string) => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
          Settings
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your profile and preferences.</p>
      </header>

      <div className="bg-white rounded-[2rem] border border-emerald-100 p-8 shadow-sm space-y-8">
        {/* Theme */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
              <Moon size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Interface Theme</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Appearance
              </p>
            </div>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200">
            {['light', 'dark'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  'px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all capitalize',
                  theme === t
                    ? t === 'light'
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-800 text-white'
                    : 'text-slate-400'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-600 shadow-sm">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Language</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                EN / HI / TE
              </p>
            </div>
          </div>
          <select
            value={lang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-brand-500 outline-none"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-3"
          >
            <Trash2 size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}