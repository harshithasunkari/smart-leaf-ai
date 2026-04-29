import type { ReactNode } from 'react';

export default function Card({
  title,
  subtitle,
  icon,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-white/15 bg-slate-900/55 p-5 shadow-xl shadow-black/20 backdrop-blur-md sm:p-6 ${className}`}
    >
      {(title || subtitle || icon) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-sm text-emerald-50/80">{subtitle}</p> : null}
          </div>
          {icon ? <div className="rounded-xl bg-white/10 p-2 text-emerald-200">{icon}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
