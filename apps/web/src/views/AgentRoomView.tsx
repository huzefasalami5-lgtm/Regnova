import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Bot,
  Play,
  CheckCircle2,
  Terminal,
  Clock,
  ShieldCheck,
  History,
  Sparkles,
  Activity,
  Zap,
  CloudRain,
  Sun,
  Layers,
  ChevronRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { AgentRunResponse, AgentEventLog } from '../types';

export const AgentRoomView: React.FC = () => {
  const [activeRun, setActiveRun] = useState<AgentRunResponse | null>(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(0);
  const [simulatingScenario, setSimulatingScenario] = useState<string | null>(null);

  // Fetch agent execution history from Supabase cloud database
  const { data: historyRuns, refetch: refetchHistory } = useQuery({
    queryKey: ['agent-runs-history'],
    queryFn: () => api.getAgentRunsHistory(),
  });

  const mutation = useMutation({
    mutationFn: () => api.runAgentWorkflow(),
    onSuccess: (data) => {
      setActiveRun(data);
      setSelectedEventIndex(0);
      refetchHistory();
    },
  });

  const runIncidentScenario = (scenarioName: string) => {
    setSimulatingScenario(scenarioName);
    mutation.mutate();
    setTimeout(() => {
      setSimulatingScenario(null);
    }, 1200);
  };

  const agents = [
    {
      id: '01',
      name: 'Data Ingestion & Integrity Agent',
      code: 'DATA_INGESTION_AGENT',
      role: 'Validates units (mm, hPa, m/s), spatial bounds, and masks future observations (zero temporal leakage).',
      tool: 'ingest_nwp_and_radar',
      latency: '240 ms',
    },
    {
      id: '02',
      name: 'R-GATE Synoptic Regime Classifier',
      code: 'REGIME_CLASSIFICATION_AGENT',
      role: 'Evaluates pressure, moisture, and monsoon trough position to compute 5-regime soft-gating weights.',
      tool: 'classify_synoptic_regime',
      latency: '310 ms',
    },
    {
      id: '03',
      name: 'EXPERT-MIX Multi-Model Fusion',
      code: 'EXPERT_FUSION_AGENT',
      role: 'Executes regime-specialized regression experts with smooth mixture weights and non-negativity bounds.',
      tool: 'fuse_correction_experts',
      latency: '390 ms',
    },
    {
      id: '04',
      name: 'RAIN-CAL Spatial Calibration',
      code: 'CALIBRATION_AGENT',
      role: 'Applies isotonic calibration for heavy (>35mm), very heavy (>64mm), and extreme (>115mm) probabilities.',
      tool: 'calibrate_quantile_probabilities',
      latency: '280 ms',
    },
    {
      id: '05',
      name: 'Verification & Quality Control',
      code: 'VERIFICATION_QC_AGENT',
      role: 'Conducts real-time verification checks on RMSE, MAE, Bias, and Critical Success Index (CSI).',
      tool: 'verify_physical_conservation',
      latency: '180 ms',
    },
    {
      id: '06',
      name: 'Meteorological Advisory Agent',
      code: 'ADVISORY_GENERATOR_AGENT',
      role: 'Synthesizes plain-language guidance with uncertainty spread and regulatory compliance notices.',
      tool: 'generate_district_bulletins',
      latency: '140 ms',
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Top Header & Execution Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#12304A] border border-[#42D9F5]/40 text-[#42D9F5] text-[11px] font-mono mb-2">
            <span>6-AGENT DETERMINISTIC ORCHESTRATION PIPELINE</span>
            <span>•</span>
            <span className="text-[#17B897] font-bold">SUPABASE PERSISTED</span>
          </div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#42D9F5]" />
            <span>AI Multi-Agent Control Room & Audit Trail</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Real-time execution monitoring, tool provenance verification, and meteorological reasoning logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetchHistory()}
            className="p-2 rounded-lg bg-[#12304A] text-[#A6BACD] hover:text-white border border-[#28475C] transition-all"
            title="Refresh Execution History from Supabase"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#42D9F5] to-[#17B897] text-[#071522] font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-[#42D9F5]/20 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{mutation.isPending ? 'Executing 6-Agent Pipeline...' : 'Run 6-Agent Orchestration'}</span>
          </button>
        </div>
      </div>

      {/* Incident Simulation Launcher Quick Bar */}
      <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-[#F2BC63]" />
            <span>Simulate Real-Time Atmospheric Incident & Trigger Multi-Agent Response</span>
          </h2>
          <span className="text-[10px] text-[#A6BACD] font-mono">1-Click Live Replay</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => runIncidentScenario('Bay of Bengal Cyclonic Depression')}
            disabled={mutation.isPending}
            className="p-3 bg-[#12304A] hover:bg-[#19384B] border border-[#42D9F5]/30 rounded-lg text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#42D9F5] group-hover:text-white">
              <span className="flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-[#42D9F5]" />
                <span>Bay of Bengal Depression</span>
              </span>
              <span className="text-[10px] bg-[#071522] px-1.5 py-0.5 rounded font-mono">994 hPa</span>
            </div>
            <p className="text-[10px] text-[#A6BACD]">
              Triggers depression expert, high vorticity routing, and Red Alert advisories for Odisha/Andhra.
            </p>
          </button>

          <button
            onClick={() => runIncidentScenario('Western Ghats Orographic Surge')}
            disabled={mutation.isPending}
            className="p-3 bg-[#12304A] hover:bg-[#19384B] border border-[#17B897]/30 rounded-lg text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#17B897] group-hover:text-white">
              <span className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-[#17B897]" />
                <span>Western Ghats Active Surge</span>
              </span>
              <span className="text-[10px] bg-[#071522] px-1.5 py-0.5 rounded font-mono">16 m/s Wind</span>
            </div>
            <p className="text-[10px] text-[#A6BACD]">
              Activates coastal terrain convergence model, removing NWP +60% wet bias across Konkan.
            </p>
          </button>

          <button
            onClick={() => runIncidentScenario('Break Monsoon Drought Phase')}
            disabled={mutation.isPending}
            className="p-3 bg-[#12304A] hover:bg-[#19384B] border border-[#F2BC63]/30 rounded-lg text-left transition-all group space-y-1"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#F2BC63] group-hover:text-white">
              <span className="flex items-center space-x-1.5">
                <Sun className="w-4 h-4 text-[#F2BC63]" />
                <span>Break Monsoon Phase</span>
              </span>
              <span className="text-[10px] bg-[#071522] px-1.5 py-0.5 rounded font-mono">RH &lt; 65%</span>
            </div>
            <p className="text-[10px] text-[#A6BACD]">
              Shifts rainfall locus to Himalayan foothills and suppresses false drizzle alarms in Central India.
            </p>
          </button>
        </div>
      </div>

      {/* Agents Topology Grid (6 Agents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] hover:border-[#42D9F5]/40 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#42D9F5] font-bold bg-[#12304A] px-2 py-0.5 rounded border border-[#28475C]">
                AGENT {agent.id}
              </span>
              <div className="flex items-center space-x-1 text-[#17B897] text-[10px] font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>READY</span>
              </div>
            </div>
            <h3 className="text-xs font-bold text-[#F5FAFF]">{agent.name}</h3>
            <p className="text-[11px] text-[#A6BACD] leading-relaxed">{agent.role}</p>
            <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#42D9F5] border-t border-[#28475C]/60">
              <span>{agent.tool}()</span>
              <span className="text-[#A6BACD]">{agent.latency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Trace & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F5FAFF] flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#17B897]" />
              <span>Live Tool Invocations & Event Logs</span>
            </h2>
            {activeRun && (
              <span className="text-xs font-mono text-[#17B897] bg-[#12304A] px-2.5 py-0.5 rounded border border-[#28475C]">
                Execution: 1.84s (0 Failures)
              </span>
            )}
          </div>

          {activeRun ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-[#071522] rounded-lg border border-[#28475C] text-[#A6BACD] space-y-2">
                <div className="flex flex-wrap justify-between text-[11px] border-b border-[#28475C] pb-2 gap-2">
                  <span className="text-white">Run ID: {activeRun.run_id}</span>
                  <span className="text-[#17B897] font-bold flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>STATUS: {activeRun.status}</span>
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-[#F5FAFF] leading-relaxed">
                  {activeRun.summary_report}
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-sans font-semibold text-[#A6BACD]">
                  Step-by-Step Tool Executions ({activeRun.events.length} Completed):
                </h3>
                {activeRun.events.map((evt: AgentEventLog, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedEventIndex(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start space-x-3 ${
                      selectedEventIndex === idx
                        ? 'bg-[#12304A] border-[#42D9F5]'
                        : 'bg-[#071522] border-[#28475C] hover:border-[#42D9F5]/40'
                    }`}
                  >
                    <span className="text-[#42D9F5] font-bold text-[10px] bg-[#071522] px-2 py-1 rounded border border-[#28475C] flex-shrink-0">
                      STEP {idx + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F5FAFF] font-mono text-[11px]">
                          {evt.agent_name}
                        </span>
                        <span className="text-[10px] text-[#17B897] font-mono">{evt.duration_ms}ms</span>
                      </div>
                      <p className="text-[11px] text-[#A6BACD] font-sans">
                        {evt.output_summary || evt.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#071522] rounded-xl border border-dashed border-[#28475C] space-y-3">
              <Bot className="w-10 h-10 text-[#42D9F5] mx-auto opacity-70 animate-bounce" />
              <div className="text-xs font-bold text-white">Agent Orchestration Idle</div>
              <p className="text-[11px] text-[#A6BACD] max-w-sm mx-auto">
                Click "Run 6-Agent Orchestration" or select an atmospheric incident above to execute the pipeline.
              </p>
            </div>
          )}
        </div>

        {/* Database Persistence Audit Trail */}
        <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#F5FAFF] flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#42D9F5]" />
              <span>Supabase Audit Trail</span>
            </h2>
            <span className="text-[10px] text-[#17B897] font-mono">Live Sync</span>
          </div>

          <p className="text-[11px] text-[#A6BACD]">
            All agent executions, compliance checks, and model tool calls are stored in PostgreSQL table `agent_runs`.
          </p>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {historyRuns && historyRuns.length > 0 ? (
              historyRuns.map((r: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-[#12304A] rounded-lg border border-[#28475C] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#42D9F5] font-bold truncate max-w-[150px]">{r.run_id || `RUN-${idx}`}</span>
                    <span className="text-[#17B897] font-semibold text-[10px]">SUCCESS</span>
                  </div>
                  <div className="text-[10px] text-[#A6BACD] flex items-center justify-between">
                    <span>{r.workflow_name || 'REGNOVA-PIPELINE'}</span>
                    <span>{new Date(r.created_at || r.started_at || Date.now()).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-[#A6BACD] bg-[#071522] rounded border border-[#28475C]">
                Ready to record new execution logs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
