import axios, { AxiosError } from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const API_ORIGIN = rawBase.replace(/\/?api\/?$/, '');

const JSON_HEADERS = { Accept: 'application/json' as const };

// Root-level routes (predict, recommendation, history)
export const rootClient = axios.create({
  baseURL: API_ORIGIN,
  headers: JSON_HEADERS,
  timeout: 120_000,
});

// /api/* routes (auth, chat)
export const apiClient = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: JSON_HEADERS,
  timeout: 30_000,
});

// Attach token to every request
const attachToken = (cfg: any) => {
  const token = localStorage.getItem('auth_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
};

rootClient.interceptors.request.use(attachToken);
apiClient.interceptors.request.use(attachToken);

// ─── Error message helper ───────────────────────────────────
export function apiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<{ detail?: string | { msg: string }[]; message?: string }>;
    if (ax.code === 'ECONNABORTED') {
      return `Request timed out. Is the backend running at ${API_ORIGIN}?`;
    }
    if (!ax.response) {
      return `Cannot reach server (${API_ORIGIN}). Start FastAPI: uvicorn main:app --reload`;
    }
    const d = ax.response.data?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d[0]?.msg) return d.map((x) => x.msg).join('; ');
    return ax.response.statusText || `HTTP ${ax.response.status}`;
  }
  if (err instanceof Error) return err.message;
  return 'Request failed';
}

// ─── Health ─────────────────────────────────────────────────
export async function checkHealth(): Promise<{ ok: boolean; model_ready?: boolean }> {
  const { data } = await rootClient.get<{ status?: string; model_ready?: boolean }>('/health');
  return { ok: data.status === 'ok', model_ready: data.model_ready };
}

// ─── Auth ────────────────────────────────────────────────────
export async function signup(email: string, password: string, fullName: string) {
  const { data } = await apiClient.post<{ access_token: string }>('/auth/signup', {
    email,
    password,
    full_name: fullName,
  });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ access_token: string }>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<{ id: number; email: string; full_name: string }>(
    '/auth/me'
  );
  return data;
}

// ─── Types ──────────────────────────────────────────────────
export interface SinglePredictApi {
  disease?: string;
  dominant_disease?: string;
  confidence: number;
  confidence_percent: number;
  severity: string;
  crop_name: string;
  crop_stage: string;
  image_path: string;
  low_confidence_warning?: boolean;
  low_confidence_message?: string | null;
  consult_expert_disclaimer?: string;
}

export interface MultiImageResult {
  disease?: string;
  predicted_disease?: string;
  confidence: number;
  confidence_percent: number;
  severity: string;
}

export interface MultiPredictApi {
  dominant_disease: string;
  confidence: number;
  confidence_percent: number;
  severity: string;
  crop_name: string;
  crop_stage: string;
  per_image: MultiImageResult[];
  image_paths: string[];
  low_confidence_warning?: boolean;
  low_confidence_message?: string | null;
  consult_expert_disclaimer?: string;
}

export interface RecommendationApi {
  pesticide: string;
  dosage: string;
  spray_interval: string;
  precautions: string;
  spray_interval_days?: number;
}

export interface InteractionRecord {
  id: number;
  user_id: number;
  image_path: string | null;
  disease: string | null;
  recommendation: Record<string, unknown>;
  created_at: string;
}

// ─── Predict ────────────────────────────────────────────────
export async function predictSingle(form: FormData) {
  const { data } = await rootClient.post<SinglePredictApi>('/predict-single', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    ...data,
    disease: data.dominant_disease || data.disease,
  };
}

export async function predictMulti(form: FormData) {
  const { data } = await rootClient.post<MultiPredictApi>('/predict-multiple', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    ...data,
    per_image: data.per_image.map(img => ({
      ...img,
      disease: img.disease || img.predicted_disease,
    })),
  };
}

// ─── Recommendation ─────────────────────────────────────────
export async function recommendPesticide(body: {
  disease: string;
  crop: string;
  soil: string;
  land_area: number;
  stage: string;
}) {
  const { data } = await rootClient.post<RecommendationApi>('/recommendation', body);
  return data;
}

// ─── History ─────────────────────────────────────────────────
export async function saveInteraction(body: {
  user_id: number;
  image_path?: string | null;
  disease?: string | null;
  recommendation: Record<string, unknown>;
}) {
  const { data } = await rootClient.post<{ ok: boolean; id: number }>('/history', body);
  return data;
}

export async function listInteractions(userId: number) {
  const { data } = await rootClient.get<{
    user_id: number;
    count: number;
    records: InteractionRecord[];
  }>('/history', { params: { user_id: userId } });
  return data;
}

// ─── Chat ────────────────────────────────────────────────────
export async function chat(message: string, language: string) {
  const { data } = await apiClient.post<{ success: boolean; data: { reply: string } }>('/chat', {
    message,
    language,
  });
  return data;
}

export default apiClient;