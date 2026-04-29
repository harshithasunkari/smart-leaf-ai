import React from 'react';
import { Bell, Settings } from 'lucide-react';
import type { AuthUser } from '../../store/auth';

interface HeaderProps {
  onSettingsClick?: () => void;
  user?: AuthUser | null;
}

export default function Header({ onSettingsClick, user }: HeaderProps) {
  const initials = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? 'U';

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <header className="h-16 md:h-20 bg-white border-b border-emerald-100 flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-10">
      <div>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-800 uppercase italic">
          LegumeCare
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={onSettingsClick}
          className="p-2 text-slate-400 hover:text-brand-600 transition-colors bg-slate-50 rounded-xl"
          aria-label="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="relative cursor-pointer">
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          <Bell size={20} className="text-slate-400 hover:text-brand-600 transition-colors" />
        </div>

        <div className="flex items-center gap-2 md:gap-3 bg-slate-50 p-1 md:p-1.5 pr-2 md:pr-4 rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-sm shrink-0">
            {initials}
          </div>
          <span className="hidden md:block text-sm font-semibold text-slate-800 max-w-[120px] truncate">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}