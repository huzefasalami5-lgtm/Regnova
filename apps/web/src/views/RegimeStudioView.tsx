import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { AtmosphericPredictors, RegimePredictionResponse } from '../types';
import { Compass, Sparkles, Info } from 'lucide-react';

export const RegimeStudioView: React.FC = () => {
  const [predictors, setPredictors] = useState<AtmosphericPredictors>({
    precipitable_water_mm: 62.0,
    relative_humidity_850hpa_pct: 86.0,
    u_wind_850hpa_ms: 14.0,
    v_wind_850hpa_ms: 2.0,
    mean_sea_level_pressure_hpa: 1002.0,
    vorticity_850hpa_s1: 3.5,
    monsoon_trough_latitude_deg: 21.5,
    terrain_elevation_m: 50.0,
    coastal_distance_km: 100.0,
  });

  const [result, setResult] = useState<RegimePredictionResponse | null>(null);

  const mutation = useMutation({
    mutationFn: (p: AtmosphericPredictors) => api.predictRegime(p),
    onSuccess: (data) => setResult(data),
  });

  const handlePredict = () => {
    mutation.mutate(predictors);
  };

  const presets = [
    {
      name: 'Active Monsoon Scenario',
      values: {
        precipitable_water_mm: 62.0,
        relative_humidity_850hpa_pct: 86.0,
        u_wind_850hpa_ms: 14.0,
        v_wind_850hpa_ms: 2.0,
        mean_sea_level_pressure_hpa: 1002.0,
        vorticity_850hpa_s1: 3.5,
        monsoon_trough_latitude_deg: 21.5,
        terrain_elevation_m: 50.0,
        coastal_distance_km: 100.0,
      },
    },
    {
      name: 'Break Monsoon Scenario',
      values: {
        precipitable_water_mm: 42.0,
        relative_humidity_850hpa_pct: 62.0,
        u_wind_850hpa_ms: 5.0,
        v_wind_850hpa_ms: -1.0,
        mean_sea_level_pressure_hpa: 1010.0,
        vorticity_850hpa_s1: 1.0,
        monsoon_trough_latitude_deg: 28.0,
        terrain_elevation_m: 50.0,
        coastal_distance_km: 400.0,
      },
    },
    {
      name: 'Monsoon Depression Scenario',
      values: {
        precipitable_water_mm: 68.0,
        relative_humidity_850hpa_pct: 92.0,
        u_wind_850hpa_ms: 18.0,
        v_wind_850hpa_ms: 8.0,
        mean_sea_level_pressure_hpa: 993.0,
        vorticity_850hpa_s1: 14.0,
        monsoon_trough_latitude_deg: 22.0,
        terrain_elevation_m: 20.0,
        coastal_distance_km: 50.0,
      },
    },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-xl font-bold text-[#F5FAFF] flex items-center space-x-2">
          <Compass className="w-5 h-5 text-[#42D9F5]" />
          <span>R-GATE: Monsoon Regime Intelligence Studio</span>
        </h1>
        <p className="text-xs text-[#A6BACD] mt-1">
          Interactive synoptic & meso-scale regime classification and soft-gating weight generator.
        </p>
      </div>

      {/* Preset Scenarios */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-[#A6BACD] self-center mr-2">Preset Scenarios:</span>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setPredictors(p.values);
              mutation.mutate(p.values);
            }}
            className="px-3 py-1.5 rounded-lg bg-[#0D2233] hover:bg-[#12304A] border border-[#28475C] text-xs font-medium text-[#42D9F5] transition-all"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictor Input Sliders */}
        <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] space-y-4">
          <h2 className="text-sm font-semibold text-[#F5FAFF]">Issue-Time Atmospheric Predictors</h2>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-[#A6BACD] mb-1">
                <span>Total Precipitable Water (PWV)</span>
                <span className="font-mono text-[#42D9F5]">{predictors.precipitable_water_mm} mm</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                step="0.5"
                value={predictors.precipitable_water_mm}
                onChange={(e) => setPredictors({ ...predictors, precipitable_water_mm: parseFloat(e.target.value) })}
                className="w-full accent-[#42D9F5]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#A6BACD] mb-1">
                <span>850 hPa Relative Humidity</span>
                <span className="font-mono text-[#42D9F5]">{predictors.relative_humidity_850hpa_pct}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="1"
                value={predictors.relative_humidity_850hpa_pct}
                onChange={(e) => setPredictors({ ...predictors, relative_humidity_850hpa_pct: parseFloat(e.target.value) })}
                className="w-full accent-[#42D9F5]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#A6BACD] mb-1">
                <span>Zonal Wind Speed (u850)</span>
                <span className="font-mono text-[#17B897]">{predictors.u_wind_850hpa_ms} m/s</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={predictors.u_wind_850hpa_ms}
                onChange={(e) => setPredictors({ ...predictors, u_wind_850hpa_ms: parseFloat(e.target.value) })}
                className="w-full accent-[#17B897]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#A6BACD] mb-1">
                <span>Mean Sea Level Pressure (MSLP)</span>
                <span className="font-mono text-[#F2BC63]">{predictors.mean_sea_level_pressure_hpa} hPa</span>
              </div>
              <input
                type="range"
                min="980"
                max="1020"
                step="0.5"
                value={predictors.mean_sea_level_pressure_hpa}
                onChange={(e) => setPredictors({ ...predictors, mean_sea_level_pressure_hpa: parseFloat(e.target.value) })}
                className="w-full accent-[#F2BC63]"
              />
            </div>

            <div>
              <div className="flex justify-between text-[#A6BACD] mb-1">
                <span>Monsoon Trough Latitude</span>
                <span className="font-mono text-[#42D9F5]">{predictors.monsoon_trough_latitude_deg}°N</span>
              </div>
              <input
                type="range"
                min="16"
                max="32"
                step="0.5"
                value={predictors.monsoon_trough_latitude_deg}
                onChange={(e) => setPredictors({ ...predictors, monsoon_trough_latitude_deg: parseFloat(e.target.value) })}
                className="w-full accent-[#42D9F5]"
              />
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={mutation.isPending}
            className="w-full py-2.5 rounded-lg bg-[#42D9F5] text-[#071522] font-bold text-xs hover:bg-[#38bdf8] transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{mutation.isPending ? 'Computing Regime Weights...' : 'Evaluate R-GATE Intelligence'}</span>
          </button>
        </div>

        {/* Results Output Card */}
        <div className="bg-[#0D2233] p-5 rounded-xl border border-[#28475C] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#F5FAFF] mb-4">R-GATE Inference Output</h2>

            {result ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#12304A] border border-[#28475C] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#A6BACD] uppercase tracking-wider block">Primary Regime</span>
                    <span className="text-lg font-bold text-[#42D9F5]">
                      {result.primary_regime.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#A6BACD] uppercase tracking-wider block">Confidence Score</span>
                    <span className="text-lg font-mono font-bold text-[#17B897]">
                      {(result.confidence_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#A6BACD]">Soft Gating Weights (Mixture Weights):</span>
                  {Object.entries(result.gating_weights).map(([regime, weight]: [string, number]) => (
                    <div key={regime} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#A6BACD]">{regime.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-[#F5FAFF]">{(weight * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#12304A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#42D9F5] to-[#17B897] rounded-full"
                          style={{ width: `${weight * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#A6BACD] bg-[#12304A]/40 rounded-lg border border-dashed border-[#28475C]">
                Select atmospheric parameters on the left and click "Evaluate R-GATE Intelligence" to view the computed regime probabilities.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#28475C] flex items-center space-x-2 text-[11px] text-[#A6BACD]">
            <Info className="w-4 h-4 text-[#42D9F5] flex-shrink-0" />
            <span>Zero Temporal Leakage: strictly evaluates issue-time atmospheric state.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
