"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { Activity, Clock, Database, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '@/src/lib/apiConfig';

interface TrainingMetric {
  step: number;
  loss: number;
}

interface Job {
  job_id: string;
  model_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: {
    epochs: number;
    learning_rate: number;
  };
  start_time: string;
}

export default function TrainingDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [metrics, setMetrics] = useState<TrainingMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/finetune/jobs`);
      if (r.ok) setJobs(await r.json());
    } catch (e) { console.error("Job fetch error", e); }
  };

  const fetchMetrics = async (jobId: string) => {
    try {
      const r = await fetch(`${BACKEND_URL}/api/finetune/metrics/${jobId}`);
      if (r.ok) setMetrics(await r.json());
    } catch (e) { console.error("Metrics fetch error", e); }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJob?.status === 'running') {
      const interval = setInterval(() => fetchMetrics(selectedJob.job_id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedJob]);

  return (
    <div className="space-y-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Jobs Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 border-b border-charcoal/5 pb-4">
             <Activity className="w-5 h-5 text-indigo-blue" />
             <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-charcoal">Fine-Tune History</h3>
          </div>
          
          <div className="space-y-3">
            {jobs.map((job) => (
              <button
                key={job.job_id}
                onClick={() => { setSelectedJob(job); fetchMetrics(job.job_id); }}
                className={`w-full p-6 text-left border transition-all ${selectedJob?.job_id === job.job_id ? 'border-orange-red bg-zinc-50' : 'border-charcoal/5 bg-white hover:bg-zinc-50'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{job.status}</span>
                  <div className={`w-2 h-2 rounded-full ${job.status === 'running' ? 'bg-orange-red animate-pulse' : job.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                </div>
                <p className="text-xs font-black text-charcoal truncate mb-1">{job.model_id}</p>
                <p className="text-[9px] font-bold text-zinc-400 font-mono uppercase tracking-tighter">{job.job_id}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Main */}
        <div className="lg:col-span-8 bg-white border border-charcoal/5 p-10 shadow-sm relative overflow-hidden">
          {selectedJob ? (
            <div className="space-y-10">
              <div className="flex items-start justify-between">
                <div>
                   <h2 className="text-3xl font-black text-charcoal tracking-tighter uppercase mb-2">Training <span className="text-orange-red">Analytics</span></h2>
                   <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Job Node: {selectedJob.job_id} | Device: Local CPU (PEFT/LoRA)</p>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-center">
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Learning Rate</p>
                     <p className="text-sm font-black text-charcoal tabular-nums">{selectedJob.config.learning_rate.toExponential(1)}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Epochs</p>
                     <p className="text-sm font-black text-charcoal tabular-nums">{selectedJob.config.epochs}</p>
                   </div>
                </div>
              </div>

              {/* Loss Curve */}
              <div className="h-[300px] w-full border-b border-charcoal/5 pb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics}>
                    <defs>
                      <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4500" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ff4500" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="step" 
                      tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 700 }} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #eee', fontSize: '10px', fontWeight: 'bold' }} 
                      cursor={{ stroke: '#ff4500', strokeWidth: 1 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="loss" 
                      stroke="#ff4500" 
                      fillOpacity={1} 
                      fill="url(#colorLoss)" 
                      strokeWidth={3}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Training Logs Placeholder */}
              <div className="bg-charcoal text-white p-6 rounded-none font-mono text-[10px] border border-white/10 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Loader2 className={`w-8 h-8 ${selectedJob.status === 'running' ? 'animate-spin' : ''}`} />
                </div>
                <p className="text-orange-red font-black mb-4 uppercase tracking-[0.2em]">{">"} TRAINING_LOG_FEED</p>
                <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar">
                  <p className="opacity-40 italic">[SYSTEM] Initializing weight tensors on local CPU...</p>
                  <p className="opacity-70">[INFO] LoRA Rank (8) Alpha (16) targets injected successfully.</p>
                  {metrics.map((m, i) => (
                    <p key={i} className="text-emerald-400">
                      [STEP {m.step}] Loss {m.loss.toFixed(6)} | delta_t: 0.82s
                    </p>
                  ))}
                  {selectedJob.status === 'running' && (
                    <p className="animate-pulse">_</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-charcoal/5 flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Awaiting Job Selection</p>
              <p className="text-zinc-200 text-xs font-medium max-w-[200px] mx-auto mt-2">Select a fine-tune job from the history to inspect specialized analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
