const LOCAL_URL = "http://127.0.0.1:5000";
const NGROK_URL = "https://untutelary-francisco-overtrustfully.ngrok-free.dev";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_USE_NGROK === "true"
    ? NGROK_URL
    : LOCAL_URL;

export const buildUrl = (path: string) => `${BACKEND_URL}${path}`;

export const SMALL_MODELS = [
  {
    id: "microsoft/phi-3-mini-4k-instruct",
    label: "Phi-3 Mini (Best small LLM)"
  },
  {
    id: "google/gemma-2b",
    label: "Gemma 2B"
  },
  {
    id: "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    label: "TinyLlama 1.1B"
  },
  {
    id: "mistralai/Mistral-7B-Instruct-v0.2",
    label: "Mistral 7B (strong baseline)"
  },
  {
    id: "Qwen/Qwen1.5-0.5B",
    label: "Qwen 1.5 (0.5B)"
  }
];
