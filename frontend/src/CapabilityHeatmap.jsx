import { useState } from 'react';

const STATUS_COLORS = {
  IMPROVED: {
    bg: 'bg-emerald-900/70',
    border: 'border-emerald-600',
    badge: 'bg-emerald-600 text-white',
    text: 'text-emerald-400',
  },
  STABLE: {
    bg: 'bg-amber-900/70',
    border: 'border-amber-600',
    badge: 'bg-amber-600 text-white',
    text: 'text-amber-400',
  },
  REGRESSED: {
    bg: 'bg-red-900/70',
    border: 'border-red-600',
    badge: 'bg-red-600 text-white',
    text: 'text-red-400',
  },
};

const HEALTH_CONFIG = {
  Healthy: {
    bg: 'bg-emerald-800/80',
    border: 'border-emerald-600',
    text: 'text-emerald-300',
  },
  Caution: {
    bg: 'bg-amber-800/80',
    border: 'border-amber-600',
    text: 'text-amber-300',
  },
  Critical: {
    bg: 'bg-red-800/80',
    border: 'border-red-600',
    text: 'text-red-300',
  },
};

function DomainCard({ domain, isExpanded, onClick }) {
  const colors = STATUS_COLORS[domain.status] || STATUS_COLORS.STABLE;
  const deltaDisplay = domain.delta >= 0 ? `+${domain.delta}` : `${domain.delta}`;

  return (
    <div className="space-y-2">
      <button
        onClick={onClick}
        className={`w-full p-4 rounded-lg border-2 ${colors.bg} ${colors.border} transition-all duration-200 hover:scale-[1.02] cursor-pointer text-left`}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-white capitalize">
            {domain.domain.replace('_', ' ')}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors.badge}`}>
            {domain.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-xs text-slate-400 mb-1">Base</p>
            <p className="text-xl font-bold text-slate-200">{domain.base_score}</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-xs text-slate-400 mb-1">Fine-Tuned</p>
            <p className="text-xl font-bold text-slate-200">{domain.ft_score}</p>
          </div>
          <div className="bg-slate-800/50 rounded p-2">
            <p className="text-xs text-slate-400 mb-1">Delta</p>
            <p className={`text-xl font-bold ${domain.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {deltaDisplay}
            </p>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-slate-400">Click to expand</span>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 animate-fadeIn">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Score Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Base Model Score</span>
              <span className="text-white font-medium">{domain.base_score}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Fine-Tuned Score</span>
              <span className="text-white font-medium">{domain.ft_score}%</span>
            </div>
            <div className="h-px bg-slate-700 my-2"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Change</span>
              <span className={`font-semibold ${domain.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {deltaDisplay}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Tests Evaluated</span>
              <span className="text-white">4 per domain</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthBanner({ healthScore, healthStatus }) {
  const config = HEALTH_CONFIG[healthStatus] || HEALTH_CONFIG.Caution;

  return (
    <div className={`mb-6 p-4 rounded-xl ${config.bg} border-2 ${config.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300 mb-1">Overall Health Score</p>
          <p className={`text-4xl font-bold ${config.text}`}>{healthScore}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300 mb-1">Status</p>
          <span className={`px-4 py-2 rounded-lg text-lg font-bold ${config.text} bg-slate-800/50`}>
            {healthStatus}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              healthStatus === 'Healthy'
                ? 'bg-emerald-500'
                : healthStatus === 'Caution'
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${healthScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default function CapabilityHeatmap({ domains, healthScore, healthStatus }) {
  const [expandedDomain, setExpandedDomain] = useState(null);

  if (!domains || domains.length === 0) {
    return (
      <div className="p-6 bg-slate-800 rounded-lg text-center">
        <p className="text-slate-400">No domain data available. Run an evaluation first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HealthBanner healthScore={healthScore} healthStatus={healthStatus} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domains.map((domain) => (
          <DomainCard
            key={domain.domain}
            domain={domain}
            isExpanded={expandedDomain === domain.domain}
            onClick={() =>
              setExpandedDomain(expandedDomain === domain.domain ? null : domain.domain)
            }
          />
        ))}
      </div>
    </div>
  );
}
