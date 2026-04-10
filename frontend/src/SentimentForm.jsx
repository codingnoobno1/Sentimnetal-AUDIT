import { useState } from 'react';
import axios from 'axios';
import { Shield, Activity, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_MESSAGES = {
  idle: '',
  loading: 'Initializing forensic node...',
  analyzing: 'Quantifying regression patterns...',
  scoring: 'Synthesizing audit report...',
  complete: 'Integrity verified!',
};

export default function SentimentForm({ onResult }) {
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
      
      const response = await axios.post('/api/audit', formData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 600000,
      });

      setStatus('scoring');
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus('complete');
      
      if (onResult) {
        onResult(response.data);
      }
    } catch (err) {
      console.error('Audit error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Audit failed';
      setError(`CRITICAL_FAILURE: ${errorMessage}`);
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.base_model_id.trim() && formData.ft_model_id.trim();

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-xl p-10 relative overflow-hidden border border-charcoal/5">
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-red" />
          
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-1.5 bg-indigo-blue rounded-sm">
                 <Shield className="w-5 h-5 text-white" />
               </div>
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Regression Sentinel v4.2</span>
            </div>
            <h1 className="text-4xl font-bold text-charcoal tracking-tighter mb-4">Forensic <span className="text-orange-red italic font-light">Audit</span></h1>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-md leading-relaxed">
              Institutional grade sentiment analysis quantification and regression detection.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label
                  htmlFor="base_model_id"
                  className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 transition-colors group-focus-within:text-indigo-blue"
                >
                  Base Model Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="base_model_id"
                    name="base_model_id"
                    value={formData.base_model_id}
                    onChange={handleChange}
                    placeholder="e.g. cardiffnlp/twitter-roberta-base-sentiment"
                    disabled={isLoading}
                    className="w-full px-5 py-4 bg-[#fbfbfb] border border-charcoal/[0.08] text-charcoal font-bold text-sm placeholder-zinc-300 focus:outline-none focus:border-indigo-blue transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="ft_model_id"
                  className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 transition-colors group-focus-within:text-indigo-blue"
                >
                  Fine-Tuned Model Identifier
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="ft_model_id"
                    name="ft_model_id"
                    value={formData.ft_model_id}
                    onChange={handleChange}
                    placeholder="e.g. username/my-sentiment-model"
                    disabled={isLoading}
                    className="w-full px-5 py-4 bg-[#fbfbfb] border border-charcoal/[0.08] text-charcoal font-bold text-sm placeholder-zinc-300 focus:outline-none focus:border-indigo-blue transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-orange-red">
                    <Shield className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="dataset_description"
                  className="block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 transition-colors group-focus-within:text-indigo-blue"
                >
                  Training Dataset Metadata
                </label>
                <textarea
                  id="dataset_description"
                  name="dataset_description"
                  value={formData.dataset_description}
                  onChange={handleChange}
                  placeholder="Comprehensive description of the datasets used for model optimization..."
                  rows={3}
                  disabled={isLoading}
                  className="w-full px-5 py-4 bg-[#fbfbfb] border border-charcoal/[0.08] text-charcoal font-bold text-sm placeholder-zinc-300 focus:outline-none focus:border-indigo-blue transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="group w-full py-5 px-8 bg-orange-red hover:bg-orange-600 disabled:bg-zinc-200 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-300 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Analysis</span>
                </>
              ) : (
                <>
                  <span>Initialize Forensic Audit</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {isLoading && (
            <div className="mt-10 pt-10 border-t border-charcoal/[0.03]">
              <div className="flex items-center gap-4">
                 <div className="w-full h-[2px] bg-zinc-100 relative overflow-hidden">
                    <div className="absolute top-0 h-full bg-indigo-blue animate-[shimmer_2s_infinite]" style={{ width: '40%' }} />
                 </div>
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-blue text-center animate-pulse">
                {STATUS_MESSAGES[status]}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-5 bg-orange-50 border border-orange-red/10 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-orange-red shrink-0 mt-0.5" />
              <p className="text-orange-red text-[11px] font-bold uppercase tracking-widest leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
           <div className="flex gap-10">
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Protocol</p>
                 <p className="text-[10px] font-bold text-charcoal">HUGGINGFACE_INF_API</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Encryption</p>
                 <p className="text-[10px] font-bold text-charcoal">TLS_V1.3_VERIFIED</p>
              </div>
           </div>
           <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">© 2026 REGRESSION SENTINEL</p>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
