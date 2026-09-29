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
} from 'lucide-react';
import { AgentRunResponse, AgentEventLog } from '../types';

export const AgentRoomView: React.FC = () => {
  const [activeRun, setActiveRun] = useState<AgentRunResponse | null>(null);

  // Fetch agent execution history from database
  const { data: historyRuns, refetch: refetchHistory } = useQuery({
    queryKey: ['agent-runs-history'],
    queryFn: () => api.getAgentRunsHistory(),
  });

  const mutation = useMutation({
    mutationFn: () => api.runAgentWorkflow(),
    onSuccess: (data) => {
      setActiveRun(data);
      refetchHistory();
    },
  });

  const agents = [
    {
      id: '01',
      name: 'Data Ingestion & Integrity Agent',
      role: 'Validates units (mm, hPa, m/s), spatial bounds, and masks future observations (zero temporal leakage).',
    },
    {
      id: '02',
      name: 'R-GATE Synoptic Regime Classifier',
      role: 'Evaluates pressure, moisture, and monsoon trough position to compute 5-regime soft-gating weights.',
    },
    {
      id: '03',
      name: 'EXPERT-MIX Multi-Model Fusion',
      role: 'Executes regime-specialized regression experts with smooth mixture weights and non-negativity bounds.',
    },
    {
      id: '04',
      name: 'RAIN-CAL Spatial Calibration',
      role: 'Applies isotonic calibration for heavy (>35mm), very heavy (>64mm), and extreme (>115mm) probabilities.',
    },
    {
      id: '05',
      name: 'Verification & Quality Control',
      role: 'Conducts real-time verification checks on RMSE, MAE, Bias, and Critical Success Index (CSI).',
    },
    {
      id: '06',
      name: 'Meteorological Advisory Agent',
      role: 'Synthesizes plain-language guidance with uncertainty spread and regulatory compliance notices.',
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#42D9F5]" />
            <span>AI Multi-Agent Control Room & Audit Trail</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Deterministic 6-agent orchestration pipeline with typed tool executions, state transitions, and compliance auditing.
          </p>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#42D9F5] to-[#17B897] text-[#071522] font-bold text-xs hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-[#42D9F5]/20 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{mutation.isPending ? 'Executing 6-Agent Pipeline...' : 'Run 6-Agent Orchestration'}</span>
        </button>
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
          </div>
        ))}
      </div>

      {/* Execution Trace & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
          <h2 className="text-sm font-semibold text-[#F5FAFF] flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#17B897]" />
            <span>Live Tool Invocations & Event Logs</span>
          </h2>

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
                  Step-by-Step Tool Executions ({activeRun.events.length} Tool Calls):
                </h3>
                {activeRun.events.map((evt: AgentEventLog, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#12304A] border border-[#28475C] flex items-start space-x-3"
                  >
                    <span className="text-[#42D9F5] font-bold text-[10px] bg-[#071522] px-2 py-1 rounded border border-[#28475C] flex-shrink-0">
                      {evt.agent_name.split(' ')[0]}
                    </span>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#F5FAFF] font-mono text-[11px]">
                          {evt.tool_name}
                        </span>
                        <span className="text-[10px] text-[#A6BACD] font-mono bg-[#071522] px-1.5 py-0.5 rounded">
                          {evt.duration_ms} ms
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A6BACD] leading-snug">{evt.output_summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-[#A6BACD] bg-[#12304A]/30 rounded-lg border border-dashed border-[#28475C] space-y-2">
              <Sparkles className="w-6 h-6 text-[#42D9F5] mx-auto opacity-80" />
              <p>Click "Run 6-Agent Orchestration" to execute the live multi-agent pipeline and observe tool execution logs in real-time.</p>
            </div>
          )}
        </div>

        {/* Right Side: Execution History & Governance */}
        <div className="space-y-4">
          <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5FAFF] flex items-center space-x-2">
              <History className="w-3.5 h-3.5 text-[#42D9F5]" />
              <span>Persisted Runs History</span>
            </h3>
            <div className="space-y-2 text-xs">
              {historyRuns && historyRuns.length > 0 ? (
                historyRuns.map((r: any) => (
                  <div
                    key={r.run_id}
                    className="p-2.5 rounded bg-[#12304A] border border-[#28475C] text-[11px] space-y-1"
                  >
                    <div className="flex justify-between font-mono">
                      <span className="text-[#42D9F5] font-bold">{r.run_id}</span>
                      <span className="text-[#17B897]">{r.status}</span>
                    </div>
                    <div className="flex justify-between text-[#A6BACD] text-[10px]">
                      <span>{r.events_count || 6} events</span>
                      <span>{r.started_at ? new Date(r.started_at).toLocaleTimeString() : 'Recent'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[11px] text-[#A6BACD] py-2 text-center">
                  No persisted executions yet in SQLite DB.
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] text-xs text-[#A6BACD] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5FAFF] flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#17B897]" />
              <span>Compliance & Guardrails</span>
            </h3>
            <p className="text-[11px] leading-relaxed">
              Strict deterministic validation enforces zero temporal feature leakage, verified mathematical non-negativity (y ≥ 0), and explicit Platt probability calibration bounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
