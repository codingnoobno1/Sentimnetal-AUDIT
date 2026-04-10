import { useState } from 'react';
import CapabilityHeatmap from './CapabilityHeatmap';
import ComparisonCharts from './ComparisonCharts';
import DiagnosticReport from './DiagnosticReport';

function ExportButton({ reportData }) {
  const handleExport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluation-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export Report
    </button>
  );
}

function ModelInfo({ reportData }) {
  if (!reportData) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Base Model</p>
          <p className="text-white font-medium text-sm truncate">{reportData.base_model_id}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Fine-Tuned Model</p>
          <p className="text-white font-medium text-sm truncate">{reportData.ft_model_id}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Dataset</p>
          <p className="text-white font-medium text-sm truncate" title={reportData.dataset_description}>
            {reportData.dataset_description.length > 40
              ? reportData.dataset_description.substring(0, 40) + '...'
              : reportData.dataset_description}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskPredictionPanel({ predictions }) {
  if (!predictions || predictions.length === 0) return null;

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return 'bg-red-900/50 text-red-400';
      case 'medium':
        return 'bg-amber-900/50 text-amber-400';
      case 'low':
        return 'bg-emerald-900/50 text-emerald-400';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Pre-Evaluation Risk Assessment</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {predictions.map((pred) => (
          <div
            key={pred.domain}
            className={`px-3 py-2 rounded-lg text-center ${getRiskColor(pred.risk_level)}`}
            title={pred.reason}
          >
            <p className="text-sm font-medium capitalize truncate">
              {pred.domain.replace('_', ' ')}
            </p>
            <p className="text-xs mt-1 opacity-80">{pred.risk_level}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ evaluationResult, onNewEvaluation }) {
  const [showDiagnostics, setShowDiagnostics] = useState(true);

  if (!evaluationResult) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-400 mb-2">No evaluation results yet</p>
          <p className="text-slate-500 text-sm">Run an evaluation to see the dashboard</p>
        </div>
      </div>
    );
  }

  const { base_scores, ft_scores, regression_report, diagnostics, at_risk_predictions } = evaluationResult;
  const domains = regression_report?.domain_results || [];
  const healthScore = regression_report?.health_score || 0;
  const healthStatus = regression_report?.health_status || 'Caution';

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Evaluation Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              {regression_report?.summary || 'Model comparison analysis'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onNewEvaluation}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Evaluation
            </button>
            <ExportButton reportData={evaluationResult} />
          </div>
        </div>

        <ModelInfo reportData={evaluationResult} />

        <RiskPredictionPanel predictions={at_risk_predictions} />

        <CapabilityHeatmap
          domains={domains}
          healthScore={healthScore}
          healthStatus={healthStatus}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ComparisonCharts domains={domains} />
          
          <div className={showDiagnostics ? '' : 'lg:col-span-2'}>
            {showDiagnostics && <DiagnosticReport diagnostics={diagnostics} />}
          </div>
        </div>

        {diagnostics && diagnostics.length > 0 && (
          <button
            onClick={() => setShowDiagnostics(!showDiagnostics)}
            className="mt-6 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </button>
        )}
      </div>
    </div>
  );
}
