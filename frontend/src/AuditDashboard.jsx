import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Shield, Activity } from 'lucide-react';

const CATEGORY_LABELS = {
  product_reviews: 'Product Reviews',
  social_media: 'Social Media',
  customer_feedback: 'Customer Feedback',
  news_headlines: 'News Headlines',
  mixed_sentiment: 'Mixed Sentiment',
  sarcasm_detection: 'Sarcasm Detection',
};

const STATUS_COLORS = {
  IMPROVED: { bg: 'bg-emerald-50 border-emerald-200', border: 'border-emerald-200', badge: 'bg-emerald-500', text: 'text-emerald-700' },
  STABLE: { bg: 'bg-indigo-50 border-indigo-200', border: 'border-indigo-200', badge: 'bg-indigo-600', text: 'text-indigo-700' },
  DEGRADED: { bg: 'bg-orange-50 border-orange-200', border: 'border-orange-200', badge: 'bg-orange-600', text: 'text-orange-700' },
};

const HEALTH_CONFIG = {
  Excellent: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-emerald-600', textLight: 'text-emerald-900/60' },
  Good: { bg: 'bg-white', border: 'border-indigo-500', text: 'text-indigo-600', textLight: 'text-indigo-900/60' },
  Fair: { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-600', textLight: 'text-orange-900/60' },
  Poor: { bg: 'bg-white', border: 'border-red-500', text: 'text-red-600', textLight: 'text-red-900/60' },
};

function HealthBanner({ overallAccuracy, healthStatus }) {
  const config = HEALTH_CONFIG[healthStatus] || HEALTH_CONFIG.Fair;

  return (
    <div className={`mb-8 p-6 rounded-none ${config.bg} border border-charcoal/10 shadow-sm relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-red" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Overall Forensic Accuracy</p>
          <p className={`text-5xl font-bold text-charcoal tracking-tighter`}>{overallAccuracy}%</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Audit Status</p>
          <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest ${config.text} border ${config.border} bg-white shadow-sm`}>
            {healthStatus}
          </span>
        </div>
      </div>
      <div className="mt-6 font-mono text-[10px] text-zinc-300 flex justify-between">
        <span>0.00 SEC</span>
        <span>LATENCY: 42MS</span>
        <span>CONFIDENCE: HIGH</span>
      </div>
    </div>
  );
}

function CategoryCard({ category, isExpanded, onClick }) {
  const colors = STATUS_COLORS[category.status] || STATUS_COLORS.STABLE;
  const deltaDisplay = category.delta >= 0 ? `+${category.delta}` : `${category.delta}`;

  return (
    <div className="group">
      <button
        onClick={onClick}
        className={`w-full p-5 bg-white border border-charcoal/5 shadow-sm transition-all duration-300 hover:border-orange-red/30 hover:shadow-md text-left relative overflow-hidden`}
      >
        <div className={`absolute top-0 right-0 w-16 h-16 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]`}>
           <Activity className="w-full h-full" />
        </div>
        
        <div className="flex justify-between items-start mb-5">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal">
            {CATEGORY_LABELS[category.category] || category.category}
          </h3>
          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-white ${colors.badge}`}>
            {category.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Base</p>
            <p className="text-xl font-bold text-charcoal tabular-nums">{category.base_accuracy}%</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Audit</p>
            <p className="text-xl font-bold text-indigo-blue tabular-nums">{category.ft_accuracy}%</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Delta</p>
            <p className={`text-xl font-bold tabular-nums ${category.delta >= 0 ? 'text-emerald-600' : 'text-orange-red'}`}>
              {deltaDisplay}%
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-charcoal/[0.03] flex justify-between items-center">
          <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">Forensic Detail</span>
          <div className={`w-2 h-2 rounded-full ${category.delta >= 0 ? 'bg-emerald-500' : 'bg-orange-red'} animate-pulse`} />
        </div>
      </button>

      {isExpanded && (
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Accuracy Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Base Model Accuracy</span>
              <span className="text-white font-medium">{category.base_accuracy}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Fine-Tuned Accuracy</span>
              <span className="text-white font-medium">{category.ft_accuracy}%</span>
            </div>
            <div className="h-px bg-slate-700 my-2"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Change</span>
              <span className={`font-semibold ${category.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {deltaDisplay}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SentimentChart({ categories }) {
  const chartData = categories.map((cat) => ({
    name: cat.category,
    displayName: CATEGORY_LABELS[cat.category] || cat.category,
    base_accuracy: cat.base_accuracy,
    ft_accuracy: cat.ft_accuracy,
  }));

  function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-charcoal/10 p-3 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal mb-2 border-b border-charcoal/5 pb-1">
            {CATEGORY_LABELS[label] || label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-4 text-[11px] font-bold">
              <span className="text-zinc-400 uppercase tracking-tighter">{entry.name}</span>
              <span style={{ color: entry.color }}>{entry.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-white border border-charcoal/5 p-8 shadow-sm">
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal mb-8 inline-block border-b-2 border-orange-red pb-1">
        Comparative Forensics
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayName" 
            tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 700 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f8f8' }} />
          <Bar dataKey="base_accuracy" name="Base Line" fill="#1c1c21" radius={[0, 0, 0, 0]} barSize={24} />
          <Bar dataKey="ft_accuracy" name="Audit Result" fill="#ff4500" radius={[0, 0, 0, 0]} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DiagnosticCard({ diagnostic }) {
  return (
    <div className="bg-white border border-charcoal/5 p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-red" />
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal">
          {CATEGORY_LABELS[diagnostic.category] || diagnostic.category}
        </h4>
        <span className="px-2 py-0.5 bg-orange-50 text-orange-red text-[9px] font-black uppercase tracking-widest border border-orange-red/20">
          DEGRADATION DETECTED
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="text-[9px] font-black text-orange-red mb-2 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-orange-red rounded-full" /> Root Cause
          </h5>
          <p className="text-charcoal text-[13px] leading-relaxed font-medium">{diagnostic.root_cause}</p>
        </div>

        <div>
          <h5 className="text-[9px] font-black text-indigo-blue mb-2 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1 h-1 bg-indigo-blue rounded-full" /> Impact Analysis
          </h5>
          <p className="text-zinc-500 text-[12px] leading-relaxed">{diagnostic.training_impact}</p>
        </div>

        <div className="pt-4 border-t border-charcoal/[0.03]">
          <h5 className="text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1 h-1 bg-emerald-600 rounded-full" /> Recommendation
          </h5>
          <p className="text-zinc-600 text-[12px] leading-relaxed font-medium bg-emerald-50/50 p-3 italic">
            "{diagnostic.improvement_recommendation}"
          </p>
        </div>
      </div>
    </div>
  );
}

function DiagnosticsPanel({ diagnostics }) {
  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="bg-white border border-charcoal/5 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6 border border-emerald-100">
          <Shield className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-2">Integrity Verified</p>
        <p className="text-zinc-400 text-[11px] font-medium max-w-[200px] mx-auto">No regression or degradation patterns identified in this audit cycle.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal inline-block border-b-2 border-orange-red pb-1">
          Forensic Findings
        </h3>
        <span className="text-[10px] font-bold text-orange-red uppercase tracking-widest">
          {diagnostics.length} ANOMALIES DETECTED
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {diagnostics.map((diagnostic) => (
          <DiagnosticCard key={diagnostic.category} diagnostic={diagnostic} />
        ))}
      </div>
    </div>
  );
}

function ExportButton({ reportData }) {
  const handleExport = () => {
    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentiment-audit-${new Date().toISOString().split('T')[0]}.json`;
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
            {reportData.dataset_description?.length > 40
              ? reportData.dataset_description.substring(0, 40) + '...'
              : reportData.dataset_description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuditDashboard({ auditResult, onNewAudit }) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  if (!auditResult) {
    return (
      <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center p-6">
        <div className="text-center">
          <Shield className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Audit System Offline</p>
          <p className="text-zinc-300 text-[11px] font-medium">Initialize model parameters to begin forensic analysis.</p>
        </div>
      </div>
    );
  }

  const { base_accuracy, ft_accuracy, sentiment_report, diagnostics } = auditResult;
  const categories = sentiment_report?.category_results || [];
  const overallAccuracy = sentiment_report?.overall_accuracy || 0;
  const healthStatus = sentiment_report?.health_status || 'Fair';

  return (
    <div className="min-h-screen bg-[#fbfbfb] p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-charcoal/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-1.5 bg-indigo-blue rounded-sm">
                 <Activity className="w-4 h-4 text-white" />
               </div>
               <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400">Regression Sentinel System</span>
            </div>
            <h1 className="text-4xl font-bold text-charcoal tracking-tighter mb-2">Forensic <span className="text-orange-red italic font-light">Audit</span></h1>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-xl">
              {sentiment_report?.summary || 'Automated accuracy quantification and regression detection for enterprise-grade NLP models.'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onNewAudit}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#2e3192] border border-[#2e3192]/20 hover:bg-[#2e3192]/5 transition-all"
            >
              New Audit Cycle
            </button>
            <ExportButton reportData={auditResult} />
          </div>
        </div>

        <ModelInfo reportData={auditResult} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
             <HealthBanner overallAccuracy={overallAccuracy} healthStatus={healthStatus} />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.category}
                  category={category}
                  isExpanded={expandedCategory === category.category}
                  onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                />
              ))}
            </div>

            <SentimentChart categories={categories} />
          </div>

          <div className="lg:col-span-4">
            <DiagnosticsPanel diagnostics={diagnostics} />
          </div>
        </div>
        
        <div className="mt-12 flex justify-between items-center text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em] border-t border-charcoal/5 pt-8">
          <span>Institutional Grade Auditing</span>
          <div className="flex gap-6">
            <span>SECURE_NODE: v4.2.0</span>
            <span>TOKEN: SENTINEL-AUDIT-ALPHA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
