"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Maximize2, Brain, Layers, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "@/src/lib/apiConfig";

// --- Component Imports (20+ modular components) ---
import type { TestResult } from "./types";
import { HfModel } from "@/src/models";
import SearchBar from "./SearchBar";
import PresetDropdown from "./PresetDropdown";
import ModelCard from "./ModelCard";
import ModelHeader from "./ModelHeader";
import ScaleSelector from "./ScaleSelector";
import ForensicPieChart from "./ForensicPieChart";
import ForensicBarChart from "./ForensicBarChart";
import ForensicRadar from "./ForensicRadar";
import ExpertiseBarChart from "./ExpertiseBarChart";
import EvidenceTrace from "./EvidenceTrace";
import TechnicalAdvisor from "./TechnicalAdvisor";
import PromptResponsePair from "./PromptResponsePair";
import TrialHeader from "./TrialHeader";
import MetricsSummaryBar from "./MetricsSummaryBar";
import ScoreBadge from "./ScoreBadge";
import StatusPill from "./StatusPill";
import LoadingOverlay from "./LoadingOverlay";
import ErrorBanner from "./ErrorBanner";
import ParameterGauges from "./ParameterGauges";
import FullscreenWrapper from "./FullscreenWrapper";
import TestMetricsPanel from "./TestMetricsPanel";
import DomainSelector from "./DomainSelector";
import ForensicIntelligenceGrid from "./ForensicIntelligenceGrid";

