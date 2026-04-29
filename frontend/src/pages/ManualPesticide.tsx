import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, AlertCircle, FlaskConical, Droplet, Beaker, Info } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input, Select } from '@/src/components/ui/Input';
import { recommendPesticide, apiErrorMessage, type RecommendationApi } from '@/src/services/api';
import { cn } from '@/src/utils/helpers';

const DISEASE_OPTIONS = [
  { label: 'Select Disease', value: '' },
  { label: 'Healthy', value: 'Healthy' },
  { label: 'Powdery Mildew', value: 'Powdery_Mildew' },
  { label: 'Rust', value: 'Rust' },
  { label: 'Anthracnose', value: 'Anthracnose' },
  { label: 'Bacterial Blight', value: 'Bacterial_Blight' },
  { label: 'Leaf Spot', value: 'Leaf_Spot' },
  { label: 'Mosaic Virus', value: 'Mosaic_Virus' },
  { label: 'Bean Blight', value: 'Bean___Blight' },
  { label: 'Bean Mosaic Virus', value: 'Bean___Mosaic_Virus' },
  { label: 'Bean Rust', value: 'Bean___Rust' },
  { label: 'Cowpea Bacterial Wilt', value: 'Cowpea___Bacterial_wilt' },
  { label: 'Cowpea Mosaic Virus', value: 'Cowpea___Mosaic_virus' },
  { label: 'Pea Downy Mildew', value: 'Pea___DOWNY_MILDEW_LEAF' },
  { label: 'Pea Powdery Mildew', value: 'Pea___POWDER_MILDEW_LEAF' },
  { label: 'Soyabean Rust', value: 'Soyabean___Rust' },
  { label: 'Soyabean Frogeye Leaf Spot', value: 'Soyabean___Frogeye_Leaf_Spot' },
  { label: 'Other / Unknown', value: 'Diseased' },
];

const SOIL_OPTIONS = [
  { label: 'Select Soil Type', value: '' },
  { label: 'Sandy', value: 'Sandy' },
  { label: 'Loamy', value: 'Loamy' },
  { label: 'Clay', value: 'Clay' },
  { label: 'Silty', value: 'Silty' },
  { label: 'Peaty', value: 'Peaty' },
  { label: 'Black', value: 'Black' },
  { label: 'Red', value: 'Red' },
];

const STAGE_OPTIONS = [
  { label: 'Select Growth Stage', value: '' },
  { label: 'Seedling', value: 'Seedling' },
  { label: 'Vegetative', value: 'Vegetative' },
  { label: 'Flowering', value: 'Flowering' },
  { label: 'Pod Filling', value: 'Pod_Filling' },
  { label: 'Maturity', value: 'Maturity' },
];

export default function ManualPesticide() {
  const [form, setForm] = React.useState({
    disease: '',
    cropName: '',
    soilType: '',
    landArea: '',
    growthStage: '',
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<RecommendationApi | null>(null);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.disease)      return setError('Please select a disease.');
    if (!form.cropName.trim()) return setError('Crop name is required.');
    if (!form.soilType)     return setError('Please select a soil type.');
    if (!form.growthStage)  return setError('Please select a growth stage.');
    if (!form.landArea || Number(form.landArea) <= 0)
      return setError('Please enter a valid land area.');

    setIsLoading(true);
    setResult(null);

    try {
      const res = await recommendPesticide({
        disease: form.disease,
        crop: form.cropName.trim(),
        soil: form.soilType,
        land_area: Number(form.landArea),
        stage: form.growthStage,   // ✅ correct field name matching api.ts
      });

      setResult({
        pesticide:     res.pesticide,
        dosage:        res.dosage,
        spray_interval: res.spray_interval,
        precautions:   res.precautions,
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">
          Pesticide <span className="text-brand-600">Recommendation</span>
        </h1>
        <p className="text-slate-500 font-medium">
          Get precise pesticide dosage based on disease, crop, soil and land area.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Form */}
        <div className="bg-white rounded-[2.5rem] border border-emerald-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Select
              label="Disease Detected"
              options={DISEASE_OPTIONS}
              value={form.disease}
              onChange={(e) => setForm({ ...form, disease: e.target.value })}
            />

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

            <Select
              label="Growth Stage"
              options={STAGE_OPTIONS}
              value={form.growthStage}
              onChange={(e) => setForm({ ...form, growthStage: e.target.value })}
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  label="Land Area (hectares)"
                  type="number"
                  placeholder="e.g. 2.5"
                  value={form.landArea}
                  onChange={(e) => setForm({ ...form, landArea: e.target.value })}
                />
              </div>
              <div className="pt-[25px]">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-500 h-[50px] flex items-center">
                  Hectares
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <p className="text-rose-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              size="xl"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<Beaker size={22} />}
            >
              Calculate Dosage
            </Button>
          </form>
        </div>

        {/* Result */}
        <div className="min-h-[420px]">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[420px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-white gap-5"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                  <Droplet
                    size={40}
                    className={cn(isLoading && 'animate-bounce text-brand-400')}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-400 italic">
                    {isLoading ? 'Calculating...' : 'No Recommendation Yet'}
                  </h4>
                  <p className="text-slate-400 text-sm font-medium mt-1">
                    Fill in the form and calculate.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="bg-brand-900 rounded-[2.5rem] p-8 text-white shadow-2xl space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-800 rounded-2xl flex items-center justify-center text-emerald-400">
                      <FlaskConical size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                        Recommended Treatment
                      </p>
                      <h3 className="text-2xl font-black italic leading-tight">{result.pesticide}</h3>
                    </div>
                  </div>

                  <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
                      Total Dosage
                    </p>
                    <p className="text-3xl font-black">{result.dosage}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                        Spray Interval
                      </p>
                      <p className="text-lg font-bold">{result.spray_interval}</p>
                    </div>

                    <div className="bg-amber-500/20 border border-amber-400/30 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-amber-300" />
                        <p className="text-[10px] font-black text-amber-300 uppercase tracking-widest">
                          Precautions
                        </p>
                      </div>
                      <p className="text-sm text-amber-50 leading-relaxed">{result.precautions}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-white/40 leading-relaxed">
                    This is AI-assisted guidance only. Always follow registered local labels.
                  </p>

                  <button
                    onClick={() => setResult(null)}
                    className="w-full py-3 rounded-xl border border-white/20 text-white/60 font-bold hover:bg-white/10 transition-all text-sm"
                  >
                    Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}