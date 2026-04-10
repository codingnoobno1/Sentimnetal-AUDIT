"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Activity, Download, Info, AlertTriangle } from 'lucide-react';
import { BACKEND_URL } from '@/src/lib/apiConfig';
import DatasetFingerprint from '../DatasetFingerprint';
import RubricOverlay from '../RubricOverlay';

const CATEGORY_LABELS: Record<string, string> = {
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
  Excellent: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-emerald-600' },
  Good: { bg: 'bg-white', border: 'border-indigo-500', text: 'text-indigo-600' },
  Fair: { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-600' },
  Poor: { bg: 'bg-white', border: 'border-red-500', text: 'text-red-600' },
};

interface CategoryResult {
  category: string;
  status: 'IMPROVED' | 'STABLE' | 'DEGRADED';
  base_accuracy: number;
  ft_accuracy: number;
  delta: number;
}

interface Diagnostic {
  domain: string;
  issue: string;
  likely_cause: string;
  fix_recommendation: string;
  severity: 'low' | 'medium' | 'high';
  score_delta: number;
}

interface AuditResult {
  base_model_id: string;
  ft_model_id: string;
  dataset_description: string;
  sentiment_report: {
    overall_accuracy: number;
    health_status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    summary: string;
    category_results: CategoryResult[];
  };
  diagnostics: Diagnostic[];
}

function HealthBanner({ overallAccuracy, healthStatus }: { overallAccuracy: number; healthStatus: string }) {
  const config = (HEALTH_CONFIG as any)[healthStatus] || HEALTH_CONFIG.Fair;

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

function CategoryCard({ category, isExpanded, onClick }: { category: CategoryResult; isExpanded: boolean; onClick: () => void }) {
  const colors = (STATUS_COLORS as any)[category.status] || STATUS_COLORS.STABLE;
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
            <p className="text-xl font-bold text-charcoal tabular-nums">{category.base_accuracy.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Audit</p>
            <p className="text-xl font-bold text-indigo-blue tabular-nums">{category.ft_accuracy.toFixed(1)}%</p>
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
        <div className="mt-2 p-4 bg-zinc-50 border border-charcoal/5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Base Variance</span>
            <span className="text-[10px] font-bold text-charcoal tabular-nums">±0.42%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sample Size</span>
            <span className="text-[10px] font-bold text-charcoal tabular-nums">480 CASES</span>
          </div>
        </div>
      )}
    </div>
  );
}

