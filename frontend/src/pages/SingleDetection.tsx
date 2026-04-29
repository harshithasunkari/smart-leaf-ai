import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Upload, Activity, FlaskConical, X
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { predictSingle, saveInteraction, apiErrorMessage } from '@/src/services/api';
import { authStore } from '@/src/store/auth';
import { cn } from '@/src/utils/helpers';

const CROP_STAGE_OPTIONS = [
  { label: 'Select Stage', value: '' },
  { label: 'Seedling', value: 'Seedling' },
  { label: 'Vegetative', value: 'Vegetative' },
  { label: 'Flowering', value: 'Flowering' },
  { label: 'Pod Filling', value: 'Pod_Filling' },
  { label: 'Maturity', value: 'Maturity' },
];

export default function SingleDetection() {
  const [image, setImage] = React.useState<string | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [cropName, setCropName] = React.useState('');
  const [cropStage, setCropStage] = React.useState('');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('Image must be under 15 MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setImageFile(file);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  const analyzeImage = async () => {
    if (!imageFile) { setError('Please select an image'); return; }
    if (!cropName.trim()) { setError('Please enter the crop name'); return; }
    if (!cropStage) { setError('Please select the crop growth stage'); return; }

    setIsAnalyzing(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('crop_name', cropName.trim());
      fd.append('crop_stage', cropStage);

      const data = await predictSingle(fd);

      setResult(data);

      const user = authStore.getUser();

      if (user) {
        await fetch(`${import.meta.env.VITE_API_URL}/history/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            case_type: "single_detection",
            title: data.disease,
            payload_json: data,
          }),
        });
      }
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setCropName('');
    setCropStage('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          Single Image Detection
        </h1>
        <p className="text-slate-500 font-medium">
          Upload a leaf photo for instant AI disease identification.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-5">

          {/* DROPZONE */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={cn(
              'relative rounded-3xl border-2 border-dashed bg-white min-h-[280px] flex items-center justify-center',
              image ? 'border-brand-400 p-3' : 'border-emerald-200 p-10'
            )}
          >
            {!image ? (
              <label className="cursor-pointer text-center space-y-3">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Upload size={40} className="text-brand-500 mx-auto" />
                <p className="font-bold">Upload Leaf Image</p>
              </label>
            ) : (
              <div className="relative w-full">
                <img src={image} className="w-full rounded-2xl aspect-square object-cover" alt="leaf" />
                <button onClick={reset} className="absolute top-2 right-2 bg-white p-2 rounded-xl shadow">
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* FORM */}
          <div className="bg-white p-5 rounded-2xl border space-y-4">
            <Input
              label="Crop Name"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Pea"
            />
            <Select
              label="Growth Stage"
              options={CROP_STAGE_OPTIONS}
              value={cropStage}
              onChange={(e) => setCropStage(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={analyzeImage}
              disabled={!image || isAnalyzing}
              isLoading={isAnalyzing}
              className="flex-1"
            >
              Run Scan
            </Button>
            <button onClick={reset} className="px-4 py-3 rounded-xl border text-slate-500 hover:bg-slate-50 transition-all">
              Reset
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="min-h-[400px]">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl bg-white text-center p-10 gap-3">
              <Activity size={50} className="text-slate-300" />
              <p className="text-slate-500">No result yet</p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* DISEASE CARD */}
              <div className="bg-white p-6 rounded-3xl border shadow-sm">
                <h2 className="text-2xl font-black text-slate-800">
                  {result.disease ?? result.dominant_disease}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Crop: {result.crop_name} | Stage: {result.crop_stage}
                </p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                    {result.severity}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
                    {result.confidence_percent}% confidence
                  </span>
                </div>

                {result.low_confidence_warning && result.low_confidence_message && (
                  <p className="text-xs text-amber-600 mt-3 bg-amber-50 p-3 rounded-xl">
                    ⚠ {result.low_confidence_message}
                  </p>
                )}
              </div>

              {/* DISCLAIMER */}
              {result.consult_expert_disclaimer && (
                <p className="text-xs text-slate-400 leading-relaxed px-1">
                  ⚠️ {result.consult_expert_disclaimer}
                </p>
              )}

              <button onClick={reset} className="text-sm text-brand-600 font-bold hover:underline">
                New Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}