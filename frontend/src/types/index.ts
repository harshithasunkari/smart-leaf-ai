export interface SinglePredictResult {
  disease: string;
  confidence_percent: number;
  severity_level: string;
  crop_name: string;
  crop_stage: string;
  history_id?: number;
}

export interface MultiPredictResult {
  dominant_disease: string;
  confidence_percent: number;
  severity_level: string;
  crop_name: string;
  crop_stage: string;
  per_image: { disease: string; confidence_percent: number; severity_level: string }[];
  history_id?: number;
}

export interface PesticideResult {
  pesticide_name: string;
  dosage: string;
  spray_interval: string;
  precautions: string;
  if_pesticide_fails: string;
  spray_interval_days: number;
  history_id?: number;
}

export interface HistoryListItem {
  id: number;
  case_type: string;
  title: string;
  created_at: string;
}

