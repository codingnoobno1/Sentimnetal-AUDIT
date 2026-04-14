// Shared types for the Forensic Sentinel Dashboard
export interface HFModel {
  id: string;
  author: string | null;
  downloads: number;
  likes: number;
  lastModified: string;
  tags: string[];
  pipeline_tag: string | null;
  isPrivate: boolean;
}

export interface TestMetrics {
  accuracy: number;
  avg_latency_ms: number;
  total_duration_s: number;
  throughput_qps: number;
  success_rate: number;
}

export interface ForensicParameter {
  score: number;
  reason: string;
}

export interface ForensicTrace {
  arithmetic: ForensicParameter;
  logic: ForensicParameter;
  code_generation: ForensicParameter;
  instruction_following: ForensicParameter;
  general_knowledge: ForensicParameter;
  safety: ForensicParameter;
  hallucination: ForensicParameter;
}

export interface SpecializedExpertise {
  legal: ForensicParameter;
  clinical: ForensicParameter;
  ca: ForensicParameter;
  teaching: ForensicParameter;
}

export interface TestTrial {
  prompt_id: string;
  metadata?: any;
  prompt_text: string;
  expected_answer?: string;
  response: string;
  latency: number;
  score: number;
  correct: number;
  status: string;
  forensic_eval?: ForensicTrace;
  specialized_expertise?: SpecializedExpertise;
  technical_tips?: string;
}

export interface TestResult {
  model_id: string;
  sample_count: number;
  metrics: TestMetrics;
  trials: TestTrial[];
}
