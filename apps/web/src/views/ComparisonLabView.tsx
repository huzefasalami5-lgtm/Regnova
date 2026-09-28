import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { SplitSquareVertical } from 'lucide-react';
import { DataModeBadge } from '../components/common/DataModeBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { DistrictForecastItem } from '../types';

export const ComparisonLabView: React.FC = () => {
  const {
    data: forecast,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['comparison-forecast'],
    queryFn: () => api.getLatestForecast(),
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <SplitSquareVertical className="w-5 h-5 text-[#42D9F5]" />
            <span>Scientific Comparison Lab</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Synchronized comparison of identical forecast cases, geographic extents, and lead times.
          </p>
        </div>
        {forecast && <DataModeBadge mode={forecast.data_mode} />}
      </div>

      {isError && (
        <ErrorAlert
          title="Failed to Load Comparison Baseline"
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      )}

      {/* District-by-District Comparison Table */}
      <div className="bg-[#0D2233] border border-[#28475C] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[#28475C] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#F5FAFF]">District Forecast Values (Valid 24h Horizon)</h2>
          <span className="text-xs text-[#A6BACD] font-mono">Accumulation: 24-hr Total (mm)</span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Calculating district baseline deltas..." />
        ) : !forecast || forecast.districts.length === 0 ? (
          <EmptyState
            title="No Comparison Cases Available"
            message="Please ensure backend models are trained and a forecast run is active."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12304A] text-[#A6BACD] uppercase text-[10px] tracking-wider border-b border-[#28475C]">
                <tr>
                  <th className="p-3">District</th>
                  <th className="p-3">State</th>
                  <th className="p-3 text-right">Raw NWP (mm)</th>
                  <th className="p-3 text-right">Global ML (mm)</th>
                  <th className="p-3 text-right text-[#42D9F5]">REGNOVA AI (mm)</th>
                  <th className="p-3 text-right">Correction Delta</th>
                  <th className="p-3 text-right text-[#17B897]">Heavy Prob (&gt;35mm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#28475C] font-mono">
                {forecast.districts.map((d: DistrictForecastItem) => {
                  const delta = d.regnova_corrected_rainfall_mm - d.raw_nwp_rainfall_mm;
                  return (
                    <tr key={d.district_id} className="hover:bg-[#12304A]/50 transition-colors">
                      <td className="p-3 font-sans font-medium text-[#F5FAFF]">{d.district_name}</td>
                      <td className="p-3 font-sans text-[#A6BACD]">{d.state_name}</td>
                      <td className="p-3 text-right text-[#A6BACD]">{d.raw_nwp_rainfall_mm.toFixed(1)}</td>
                      <td className="p-3 text-right text-[#A6BACD]">{d.global_ml_rainfall_mm.toFixed(1)}</td>
                      <td className="p-3 text-right font-bold text-[#42D9F5]">
                        {d.regnova_corrected_rainfall_mm.toFixed(1)}
                      </td>
                      <td className="p-3 text-right">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            delta > 0
                              ? 'bg-blue-500/10 text-blue-400'
                              : delta < 0
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-[#A6BACD]'
                          }`}
                        >
                          {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} mm
                        </span>
                      </td>
                      <td className="p-3 text-right text-[#17B897] font-bold">
                        {d.prob_heavy_rain_gt35_pct.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
