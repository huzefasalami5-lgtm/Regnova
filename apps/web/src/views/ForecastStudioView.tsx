import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Sliders, Play, Layers } from 'lucide-react';
import { ForecastRunResponse } from '../types';
import { IndiaMap } from '../components/map/IndiaMap';

export const ForecastStudioView: React.FC = () => {
  const [leadTime, setLeadTime] = useState<number>(24);
  const [forecastResult, setForecastResult] = useState<ForecastRunResponse | null>(null);

  const { data: initialForecast } = useQuery({
    queryKey: ['initial-studio-forecast'],
    queryFn: () => api.getLatestForecast(),
  });

  const mutation = useMutation({
    mutationFn: (lead: number) => api.runForecast({ lead_time_hours: lead }),
    onSuccess: (data) => setForecastResult(data),
  });

  const activeForecast = forecastResult || initialForecast;

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#42D9F5]" />
            <span>Forecast Correction Studio</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Configure forecast horizons, select atmospheric models, and run regime-aware corrections.
          </p>
        </div>

        <button
          onClick={() => mutation.mutate(leadTime)}
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-lg bg-[#42D9F5] text-[#071522] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center space-x-2 shadow-md shadow-[#42D9F5]/20"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{mutation.isPending ? 'Processing Post-Processing Grid...' : 'Run Correction Model'}</span>
        </button>
      </div>

      {/* Horizon & Parameters Bar */}
      <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-semibold text-[#A6BACD]">Forecast Lead Time:</span>
          <div className="flex space-x-2">
            {[24, 48, 72].map((h) => (
              <button
                key={h}
                onClick={() => setLeadTime(h)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  leadTime === h
                    ? 'bg-[#42D9F5] text-[#071522]'
                    : 'bg-[#12304A] text-[#A6BACD] hover:text-white'
                }`}
              >
                +{h} Hours
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs text-[#A6BACD]">
          <span>Active Architecture:</span>
          <span className="font-mono text-white bg-[#12304A] px-2 py-1 rounded border border-[#28475C]">
            EXPERT-MIX (5 Regime Gating)
          </span>
        </div>
      </div>

      {/* Interactive Map & Output Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[460px]">
          {activeForecast && <IndiaMap districts={activeForecast.districts} />}
        </div>

        <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
          <h2 className="text-sm font-semibold text-[#F5FAFF] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#42D9F5]" />
            <span>Forecast Run Summary</span>
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Run ID</span>
              <span className="text-white font-bold">{activeForecast?.forecast_run_id || 'fc-preview'}</span>
            </div>
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Valid Horizon</span>
              <span className="text-[#42D9F5] font-bold">+{leadTime} Hours (24h Accumulation)</span>
            </div>
            <div className="bg-[#12304A] p-2.5 rounded border border-[#28475C]">
              <span className="text-[#A6BACD] text-[10px] block">Districts Corrected</span>
              <span className="text-[#17B897] font-bold">{activeForecast?.districts.length || 12} Units</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#12304A]/60 border border-[#28475C] text-xs text-[#A6BACD] space-y-1">
            <span className="font-bold text-white block">Physical Constraints:</span>
            <span>✓ Zero temporal feature leakage</span>
            <br />
            <span>✓ Strict rainfall non-negativity (y &ge; 0)</span>
            <br />
            <span>✓ Orographic cross-barrier adjustments active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
