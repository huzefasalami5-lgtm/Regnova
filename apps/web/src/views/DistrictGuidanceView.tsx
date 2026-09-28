import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { MapPin, Search, Download, AlertCircle } from 'lucide-react';
import { DataModeBadge } from '../components/common/DataModeBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { EmptyState } from '../components/common/EmptyState';
import { DistrictForecastItem } from '../types';

export const DistrictGuidanceView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {
    data: forecast,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['district-guidance-forecast'],
    queryFn: () => api.getLatestForecast(),
  });

  const filteredDistricts = forecast?.districts.filter(
    (d: DistrictForecastItem) =>
      d.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.state_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#42D9F5]" />
            <span>District Guidance & Advisory Engine</span>
          </h1>
          <p className="text-xs text-[#A6BACD] mt-1">
            Aggregated district precipitation predictions, calibrated heavy rainfall exceedance probabilities, and reports.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {forecast && <DataModeBadge mode={forecast.data_mode} />}
          <button
            onClick={() => alert('Exporting Official REGNOVA District Advisory Report (PDF)...')}
            className="px-3 py-1.5 rounded-lg bg-[#12304A] hover:bg-[#19384B] border border-[#28475C] text-xs font-semibold text-[#42D9F5] flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {isError && (
        <ErrorAlert
          title="Failed to Load District Guidance"
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      )}

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#A6BACD] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search district or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0D2233] border border-[#28475C] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#A6BACD]/60 focus:outline-none focus:border-[#42D9F5]"
        />
      </div>

      {/* District Cards Grid */}
      {isLoading ? (
        <LoadingSpinner message="Retrieving calibrated district advisories..." />
      ) : !filteredDistricts || filteredDistricts.length === 0 ? (
        <EmptyState
          title="No Matching Districts"
          message={`No districts found matching '${searchTerm}'.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredDistricts.map((d: DistrictForecastItem) => (
            <div
              key={d.district_id}
              className="bg-[#0D2233] p-4 rounded-xl border border-[#28475C] hover:border-[#42D9F5]/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between border-b border-[#28475C] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{d.district_name}</h3>
                  <span className="text-[11px] text-[#A6BACD]">{d.state_name}</span>
                </div>
                <span className="text-[10px] font-mono bg-[#12304A] px-2 py-0.5 rounded text-[#42D9F5] border border-[#28475C]">
                  {d.active_regime.split('_')[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#12304A] p-2 rounded">
                  <span className="text-[10px] text-[#A6BACD] block">REGNOVA (AI)</span>
                  <span className="text-base font-bold text-[#42D9F5] font-mono">
                    {d.regnova_corrected_rainfall_mm.toFixed(1)} <span className="text-[10px] text-white">mm</span>
                  </span>
                </div>
                <div className="bg-[#12304A] p-2 rounded">
                  <span className="text-[10px] text-[#A6BACD] block">Raw NWP</span>
                  <span className="text-base font-bold text-[#A6BACD] font-mono">
                    {d.raw_nwp_rainfall_mm.toFixed(1)} <span className="text-[10px] text-white">mm</span>
                  </span>
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-[#A6BACD]">
                <div className="flex justify-between">
                  <span>Heavy Rain (&gt;35mm):</span>
                  <span className="font-semibold text-white font-mono">{d.prob_heavy_rain_gt35_pct.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Uncertainty:</span>
                  <span className="font-semibold text-[#17B897] font-mono">±{d.uncertainty_std_mm.toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advisory Disclaimer Notice */}
      <div className="p-3.5 bg-[#12304A]/60 border border-[#28475C] rounded-lg flex items-center space-x-2 text-xs text-[#A6BACD]">
        <AlertCircle className="w-4 h-4 text-[#F2BC63] flex-shrink-0" />
        <span>
          <strong>Operational Notice:</strong> REGNOVA is an experimental AI post-processing layer. Official public warnings and alerts must be verified with the India Meteorological Department (IMD).
        </span>
      </div>
    </div>
  );
};