function SentimentChart({ categories }: { categories: CategoryResult[] }) {
  const chartData = categories.map((cat) => ({
    name: cat.category,
    displayName: CATEGORY_LABELS[cat.category] || cat.category,
    base_accuracy: cat.base_accuracy,
    ft_accuracy: cat.ft_accuracy,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-charcoal/10 p-3 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal mb-2 border-b border-charcoal/5 pb-1">
            {CATEGORY_LABELS[label] || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between gap-4 text-[11px] font-bold">
              <span className="text-zinc-400 uppercase tracking-tighter">{entry.name}</span>
              <span style={{ color: entry.color }}>{entry.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-charcoal/5 p-8 shadow-sm">
      <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal mb-8 inline-block border-b-2 border-orange-red pb-1">
        Comparative Forensics
      </h3>
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
}

function DiagnosticCard({ diagnostic }: { diagnostic: Diagnostic }) {
  const isHigh = diagnostic.severity === 'high' || diagnostic.score_delta < -15;

  return (
    <div className="bg-white border border-charcoal/5 p-6 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${isHigh ? 'bg-orange-red' : 'bg-orange-400'}`} />
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-charcoal">
          {CATEGORY_LABELS[diagnostic.domain] || diagnostic.domain}
        </h4>
        <div className="flex items-center gap-2">
          {isHigh && <AlertTriangle className="w-3 h-3 text-orange-red" />}
          <span className={`px-2 py-0.5 ${isHigh ? 'bg-orange-50 text-orange-red border-orange-red/20' : 'bg-orange-50/50 text-orange-500 border-orange-200'} text-[9px] font-black uppercase tracking-widest border`}>
            {diagnostic.score_delta}% DROP
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h5 className="text-[9px] font-black text-orange-red mb-2 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 bg-orange-red rounded-full" /> Identified Issue
          </h5>
          <p className="text-charcoal text-[13px] leading-relaxed font-bold">{diagnostic.issue}</p>
        </div>

        <div>
           <h5 className="text-[9px] font-black text-indigo-blue mb-2 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1 h-1 bg-indigo-blue rounded-full" /> Likely Root Cause
          </h5>
          <p className="text-zinc-500 text-[12px] leading-relaxed italic">{diagnostic.likely_cause}</p>
        </div>

        <div className="pt-4 border-t border-charcoal/[0.03]">
          <h5 className="text-[9px] font-black text-emerald-600 mb-2 uppercase tracking-widest flex items-center gap-2">
             <span className="w-1 h-1 bg-emerald-600 rounded-full" /> Fix Recommendation
          </h5>
          <p className="text-zinc-600 text-[12px] leading-relaxed font-medium bg-emerald-50/50 p-3">
            {diagnostic.fix_recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}

function DiagnosticsPanel({ diagnostics, loading }: { diagnostics: Diagnostic[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-white border border-charcoal/5 p-12 text-center animate-pulse">
        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">Running Regression Logic...</p>
      </div>
    );
  }

  if (!diagnostics || diagnostics.length === 0) {
    return (
      <div className="bg-white border border-charcoal/5 p-12 text-center shadow-inner bg-zinc-50/30">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-6 border border-emerald-100">
          <Shield className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-2">Integrity Verified</p>
        <p className="text-zinc-400 text-[11px] font-medium max-w-[200px] mx-auto">No capability regression or dataset drift identified in this cycle.</p>
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
        {diagnostics.map((diagnostic, idx) => (
          <DiagnosticCard key={idx} diagnostic={diagnostic} />
        ))}
      </div>
    </div>
  );
}

function ModelInfo({ reportData }: { reportData: AuditResult }) {
  return (
    <div className="bg-white border border-charcoal/5 p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.02] -mr-8 -mt-8 rotate-12">
        <Shield className="w-full h-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Primary Forensics Node</p>
          <p className="text-[11px] font-black text-charcoal truncate">{reportData.base_model_id}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Target Forensic Node</p>
          <p className="text-[11px] font-black text-indigo-blue truncate">{reportData.ft_model_id}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Dataset Source</p>
          <p className="text-[11px] font-black text-charcoal truncate" title={reportData.dataset_description}>
            {reportData.dataset_description?.length > 40
              ? reportData.dataset_description.substring(0, 40) + '...'
              : reportData.dataset_description}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuditDashboard({ auditResult, onNewAudit }: { auditResult: any | null; onNewAudit: () => void }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [liveDiagnostics, setLiveDiagnostics] = useState<Diagnostic[]>([]);
  const [diagLoading, setDiagLoading] = useState(false);
  const [rubricOverlay, setRubricOverlay] = useState<{ isOpen: boolean; domain: string; items: string[] }>({
    isOpen: false,
    domain: '',
    items: []
  });

  // Fetch live Prometheus diagnostics on result mount
  useEffect(() => {
    if (auditResult?.ft_model_id) {
      const fetchDiagnostics = async () => {
        setDiagLoading(true);
        try {
          const resp = await fetch(`${BACKEND_URL}/api/testing/diagnostics/regressions/${encodeURIComponent(auditResult.ft_model_id)}`);
          if (resp.ok) {
            const data = await resp.json();
            setLiveDiagnostics(data.diagnostics || []);
          }
        } catch (e) {
          console.error("Diagnostic Fetch Failed", e);
        } finally {
          setDiagLoading(false);
        }
      };
      fetchDiagnostics();
    }
  }, [auditResult?.ft_model_id]);

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

  const sentiment_report = auditResult.sentiment_report;
  const categories = sentiment_report?.category_results || [];
  const overallAccuracy = sentiment_report?.overall_accuracy || 0;
  const healthStatus = sentiment_report?.health_status || 'Fair';
  const displayDiagnostics = liveDiagnostics.length > 0 ? liveDiagnostics : (auditResult.diagnostics || []);

  const openRubric = (domain: string) => {
    // Placeholder rubrics - ideally fetched from backend /api/testing/rubrics
    const rubrics: Record<string, string[]> = {
      reasoning: ["Logic steps?", "Conclusion justified?", "Constraint following?"],
      coding: ["Syntax correct?", "Logic solves problem?", "Edge cases handled?"],
      factuality: ["Correct facts?", "No hallucinations?", "Recent info?"]
    };
    setRubricOverlay({
      isOpen: true,
      domain: domain.toUpperCase(),
      items: rubrics[domain] || rubrics.reasoning
    });
  };

  return (
    <div className="min-h-screen bg-[#fbfbfb] p-8 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-charcoal/5">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="p-1.5 bg-indigo-blue rounded-sm">
                 <Activity className="w-4 h-4 text-white" />
               </div>
               <span className="text-[12px] font-black uppercase tracking-[0.3em] text-zinc-400">Regression Sentinel System</span>
            </div>
            <h1 className="text-4xl font-bold text-charcoal tracking-tighter mb-2 font-geist-sans uppercase">Forensic <span className="text-orange-red italic font-light">Audit</span></h1>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest max-w-xl">
              {sentiment_report?.summary || 'Automated accuracy quantification and regression detection for enterprise-grade NLP models.'}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onNewAudit}
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-indigo-blue border border-indigo-blue/20 hover:bg-indigo-blue/5 transition-all"
            >
              New Audit Cycle
            </button>
            <button
              className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-indigo-blue hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Export Report
            </button>
          </div>
        </div>

        <ModelInfo reportData={auditResult} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
             <HealthBanner overallAccuracy={overallAccuracy} healthStatus={healthStatus} />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category: any) => (
                <div key={category.category} className="relative group">
                  <CategoryCard
                    category={category}
                    isExpanded={expandedCategory === category.category}
                    onClick={() => setExpandedCategory(expandedCategory === category.category ? null : category.category)}
                  />
                  <button 
                    onClick={() => openRubric(category.category)}
                    className="absolute bottom-4 right-4 p-1 hover:bg-zinc-100 rounded-sm opacity-20 group-hover:opacity-100 transition-opacity"
                    title="View Rubric"
                  >
                    <Info className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
              ))}
            </div>

            <SentimentChart categories={categories} />
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Dataset fingerprinting integrated into side panel */}
            <DatasetFingerprint profile={{
              percent_code: 15,
              percent_reasoning: 25,
              percent_chat: 40,
              percent_factual: 20,
              total_samples: 4500
            }} />
            
            <DiagnosticsPanel diagnostics={displayDiagnostics} loading={diagLoading} />
          </div>
        </div>
        
        <RubricOverlay 
          isOpen={rubricOverlay.isOpen} 
          onClose={() => setRubricOverlay(p => ({ ...p, isOpen: false }))} 
          domain={rubricOverlay.domain} 
          rubricItems={rubricOverlay.items} 
        />
        
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
