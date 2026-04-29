import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

export default function UploadDropzone({
  label,
  hint,
  multiple = false,
  onSelect,
}: {
  label: string;
  hint: string;
  multiple?: boolean;
  onSelect: (files: FileList | null) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        onSelect(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
        dragging
          ? 'border-emerald-300 bg-emerald-500/10'
          : 'border-white/25 bg-slate-950/30 hover:border-emerald-300/70 hover:bg-emerald-500/10'
      }`}
    >
      <UploadCloud className="mb-2 h-7 w-7 text-emerald-200" />
      <p className="text-sm font-medium text-emerald-50">{label}</p>
      <p className="mt-1 text-xs text-emerald-100/70">{hint}</p>
      <input
        type="file"
        className="sr-only"
        accept="image/*"
        multiple={multiple}
        onChange={(e) => onSelect(e.target.files)}
      />
    </label>
  );
}
