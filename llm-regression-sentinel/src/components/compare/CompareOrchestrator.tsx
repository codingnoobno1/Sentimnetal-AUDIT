"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "@/src/lib/apiConfig";

import type { CompareTrialResult, CompareSession, MistralVerdict } from "./types";
import ModelPicker from "./ModelPicker";
import CompareDomainPicker from "./CompareDomainPicker";
import CompareHeader from "./CompareHeader";
import CompareScalePicker from "./CompareScalePicker";
import CompareProgress from "./CompareProgress";
import CompareError from "./CompareError";
import CompareEmptyState from "./CompareEmptyState";
import DualResponseCard from "./DualResponseCard";
import VerdictBanner from "./VerdictBanner";
import VerdictReasoning from "./VerdictReasoning";
import DimensionRadar from "./DimensionRadar";
import DimensionBars from "./DimensionBars";
import LatencyCompare from "./LatencyCompare";
import TrialIndexBadge from "./TrialIndexBadge";
import ExpectedAnswer from "./ExpectedAnswer";
import ScorePill from "./ScorePill";
import Scoreboard from "./Scoreboard";
import WinStreak from "./WinStreak";
import ScoreTrend from "./ScoreTrend";
import EvaluateButton from "./EvaluateButton";

const COLOR_A = "#2e3192";
const COLOR_B = "#ff4500";

