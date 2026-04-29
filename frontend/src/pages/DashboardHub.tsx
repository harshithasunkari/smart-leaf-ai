import React from 'react';
import { motion } from 'motion/react';
import {
  Activity, CheckCircle2, AlertTriangle, Scan,
  FlaskConical, History, Leaf
} from 'lucide-react';
import { cn } from '@/src/utils/helpers';
import type { AuthUser } from '@/src/store/auth';

interface DashboardHubProps {
  user?: AuthUser | null;
}

const features = [
  {
    id: 'detection',
    icon: Scan,
    title: 'Single Scan',
    desc: 'Upload one leaf image for instant disease detection.',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
  },
  {
    id: 'multi',
    icon: Activity,
    title: 'Batch Scan',
    desc: 'Upload 2–5 images for consolidated field diagnosis.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
  {
    id: 'manual',
    icon: FlaskConical,
    title: 'Pesticide Advisor',
    desc: 'Get dosage guidance by crop, soil and disease.',
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
  },
  {
    id: 'history',
    icon: History,
    title: 'History',
    desc: 'Review all your saved diagnoses.',
    color: 'bg-purple-50 text-purple-600',
    border: 'border-purple-100',
  },
];

const classes = [
  'Bean Blight', 'Bean Mosaic Virus', 'Bean Rust', 'Cowpea Bacterial Wilt',
  'Cowpea Mosaic Virus', 'Cowpea Septoria Leaf Spot', 'Pea Downy Mildew',
  'Pea Leaf Miner', 'Pea Powdery Mildew', 'Soyabean Bacterial Pustule',
  'Soyabean Frogeye Leaf Spot', 'Soyabean Rust', 'Soyabean Sudden Death',
  'Soyabean Target Leaf Spot', 'Soyabean Yellow Mosaic',
];

export default function DashboardHub({ user }: DashboardHubProps) {
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Farmer';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center">
              <Leaf size={22} className="text-brand-950" />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              LegumeCare AI
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase mb-2">
            Welcome, {displayName}
          </h1>
          <p className="text-emerald-100/70 font-medium max-w-xl">
            AI-powered legume disease detection with precise pesticide recommendations for
            Bean, Cowpea, Pea and Soyabean crops.
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-black">19</p>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Disease Classes</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-black">4</p>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Crop Types</p>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <p className="text-2xl font-black">3</p>
              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">Languages</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
          Available Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={cn(
                'bg-white border rounded-3xl p-6 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group',
                feat.border
              )}
            >
              <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-5', feat.color)}>
                <feat.icon size={22} />
              </div>
              <h3 className="font-black text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Supported Diseases */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
            Supported Disease Classes ({classes.length})
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {classes.map((cls, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100"
            >
              {cls}
            </span>
          ))}
          <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold border border-slate-100">
            + Fresh/Healthy variants
          </span>
        </div>
      </div>
    </div>
  );
}