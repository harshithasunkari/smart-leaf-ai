export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function isValidAuthEmail(email: string): boolean {
  const trimmed = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed) && trimmed.length >= 6;
}

export function formatDate(isoString: string): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return isoString;
  }
}

export function formatConfidence(pct: number): string {
  return `${Math.round(pct)}%`;
}

export function severityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'high':
      return 'bg-rose-100 text-rose-600';
    case 'medium':
      return 'bg-amber-100 text-amber-600';
    case 'low':
      return 'bg-emerald-100 text-emerald-600';
    default:
      return 'bg-slate-100 text-slate-500';
  }
}