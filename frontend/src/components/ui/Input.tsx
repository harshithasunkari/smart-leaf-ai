import React from 'react';
import { cn } from '@/src/utils/helpers';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none transition-all font-bold text-sm text-slate-800 placeholder:text-slate-300',
              'focus:bg-white focus:border-brand-200 focus:ring-4 focus:ring-brand-500/5',
              icon && 'pl-12',
              error && 'border-rose-200 focus:border-rose-300 focus:ring-rose-500/5',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
      </div>
    );
  }
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 px-6 outline-none transition-all font-bold text-sm text-slate-800 appearance-none bg-no-repeat bg-[right_1.5rem_center]',
            'focus:bg-white focus:border-brand-200 focus:ring-4 focus:ring-brand-500/5',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23cbd5e1%27 stroke-width=%272.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27m6 9 6 6 6-6%27/%3E%3C/svg%3E")]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] font-bold text-rose-500 ml-1">{error}</p>}
      </div>
    );
  }
);
