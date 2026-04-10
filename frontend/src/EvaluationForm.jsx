import { useState } from 'react';
import axios from 'axios';

const STATUS_MESSAGES = {
  idle: '',
  loading: 'Loading models from HuggingFace...',
  benchmark: 'Running 24 benchmark tests...',
  scoring: 'Scoring responses...',
  diagnostics: 'Generating diagnostics...',
  complete: 'Evaluation complete!',
};

function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
    </div>
  );
}

export default function EvaluationForm({ onResult }) {
  const [formData, setFormData] = useState({
    base_model_id: '',
    ft_model_id: '',
    dataset_description: '',
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      setStatus('loading');
      
      const response = await axios.post('/api/evaluate', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 600000,
      });

      setStatus('scoring');
      await new Promise((resolve) => setTimeout(resolve, 300));

      setStatus('diagnostics');
      await new Promise((resolve) => setTimeout(resolve, 300));

      setStatus('complete');
      
      if (onResult) {
        onResult(response.data);
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Evaluation failed';
      setError(`Error: ${errorMessage}`);
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.base_model_id.trim() && formData.ft_model_id.trim();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="bg-slate-800 rounded-xl shadow-2xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Valut AI</h1>
            <p className="text-indigo-400 font-medium">Fine-Tuned Model Evaluation</p>
            <p className="text-slate-400 text-sm mt-1">Compare base and fine-tuned model performance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="base_model_id"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Base Model ID
              </label>
              <input
                type="text"
                id="base_model_id"
                name="base_model_id"
                value={formData.base_model_id}
                onChange={handleChange}
                placeholder="e.g., meta-llama/Llama-3.1-8B-Instruct"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="ft_model_id"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Fine-Tuned Model ID
              </label>
              <input
                type="text"
                id="ft_model_id"
                name="ft_model_id"
                value={formData.ft_model_id}
                onChange={handleChange}
                placeholder="e.g., username/my-finetuned-model"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="dataset_description"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Dataset Description
              </label>
              <textarea
                id="dataset_description"
                name="dataset_description"
                value={formData.dataset_description}
                onChange={handleChange}
                placeholder="Describe what the model was fine-tuned on..."
                rows={3}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {isLoading ? 'Evaluating...' : 'Run Evaluation'}
            </button>
          </form>

          {isLoading && (
            <div className="mt-8 space-y-4">
              <Spinner />
              <p className="text-center text-indigo-400 font-medium animate-pulse">
                {STATUS_MESSAGES[status]}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 text-sm whitespace-pre-wrap">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <h3 className="text-white font-medium mb-2">Evaluation Categories</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
            <span>• Arithmetic (4 tests)</span>
            <span>• Code Generation (4 tests)</span>
            <span>• Logical Reasoning (4 tests)</span>
            <span>• General Knowledge (4 tests)</span>
            <span>• Instruction Following (4 tests)</span>
            <span>• Safety Compliance (4 tests)</span>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Powered by HuggingFace Inference API & Groq
        </p>
      </div>
    </div>
  );
}
