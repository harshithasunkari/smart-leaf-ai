export default function Spinner({
  className = '',
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-90"
        aria-hidden
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}
