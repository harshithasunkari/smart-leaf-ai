import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Scan, Leaf,
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { predictMulti, saveInteraction, apiErrorMessage, type MultiPredictApi } from '@/src/services/api';
import { authStore } from '@/src/store/auth';
import { cn } from '@/src/utils/helpers';

const SOIL_OPTIONS = [
  { label: 'Loamy (Balanced)', value: 'Loamy' },
  { label: 'Clay (Heavy)', value: 'Clay' },
  { label: 'Sandy (Light)', value: 'Sandy' },
  { label: 'Silty (Damp)', value: 'Silty' },
  { label: 'Black Cotton', value: 'Black' },
  { label: 'Red', value: 'Red' },
];

const STAGE_OPTIONS = [
  { label: 'Vegetative', value: 'Vegetative' },
  { label: 'Flowering', value: 'Flowering' },
  { label: 'Pod Filling', value: 'Pod_Filling' },
  { label: 'Maturity', value: 'Maturity' },
  { label: 'Seedling', value: 'Seedling' },
];

interface BatchFile {
  id: string;
  file: File;
  preview: string;
}

// Extend MultiPredictApi to include fields backend already returns
interface MultiPredictFull extends MultiPredictApi {
  pesticide?: string;
  dosage?: string;
  spray_interval?: string;
  precautions?: string;
}

