function DiagnosticCard({ diagnostic }) {
  return (
    <div className="bg-slate-800/80 rounded-lg p-5 border-l-4 border-red-600 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white capitalize">
          {diagnostic.domain.replace('_', ' ')}
        </h4>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            <span className="text-red-400">{diagnostic.base_score}</span>
            {' → '}
            <span className="text-white">{diagnostic.ft_score}</span>
          </span>
          <span className="px-2 py-1 bg-red-900/50 text-red-400 text-xs font-medium rounded">
            REGRESSED
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h5 className="text-sm font-medium text-red-400 mb-1">Root Cause</h5>
          <p className="text-slate-300 text-sm leading-relaxed">
            {diagnostic.root_cause}
          </p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-amber-400 mb-1">Weight Hypothesis</h5>
          <p className="text-slate-300 text-sm leading-relaxed">
            {diagnostic.weight_hypothesis}
          </p>
        </div>

        <div>
          <h5 className="text-sm font-medium text-emerald-400 mb-1">Augmentation Recommendation</h5>
          <p className="text-slate-300 text-sm leading-relaxed">
            {diagnostic.augmentation_recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DiagnosticReport({ diagnostics }) {
  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Diagnostic Report</h3>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-900/50 mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-400 font-medium">No Regressions Detected</p>
          <p className="text-slate-400 text-sm mt-1">All domains are performing at expected levels</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Diagnostic Report</h3>
        <span className="px-3 py-1 bg-red-900/50 text-red-400 text-sm font-medium rounded-full">
          {diagnostics.length} Regressed Domain{diagnostics.length > 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-4">
        Analysis of capability degradation in fine-tuned model
      </p>
      <div className="space-y-4">
        {diagnostics.map((diagnostic) => (
          <DiagnosticCard key={diagnostic.domain} diagnostic={diagnostic} />
        ))}
      </div>
    </div>
  );
}
