// Shared types for the Compare module
export interface CompareModel {
  id: string;
  label: string;
  isLocal: boolean;
}

export interface ComparePrompt {
  id: string;
  domain: string;
  prompt_text: string;
  expected_answer: string;
  difficulty: string;
  category: string;
}

export interface CompareResponse {
  model_id: string;
  response: string;
  latency: number;
  status: string;
}

export interface MistralVerdict {
  model_a_score: number;
  model_b_score: number;
  winner: "model_a" | "model_b" | "tie";
  reasoning: string;
  dimensions: {
    accuracy: { a: number; b: number };
    relevance: { a: number; b: number };
    coherence: { a: number; b: number };
    completeness: { a: number; b: number };
    safety: { a: number; b: number };
  };
  provider?: string;
  confidence?: number;
  meta?: {
    judges_used?: number;
    variance?: number;
  };
}

export interface CompareTrialResult {
  prompt: ComparePrompt;
  model_a: CompareResponse;
  model_b: CompareResponse;
  verdict?: MistralVerdict;
}

export interface CompareSession {
  model_a_id: string;
  model_b_id: string;
  domain: string;
  trials: CompareTrialResult[];
  summary?: {
    model_a_wins: number;
    model_b_wins: number;
    ties: number;
    model_a_avg: number;
    model_b_avg: number;
  };
}