export default function CompareOrchestrator() {
  const [modelA, setModelA] = useState("");
  const [modelB, setModelB] = useState("");
  const [domain, setDomain] = useState("all");
  const [scale, setScale] = useState(1);
  const [running, setRunning] = useState(false);
  const [evaluatingIdx, setEvaluatingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<CompareSession | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: "done" as "generating" | "evaluating" | "done" });
  const endRef = useRef<HTMLDivElement>(null);

  const labelA = modelA.split("/").pop() || "Model A";
  const labelB = modelB.split("/").pop() || "Model B";

  const runComparison = async () => {
    if (!modelA || !modelB) { setError("Select both models first"); return; }
    setRunning(true); setError(null);
    setProgress({ current: 0, total: scale, phase: "generating" });
    const newSession: CompareSession = { model_a_id: modelA, model_b_id: modelB, domain, trials: [] };
    setSession(newSession);

    try {
      const url = `${BACKEND_URL}/api/testing/compare-run?model_a_id=${encodeURIComponent(modelA)}&model_b_id=${encodeURIComponent(modelB)}&domain=${encodeURIComponent(domain)}&sample_count=${scale}`;
      const resp = await fetch(url, { method: "POST" });
      if (!resp.body) throw new Error("No stream");

      const reader = resp.body.getReader();
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
            const trial: CompareTrialResult = { prompt: chunk.prompt, model_a: chunk.model_a, model_b: chunk.model_b };
            setSession(prev => prev ? { ...prev, trials: [...prev.trials, trial] } : prev);
            setProgress(p => ({ ...p, current: p.current + 1 }));
          }
        }
      }
    } catch (err: any) { setError(`Compare Error: ${err.message}`); }
    finally { setRunning(false); setProgress(p => ({ ...p, phase: "done" })); }
  };

  const evaluateTrial = async (idx: number) => {
    if (!session) return;
    const trial = session.trials[idx];
    setEvaluatingIdx(idx);

    try {
      const url = `${BACKEND_URL}/api/testing/compare-evaluate?prompt=${encodeURIComponent(trial.prompt.prompt_text)}&expected_answer=${encodeURIComponent(trial.prompt.expected_answer || "")}&response_a=${encodeURIComponent(trial.model_a.response)}&response_b=${encodeURIComponent(trial.model_b.response)}&model_a_id=${encodeURIComponent(modelA)}&model_b_id=${encodeURIComponent(modelB)}`;
      const resp = await fetch(url, { method: "POST" });
      if (resp.ok) {
        const verdict: MistralVerdict = await resp.json();
        setSession(prev => {
          if (!prev) return prev;
          const newTrials = [...prev.trials];
          newTrials[idx] = { ...newTrials[idx], verdict };

          // Recalculate summary
          const evaluated = newTrials.filter(t => t.verdict);
          const summary = {
            model_a_wins: evaluated.filter(t => t.verdict!.winner === "model_a").length,
            model_b_wins: evaluated.filter(t => t.verdict!.winner === "model_b").length,
            ties: evaluated.filter(t => t.verdict!.winner === "tie").length,
            model_a_avg: evaluated.reduce((a, t) => a + t.verdict!.model_a_score, 0) / evaluated.length,
            model_b_avg: evaluated.reduce((a, t) => a + t.verdict!.model_b_score, 0) / evaluated.length,
          };
          return { ...prev, trials: newTrials, summary };
        });
      }
    } catch (err: any) { setError(`Evaluation failed: ${err.message}`); }
    finally { setEvaluatingIdx(null); }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8 font-sans bg-[#FAFAFA] min-h-screen selection:bg-orange-red/30">
      <CompareError error={error} onDismiss={() => setError(null)} />

      {/* Model Selection */}
      <div className="grid grid-cols-2 gap-6">
        <ModelPicker label="Model A — Challenger" color={COLOR_A} selectedId={modelA || null} onSelect={setModelA} />
        <ModelPicker label="Model B — Opponent" color={COLOR_B} selectedId={modelB || null} onSelect={setModelB} />
      </div>

      {/* Domain + Scale */}
      <CompareDomainPicker selected={domain} onSelect={setDomain} />

      <div className="flex items-center justify-between gap-4">
        <CompareScalePicker scale={scale} onScale={setScale} onRun={runComparison} running={running} disabled={!modelA || !modelB} />
      </div>

      {/* VS Header */}
      {modelA && modelB && <CompareHeader modelA={modelA} modelB={modelB} colorA={COLOR_A} colorB={COLOR_B} />}

      {/* Progress */}
      {running && <CompareProgress current={progress.current} total={progress.total} phase={progress.phase} />}

      {/* Scoreboard + Win Streak + Trend */}
      {session?.summary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Scoreboard session={session} colorA={COLOR_A} colorB={COLOR_B} />
          </div>
          <div className="space-y-6">
            <WinStreak trials={session.trials.filter(t => t.verdict).map(t => ({ winner: t.verdict!.winner }))} colorA={COLOR_A} colorB={COLOR_B} />
            <ScoreTrend session={session} colorA={COLOR_A} colorB={COLOR_B} />
          </div>
        </div>
      )}

      {/* Trials */}
      {session && session.trials.length > 0 ? (
        <div className="space-y-10">
          {session.trials.map((trial, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-zinc-100 shadow-sm p-8 space-y-6"
            >
              {/* Trial Header */}
              <div className="flex items-center justify-between">
                <TrialIndexBadge index={idx} domain={trial.prompt.domain} difficulty={trial.prompt.difficulty} />
                <div className="flex items-center gap-3">
                  {trial.verdict && <ScorePill scoreA={trial.verdict.model_a_score} scoreB={trial.verdict.model_b_score} colorA={COLOR_A} colorB={COLOR_B} />}
                  <EvaluateButton onClick={() => evaluateTrial(idx)} loading={evaluatingIdx === idx} />
                </div>
              </div>

              {/* Responses */}
              <DualResponseCard
                prompt={trial.prompt.prompt_text}
                responseA={trial.model_a.response}
                responseB={trial.model_b.response}
                modelALabel={labelA}
                modelBLabel={labelB}
                colorA={COLOR_A}
                colorB={COLOR_B}
              />

              <ExpectedAnswer expected={trial.prompt.expected_answer} />

              <LatencyCompare latA={trial.model_a.latency} latB={trial.model_b.latency} colorA={COLOR_A} colorB={COLOR_B} labelA={labelA} labelB={labelB} />

              {/* Verdict (if evaluated) */}
              {trial.verdict && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-zinc-100">
                  <VerdictBanner verdict={trial.verdict} modelALabel={labelA} modelBLabel={labelB} colorA={COLOR_A} colorB={COLOR_B} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DimensionRadar verdict={trial.verdict} colorA={COLOR_A} colorB={COLOR_B} labelA={labelA} labelB={labelB} />
                    <DimensionBars verdict={trial.verdict} colorA={COLOR_A} colorB={COLOR_B} labelA={labelA} labelB={labelB} />
                  </div>
                  <VerdictReasoning reasoning={trial.verdict.reasoning} />
                </motion.div>
              )}
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>
      ) : (
        !running && <CompareEmptyState />
      )}
    </div>
  );
}