export default function MultiDetection() {
  const [step, setStep] = React.useState(1);
  const [files, setFiles] = React.useState<BatchFile[]>([]);
  const [form, setForm] = React.useState({
    cropName: '',
    soilType: 'Loamy',
    cropStage: 'Vegetative',
    landArea: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<MultiPredictFull | null>(null);
  const [error, setError] = React.useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles = Array.from(selected).map((file) => ({
      id: Math.random().toString(36).slice(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const processBatch = async () => {
    if (files.length < 2) {
      setError('Upload at least 2 images');
      return;
    }
    if (!form.cropName.trim()) {
      setError('Crop name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f.file));
      fd.append('crop_name', form.cropName.trim());
      fd.append('crop_stage', form.cropStage);
      fd.append('soil_type', form.soilType);
      if (form.landArea) fd.append('land_area', form.landArea);

      const data = await predictMulti(fd) as MultiPredictFull;
      setResult(data);
      const saveBatchHistory = async (data: MultiPredictFull) => {
        const user = authStore.getUser();
        if (!user) return;

        await fetch(`${import.meta.env.VITE_API_URL}/history/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            case_type: "multi_detection",
            title: data.dominant_disease,
            payload_json: data,
          }),
        });
      };
      setStep(3);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setResult(null);
    setError('');
    setStep(1);
    setForm({ cropName: '', soilType: 'Loamy', cropStage: 'Vegetative', landArea: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all',
                step === s
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : step > s
                  ? 'bg-brand-100 text-brand-600'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              {step > s ? <CheckCircle2 size={20} /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  'w-16 h-1 rounded-full transition-all',
                  step > s ? 'bg-brand-300' : 'bg-slate-100'
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Crop Info */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">
                Field Parameters
              </h2>
              <p className="text-slate-500 font-medium">
                Enter crop details for multi-image analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] border border-emerald-100 p-7 shadow-sm space-y-5">
                <Input
                  label="Crop Name"
                  placeholder="e.g. Soybean, Pea, Bean"
                  icon={<Leaf size={18} />}
                  value={form.cropName}
                  onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                />
                <Select
                  label="Soil Type"
                  options={SOIL_OPTIONS}
                  value={form.soilType}
                  onChange={(e) => setForm({ ...form, soilType: e.target.value })}
                />
                <Input
                  label="Land Area (hectares)"
                  type="number"
                  placeholder="0.00"
                  value={form.landArea}
                  onChange={(e) => setForm({ ...form, landArea: e.target.value })}
                />
              </div>

              <div className="bg-white rounded-[2rem] border border-emerald-100 p-7 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-5">
                  Growth Stage
                </p>
                <div className="space-y-3">
                  {STAGE_OPTIONS.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setForm({ ...form, cropStage: stage.value })}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-sm font-bold',
                        form.cropStage === stage.value
                          ? 'bg-brand-50 border-brand-200 text-brand-700'
                          : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                      )}
                    >
                      <span>{stage.label}</span>
                      {form.cropStage === stage.value && (
                        <CheckCircle2 size={18} className="text-brand-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                size="lg"
                rightIcon={<ChevronRight size={20} />}
                onClick={() => setStep(2)}
                disabled={!form.cropName.trim()}
              >
                Upload Images
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Upload */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                Upload Leaf Images
              </h2>
              <p className="text-slate-500 font-medium">Upload 2–5 leaf images for batch analysis.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow"
                >
                  <img
                    src={f.preview}
                    className="w-full h-full object-cover"
                    alt="Leaf specimen"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => removeFile(f.id)}
                      className="bg-white text-rose-600 px-3 py-2 rounded-xl font-bold text-sm flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}

              {files.length < 5 && (
                <label className="relative group aspect-square rounded-2xl border-2 border-dashed border-emerald-100 hover:border-brand-300 hover:bg-brand-50/30 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-500 group-hover:scale-110 transition-transform">
                    <Plus size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-500 text-center">
                    Add Image <br />
                    <span className="text-slate-300">{5 - files.length} left</span>
                  </p>
                </label>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="ghost"
                leftIcon={<ChevronLeft size={20} />}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                size="lg"
                isLoading={isLoading}
                onClick={processBatch}
                disabled={files.length < 2}
                leftIcon={!isLoading ? <Scan size={20} /> : undefined}
              >
                {isLoading ? 'Analyzing...' : 'Analyze All'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">
                Batch Results
              </h2>
              <p className="text-slate-500 font-medium">
                Consolidated analysis across all images.
              </p>
            </div>

            {result.low_confidence_warning && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-sm font-medium">
                  {result.low_confidence_message}
                </p>
              </div>
            )}

            <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 shadow-sm space-y-8">

              {/* Image previews */}
              <div className="flex -space-x-4">
                {files.slice(0, 4).map((f) => (
                  <img
                    key={f.id}
                    src={f.preview}
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow"
                    alt="Leaf"
                  />
                ))}
                {files.length > 4 && (
                  <div className="w-20 h-20 rounded-2xl bg-slate-100 ring-4 ring-white flex items-center justify-center text-slate-400 font-black">
                    +{files.length - 4}
                  </div>
                )}
              </div>

              {/* Dominant Disease + Severity + Confidence */}
              <div className="text-center space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Dominant Disease
                </p>
                <h1 className="text-5xl font-black text-slate-800 tracking-tight italic uppercase">
                  {result.dominant_disease}
                </h1>
                <div className="flex items-center justify-center gap-3">
                  <span
                    className={cn(
                      'px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest',
                      result.severity === 'High'
                        ? 'bg-rose-100 text-rose-600'
                        : result.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-emerald-100 text-emerald-600'
                    )}
                  >
                    {result.severity} Severity
                  </span>
                  <span className="text-sm text-slate-500 font-medium">
                    {result.confidence_percent}% confidence
                  </span>
                </div>
              </div>

              {/* Pesticide + Dosage — read directly from predict response */}
              {(result.pesticide || result.dosage) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.pesticide && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 space-y-1">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                        Recommended Pesticide
                      </p>
                      <p className="text-slate-800 text-base font-black leading-snug">
                        {result.pesticide}
                      </p>
                    </div>
                  )}

                  {result.dosage && (
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 space-y-1">
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                        Dosage
                      </p>
                      <p className="text-slate-800 text-base font-black leading-snug">
                        {result.dosage}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Disclaimer */}
              {result.consult_expert_disclaimer && (
                <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-4">
                  ⚠️ {result.consult_expert_disclaimer}
                </p>
              )}
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                Back to Upload
              </Button>
              <Button size="lg" onClick={resetAll}>
                New Batch Scan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}