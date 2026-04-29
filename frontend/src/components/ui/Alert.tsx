import type { ReactNode } from 'react';

type Tone = 'error' | 'success' | 'warning' | 'info';

const toneClass: Record<Tone, string> = {
  error: 'border-rose-300/70 bg-rose-500/10 text-rose-100',
  success: 'border-emerald-300/70 bg-emerald-500/10 text-emerald-100',
  warning: 'border-amber-300/70 bg-amber-500/10 text-amber-100',
  info: 'border-cyan-300/70 bg-cyan-500/10 text-cyan-100',
};

export default function Alert({
  tone = 'info',
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return <div className={`rounded-xl border px-3 py-2.5 text-sm ${toneClass[tone]}`}>{children}</div>;
}
