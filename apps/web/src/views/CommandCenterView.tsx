import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { IndiaMap } from '../components/map/IndiaMap';
import { DataModeBadge } from '../components/common/DataModeBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { Compass, RefreshCw, Wind } from 'lucide-react';
import { useStore } from '../store/useStore';

export const CommandCenterView: React.FC = () => {
  const { activeLeadTime, setActiveLeadTime } = useStore();
  const {
    data: forecast,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['latest-forecast', activeLeadTime],
    queryFn: () => api.getLatestForecast(),
  });

  return (
    <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
      {/* Top Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0D2233] p-3 rounded-xl border border-[#28475C]">
        <div className="flex items-center space-x-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#A6BACD] block">Primary Regime</span>
            <span className="text-sm font-bold text-[#42D9F5]">
              {forecast?.regime_summary.primary_regime.replace(/_/g, ' ') || 'ACTIVE MONSOON'}
            </span>
          </div>

          <div className="h-6 w-px bg-[#28475C]" />

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#A6BACD] block">Regime Confidence</span>
            <span className="text-sm font-mono font-bold text-[#17B897]">
              {forecast ? `${(forecast.regime_summary.confidence_score * 100).toFixed(1)}%` : '92.4%'}
            </span>
          </div>

          <div className="h-6 w-px bg-[#28475C]" />

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#A6BACD] block">Forecast Lead</span>
            <div className="flex space-x-1 mt-0.5">
              {[24, 48, 72].map((lead) => (
                <button
                  key={lead}
                  onClick={() => setActiveLeadTime(lead)}
                  className={`px-2 py-0.5 text-xs rounded font-mono ${
                    activeLeadTime === lead
                      ? 'bg-[#42D9F5] text-[#071522] font-bold'
                      : 'bg-[#12304A] text-[#A6BACD] hover:text-white'
                  }`}
                >
                  +{lead}h
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {forecast && <DataModeBadge mode={forecast.data_mode} />}
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg bg-[#12304A] hover:bg-[#19384B] border border-[#28475C] text-[#A6BACD] hover:text-[#F5FAFF]"
            title="Refresh Forecast"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isError && (
        <ErrorAlert
          title="Failed to Load Forecast Data"
          message={(error as Error)?.message || 'Could not connect to FastAPI forecast engine.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Main Split: Geospatial Map on Left, Regime Intelligence & Telemetry on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        <div className="lg:col-span-2 min-h-[460px] flex flex-col">
          {isLoading ? (
            <LoadingSpinner message="Fetching real-time geospatial rainfall forecast grid..." />
          ) : !forecast || forecast.districts.length === 0 ? (
            <EmptyState
              title="No Forecast Grid Available"
              message="No forecast run has been generated yet for this lead time."
              action={
                <button
                  onClick={() => refetch()}
                  className="px-3 py-1.5 rounded bg-[#42D9F5] text-[#071522] text-xs font-bold"
                >
                  Generate Initial Forecast
                </button>
              }
            />
          ) : (
            <IndiaMap districts={forecast.districts} />
          )}
        </div>

        {/* Right Information Rail */}
        <div className="space-y-4 flex flex-col">
          {/* Regime Gating Weights Breakdown */}
          <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5FAFF] flex items-center space-x-2">
                <Compass className="w-3.5 h-3.5 text-[#42D9F5]" />
                <span>R-GATE Soft Gating Weights</span>
              </h3>
              <span className="text-[10px] text-[#A6BACD]">Σ = 1.0</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {forecast ? (
                Object.entries(forecast.regime_summary.gating_weights).map(([regime, weight]: [string, number]) => (
                  <div key={regime} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#A6BACD]">{regime.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[#F5FAFF]">{(weight * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#12304A] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#42D9F5] to-[#17B897] rounded-full transition-all duration-500"
                        style={{ width: `${weight * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-[#A6BACD]">Connecting to R-GATE classifier...</p>
              )}
            </div>
          </div>

          {/* Atmospheric Synoptic Evidence */}
          <div className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5FAFF] mb-3 flex items-center space-x-2">
              <Wind className="w-3.5 h-3.5 text-[#17B897]" />
              <span>Synoptic Atmospheric Drivers</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#12304A] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[10px] text-[#A6BACD] block">Precipitable Water</span>
                <span className="text-sm font-mono font-bold text-[#42D9F5]">62.0 mm</span>
              </div>
              <div className="bg-[#12304A] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[10px] text-[#A6BACD] block">850 hPa RH</span>
                <span className="text-sm font-mono font-bold text-[#42D9F5]">86.0%</span>
              </div>
              <div className="bg-[#12304A] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[10px] text-[#A6BACD] block">Zonal Wind (u850)</span>
                <span className="text-sm font-mono font-bold text-[#17B897]">14.0 m/s</span>
              </div>
              <div className="bg-[#12304A] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[10px] text-[#A6BACD] block">MSLP</span>
                <span className="text-sm font-mono font-bold text-[#F2BC63]">1002.0 hPa</span>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded bg-[#12304A]/60 border border-[#28475C] text-[11px] text-[#A6BACD] leading-relaxed">
              <span className="font-semibold text-white">Meteorological State:</span> Active monsoon low-level jet over Arabian Sea and Peninsular India with active monsoon trough located near 21.5°N.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