// --- Main Orchestrator Component ---
export default function ModelSelector() {
  const [query, setQuery] = useState("");
  const [models, setModels] = useState<HfModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<HfModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [localModels, setLocalModels] = useState<string[]>([]);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showTest, setShowTest] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [testScale, setTestScale] = useState(1);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedRecords, setSavedRecords] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [fullscreenTab, setFullscreenTab] = useState<"analytics" | "logs">("analytics");
  const trailEndRef = useRef<HTMLDivElement>(null);

  // --- Fetch callbacks ---
  const fetchLocalModels = useCallback(async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/models/local`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      if (r.ok) { const d = await r.json(); setLocalModels(d.local_models || []); }
    } catch { console.error("Local models fetch error"); }
  }, []);

  const fetchIntegrity = useCallback(async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/testing/integrity`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      if (r.ok) { const d = await r.json(); setSavedRecords(d.total_forensic_audits || 0); }
    } catch { console.error("Integrity check failed"); }
  }, []);

  const searchModels = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/hf/search?query=${encodeURIComponent(q)}&limit=9`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      setModels(await r.json());
    } catch { console.error("Search failed"); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    fetchLocalModels(); fetchIntegrity(); searchModels("Llama");
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, [fetchLocalModels, fetchIntegrity, searchModels]);

  const fetchAuditHistory = useCallback(async (modelId: string) => {
    setIsSyncing(true);
    try {
      const r = await fetch(`${BACKEND_URL}/api/testing/history/${encodeURIComponent(modelId)}`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      if (r.ok) {
        const history = await r.json();
        if (history?.length > 0) {
          setTestResult({
            model_id: modelId, sample_count: history.length,
            metrics: { accuracy: 0, avg_latency_ms: 0, total_duration_s: 0, throughput_qps: 0, success_rate: 100 },
            trials: history.map((t: any) => ({
              ...t,
              forensic_eval: t.forensic_trace || t.forensic_eval, // Support both Python and Express judge keys
              specialized_expertise: t.specialized_expertise || t.forensic_eval?.specialized_expertise,
              technical_tips: t.technical_tips || t.forensic_eval?.technical_tips,
            })),
          });
          setSavedRecords(history.length);
          setShowTest(true);
        } else {
          setSavedRecords(0);
        }
      }
    } catch { console.error("History sync failed"); } finally { setIsSyncing(false); }
  }, []);

  const fetchDownloadProgress = useCallback(async (modelId: string) => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/models/progress/${encodeURIComponent(modelId)}`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      if (r.ok) {
        const d = await r.json();
        setDownloadProgress(d.progress || 0);
        if (d.progress >= 100) { setIsDownloading(false); if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); fetchLocalModels(); }
      }
    } catch { console.error("Polling error"); }
  }, [fetchLocalModels]);

  const selectModelById = async (modelId: string) => {
    setShowDropdown(false); setIsLoading(true); setError(null);
    try {
      const r = await fetch(`${BACKEND_URL}/api/hf/model/${encodeURIComponent(modelId)}`, { headers: { "ngrok-skip-browser-warning": "69420" } });
      if (!r.ok) throw new Error("Failed to fetch model details");
      const d = await r.json();
      const model: HfModel = { id: d.id || d.modelId, author: d.author, downloads: d.downloads || 0, likes: d.likes || 0, lastModified: d.lastModified, tags: d.tags || [], pipeline_tag: d.pipeline_tag, isPrivate: d.private || false };
      setSelectedModel(model); setModels([]); setQuery(""); setShowTest(false); setTestResult(null);
      fetchAuditHistory(model.id); fetchIntegrity();
    } catch (err: any) { setError(`Model Initialization Failure: ${err.message}`); } finally { setIsLoading(false); }
  };

  const handleDownload = async (modelId: string) => {
    setIsDownloading(true); setDownloadProgress(0); setError(null);
    try {
      await fetch(`${BACKEND_URL}/api/models/download?model_id=${encodeURIComponent(modelId)}`, { method: "POST" });
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => fetchDownloadProgress(modelId), 2000);
    } catch { setIsDownloading(false); }
  };

  const runGeminiAudit = async (trialId: string, prompt: string, response: string, status: string, expectedAnswer?: string) => {
    if (!selectedModel) return;
    try {
      const url = `${BACKEND_URL}/api/audit/evaluate`;
      const r = await fetch(url, { 
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420" 
        },
        body: JSON.stringify({
          input: prompt,
          output: response,
          result: status === "success",
          model_id: selectedModel.id
        })
      });
      
      if (!r.ok) {
        const err = await r.json();
        setError(err.detail || "Forensic Audit failed");
      }
      
      // Mongo-First Sync: Always re-fetch from database to ensure truth
      await fetchAuditHistory(selectedModel.id);
      await fetchIntegrity();
      
    } catch { 
      console.error("Gemini Audit failed");
      setError("Connectivity failure during audit. Check if the Judge node is online.");
    }
  };

  const runScalabilityTest = async () => {
    if (!selectedModel) return;
    setIsTesting(true); setIsFullscreen(true);
    setTestResult({ model_id: selectedModel.id, sample_count: testScale, metrics: { accuracy: 0, avg_latency_ms: 0, total_duration_s: 0, throughput_qps: 0, success_rate: 0 }, trials: [] });
    try {
      const response = await fetch(`${BACKEND_URL}/api/testing/scalability?model_id=${encodeURIComponent(selectedModel.id)}&sample_count=${testScale}&domain=${encodeURIComponent(selectedDomain)}`, { method: "POST" });
      if (!response.body) throw new Error("No stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line);
          if (chunk.type === "trial") {
            setTestResult((prev) => prev ? { ...prev, trials: [...prev.trials, chunk.data] } : prev);
          }
        }
      }
    } catch (err: any) { setError(`Stream Error: ${err.message}`); } finally { setIsTesting(false); }
  };

  useEffect(() => { trailEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [testResult?.trials]);

  // --- Render: Lab Content (shared between normal and fullscreen) ---
  const labContent = (
    <div className="space-y-10">
      {/* Controls Bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-6 flex-wrap gap-4">
        <div className="space-y-1.5">
          <h3 className="text-lg font-black uppercase tracking-[0.3em] text-charcoal">Forensic Capability Matrix</h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-blue rounded-full animate-pulse" />
            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest italic">Generate, then run Gemini Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={() => selectedModel && fetchAuditHistory(selectedModel.id)} 
            className={`h-10 px-4 border border-zinc-200 text-zinc-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-50 transition-all ${isSyncing ? "opacity-50" : ""}`}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} /> Sync Mongo
          </button>
          <ScaleSelector scale={testScale} onScaleChange={setTestScale} onRun={runScalabilityTest} isTesting={isTesting} />
          {!isFullscreen && (
            <button onClick={() => setIsFullscreen(true)} className="h-10 px-4 bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all">
              <Maximize2 className="w-3 h-3" /> Expand
            </button>
          )}
        </div>
      </div>

      {/* Domain Selector */}
      <DomainSelector selectedDomain={selectedDomain} onSelect={setSelectedDomain} />

      {/* Metrics Summary */}
      {testResult && testResult.trials.length > 0 && (
        <TestMetricsPanel metrics={testResult.metrics} trialCount={testResult.trials.length} />
      )}

      {/* Trials */}
      <div className="space-y-12">
        {testResult?.trials.map((trial, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="bg-white border border-zinc-100 shadow-sm p-8 space-y-8"
          >
            <TrialHeader index={idx} promptId={trial.prompt_id} latency={trial.latency} onAudit={() => runGeminiAudit(trial.prompt_id, trial.prompt_text, trial.response, trial.status, trial.expected_answer)} />
            <PromptResponsePair prompt={trial.prompt_text} response={trial.response} expectedAnswer={trial.expected_answer} />

            {/* Forensic Analysis Section */}
            {trial.forensic_eval && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-6 border-t border-zinc-100">
                {/* Quick Summary */}
                <MetricsSummaryBar trace={trial.forensic_eval} />

                {/* Visual Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Charts */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <ForensicPieChart trace={trial.forensic_eval} />
                      <ForensicRadar trace={trial.forensic_eval} />
                    </div>
                    <ForensicBarChart trace={trial.forensic_eval} />
                    {trial.specialized_expertise && (
                      <ExpertiseBarChart expertise={trial.specialized_expertise} />
                    )}
                  </div>

                  {/* Right Column: Evidence + Advisor */}
                  <div className="lg:col-span-7 space-y-6">
                    <EvidenceTrace trace={trial.forensic_eval} />
                    <ParameterGauges trace={trial.forensic_eval} />
                    {trial.technical_tips && (
                      <TechnicalAdvisor tips={trial.technical_tips} />
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
        <div ref={trailEndRef} />
      </div>
    </div>
  );

  // --- Render: Main ---
  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-10 font-sans selection:bg-orange-red/30 bg-[#FAFAFA] min-h-screen">
      <LoadingOverlay isVisible={isLoading && !selectedModel} message="Initializing Model..." />
      <ErrorBanner error={error} onDismiss={() => setError(null)} />

      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4">
        <SearchBar query={query} onChange={setQuery} onSearch={() => searchModels(query)} />
        <PresetDropdown isOpen={showDropdown} toggle={() => setShowDropdown(!showDropdown)} onSelect={selectModelById} localModels={localModels} />
      </div>

      {/* Selected Model */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <ModelHeader
              model={selectedModel}
              isLocal={localModels.includes(selectedModel.id)}
              isDownloading={isDownloading}
              downloadProgress={downloadProgress}
              isSyncing={isSyncing}
              savedRecords={savedRecords}
              onSyncTrace={() => fetchAuditHistory(selectedModel.id)}
              onToggleLab={() => setShowTest(!showTest)}
              onDownload={() => handleDownload(selectedModel.id)}
            />

            <AnimatePresence>
              {showTest && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                  <FullscreenWrapper
                    isFullscreen={isFullscreen}
                    onClose={() => setIsFullscreen(false)}
                    title={selectedModel.id.split("/").pop()}
                  >
                    {isFullscreen ? (
                      <div className="space-y-12">
                        {/* Fullscreen Tabs */}
                        <div className="flex items-center gap-1 border-b border-zinc-100 mb-8">
                          {[
                            { id: "analytics", label: "Intelligence Dashboard", icon: Brain },
                            { id: "logs", label: "Raw Forensic Logs", icon: Layers }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setFullscreenTab(tab.id as any)}
                              className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border-b-2 ${
                                fullscreenTab === tab.id 
                                  ? "border-indigo-blue text-charcoal bg-indigo-blue/5" 
                                  : "border-transparent text-zinc-400 hover:text-zinc-600"
                              }`}
                            >
                              <tab.icon className="w-3 h-3" />
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        {fullscreenTab === "analytics" ? (
                          <ForensicIntelligenceGrid modelId={selectedModel.id} />
                        ) : (
                          labContent
                        )}
                      </div>
                    ) : (
                      labContent
                    )}
                  </FullscreenWrapper>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-zinc-100">
        <AnimatePresence>
          {models.length > 0
            ? models.map((m) => (
                <ModelCard key={m.id} model={m} onClick={() => selectModelById(m.id)} isLocal={localModels.includes(m.id)} />
              ))
            : isLoading && (
                <div className="col-span-3 flex justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-blue" />
                </div>
              )}
        </AnimatePresence>
      </div>
    </div>
  );
}
