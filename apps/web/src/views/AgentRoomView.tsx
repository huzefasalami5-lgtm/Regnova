import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { Bot, Play, CheckCircle2, Terminal } from 'lucide-react';
import { AgentRunResponse, AgentEventLog } from '../types';

export const AgentRoomView: React.FC = () => {
  const [activeRun, setActiveRun] = React.useState<AgentRunResponse | null>(null);

  const mutation = useMutation({
    mutationFn: () => api.runAgentWorkflow(),
    onSuccess: (data) => setActiveRun(data),
  });

  const agents = [
    { name: 'Data Quality Agent', role: 'Validates units, schema, temporal alignment, and masks future observations.' },
    { name: 'Regime Analysis Agent', role: 'Runs R-GATE atmospheric intelligence and computes soft gating weights.' },
    { name: 'Forecast Correction Agent', role: 'Executes EXPERT-MIX fusion across specialized regime models.' },
    { name: 'Evaluation Agent', role: 'Conducts continuous & categorical verification backtests.' },
    { name: 'District Guidance Agent', role: 'Synthesizes plain-language summaries and reports.' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <Bot className="w-5 h-5 text-[#42D9F5]" />
            <span>AI Agent Control Room & Audit Trail</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Deterministic 5-agent pipeline with typed tool invocations, state transitions, and compliance auditing.
          </p>
        </div>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-[#42D9F5] text-[#071522] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center space-x-2 shadow-md shadow-[#42D9F5]/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{mutation.isPending ? 'Executing Agent Workflow...' : 'Run 5-Agent Orchestration'}</span>
        </button>
      </div>

      {/* Agents Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {agents.map((agent, i) => (
          <div key={agent.name} className="bg-[#0D2233] p-3.5 rounded-xl border border-[#28475C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#42D9F5] font-bold">AGENT 0{i + 1}</span>
              <CheckCircle2 className="w-4 h-4 text-[#17B897]" />
            </div>
            <h3 className="text-xs font-bold text-[#F5FAFF]">{agent.name}</h3>
            <p className="text-[11px] text-[#A6BACD] leading-tight">{agent.role}</p>
          </div>
        ))}
      </div>

      {/* Execution Trace & Audit Log */}
      <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
        <h2 className="text-sm font-semibold text-[#F5FAFF] flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#17B897]" />
          <span>Tool Execution Audit Trail & Event Logs</span>
        </h2>

        {activeRun ? (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#071522] rounded-lg border border-[#28475C] text-[#A6BACD]">
              <div className="flex justify-between text-[11px] mb-2 border-b border-[#28475C] pb-1.5">
                <span>Run ID: {activeRun.run_id}</span>
                <span className="text-[#17B897]">STATUS: {activeRun.status}</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-[#F5FAFF] leading-relaxed">
                {activeRun.summary_report}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-sans font-semibold text-[#A6BACD]">Step-by-Step Tool Calls:</h3>
              {activeRun.events.map((evt: AgentEventLog, idx: number) => (
                <div key={idx} className="p-2.5 rounded bg-[#12304A] border border-[#28475C] flex items-start space-x-3">
                  <span className="text-[#42D9F5] font-bold text-[10px] bg-[#071522] px-1.5 py-0.5 rounded border border-[#28475C]">
                    {evt.agent_name}
                  </span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#F5FAFF]">{evt.tool_name}</span>
                      <span className="text-[10px] text-[#A6BACD]">{evt.duration_ms} ms</span>
                    </div>
                    <p className="text-[11px] text-[#A6BACD]">{evt.output_summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#A6BACD] bg-[#12304A]/30 rounded-lg border border-dashed border-[#28475C]">
            Click "Run 5-Agent Orchestration" to execute the live multi-agent pipeline and observe tool execution logs in real-time.
          </div>
        )}
      </div>
    </div>
  );
};
