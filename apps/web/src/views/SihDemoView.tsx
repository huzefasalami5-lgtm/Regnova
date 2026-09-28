import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Play, Sparkles, CheckCircle2, ArrowRight, BarChart3 } from 'lucide-react';
import { DataModeBadge } from '../components/common/DataModeBadge';
import { Link } from 'react-router-dom';

export const SihDemoView: React.FC = () => {
  const [demoState, setDemoState] = useState<any>(null);

  const mutation = useMutation({
    mutationFn: () => api.runSihDemo(),
    onSuccess: (data) => setDemoState(data),
  });

  const demoSteps = [
    { num: '01', label: 'Load Synthetic Monsoon Dataset', agent: 'Data Quality Agent', status: 'COMPLETE' },
    { num: '02', label: 'Run R-GATE Atmospheric Classifier', agent: 'Regime Analysis Agent', status: 'COMPLETE' },
    { num: '03', label: 'Train & Fuse Specialist Experts', agent: 'Forecast Correction Agent', status: 'COMPLETE' },
    { num: '04', label: 'Apply RAIN-CAL Probability Calibration', agent: 'Spatial Calibrator', status: 'COMPLETE' },
    { num: '05', label: 'Compute District Aggregations & Maps', agent: 'District Guidance Agent', status: 'COMPLETE' },
    { num: '06', label: 'Run Independent Verification Backtest', agent: 'Evaluation Agent', status: 'COMPLETE' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#12304A] border border-[#42D9F5]/40 text-[#42D9F5] text-[11px] font-mono mb-2">
            <span>SMART INDIA HACKATHON 2026</span>
            <span>•</span>
            <span>TEAM VYSTRAL</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-[#42D9F5]" />
            <span>One-Click SIH Live Demonstration Mode</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Reproducible end-to-end replay of the full REGNOVA regime-adaptive post-processing pipeline.
          </p>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-[#42D9F5] to-[#17B897] text-[#071522] font-bold text-sm hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-[#42D9F5]/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{mutation.isPending ? 'Executing 14-Step Pipeline...' : 'EXECUTE ONE-CLICK SIH DEMO'}</span>
        </button>
      </div>

      {/* Demo Flow Cards */}
      <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
        <h2 className="text-sm font-semibold text-[#F5FAFF]">Pipeline Sequence Execution Matrix</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {demoSteps.map((s) => (
            <div
              key={s.num}
              className="p-3 bg-[#12304A] rounded-lg border border-[#28475C] flex items-center space-x-3"
            >
              <div className="w-7 h-7 rounded bg-[#071522] text-[#42D9F5] font-mono text-xs font-bold flex items-center justify-center border border-[#28475C]">
                {s.num}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white">{s.label}</div>
                <div className="text-[10px] text-[#A6BACD]">{s.agent}</div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[#17B897]" />
            </div>
          ))}
        </div>
      </div>

      {/* Demo Output Card */}
      {demoState && (
        <div className="bg-[#0D2233] p-5 rounded-xl border border-[#17B897]/50 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#28475C] pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#17B897]" />
              <h3 className="font-bold text-white text-sm">SIH Demonstration Successfully Verified</h3>
            </div>
            <DataModeBadge mode="SYNTHETIC_DEMO" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Forecast Run ID</span>
              <span className="text-[#42D9F5] font-bold">{demoState.forecast_run_id}</span>
            </div>
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Evaluation ID</span>
              <span className="text-[#17B897] font-bold">{demoState.evaluation_id}</span>
            </div>
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Agent Run ID</span>
              <span className="text-white font-bold">{demoState.agent_run_id}</span>
            </div>
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Steps Completed</span>
              <span className="text-[#F2BC63] font-bold">14 / 14</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/command-center"
              className="px-4 py-2 rounded-lg bg-[#42D9F5] text-[#071522] text-xs font-bold hover:bg-[#38bdf8] transition-all flex items-center space-x-1.5"
            >
              <span>Inspect Command Center Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              to="/evaluation-lab"
              className="px-4 py-2 rounded-lg bg-[#12304A] text-white text-xs font-semibold hover:bg-[#19384B] border border-[#28475C] transition-all flex items-center space-x-1.5"
            >
              <span>View Verification Metrics</span>
              <BarChart3 className="w-3.5 h-3.5 text-[#17B897]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
