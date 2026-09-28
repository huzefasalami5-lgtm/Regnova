import React from 'react';
import { DistrictForecastItem } from '../../types';
import { useStore } from '../../store/useStore';
import { RainfallLegend } from '../common/RainfallLegend';

interface Props {
  districts: DistrictForecastItem[];
  showControls?: boolean;
}

export const IndiaMap: React.FC<Props> = ({ districts, showControls = true }) => {
  const { selectedDistrict, setSelectedDistrict, activeLayer, setActiveLayer } = useStore();

  const getRainfallColor = (mm: number) => {
    if (mm <= 2.5) return '#1E293B';
    if (mm <= 15.5) return '#0284C7';
    if (mm <= 35.5) return '#38BDF8';
    if (mm <= 64.5) return '#4ADE80';
    if (mm <= 115.5) return '#FACC15';
    if (mm <= 204.4) return '#FB923C';
    return '#F43F5E';
  };

  const getDisplayValue = (d: DistrictForecastItem) => {
    switch (activeLayer) {
      case 'RAW_NWP':
        return d.raw_nwp_rainfall_mm;
      case 'GLOBAL_ML':
        return d.global_ml_rainfall_mm;
      case 'PROB_HEAVY':
        return d.prob_heavy_rain_gt35_pct;
      case 'REGNOVA':
      default:
        return d.regnova_corrected_rainfall_mm;
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#071522] rounded-xl border border-[#28475C] overflow-hidden flex flex-col">
      {/* Top Layer Control Bar */}
      {showControls && (
        <div className="absolute top-3 left-3 z-10 flex items-center space-x-1.5 bg-[#0D2233]/90 backdrop-blur border border-[#28475C] p-1.5 rounded-lg text-xs shadow-md">
          <span className="text-[#A6BACD] text-[11px] font-medium px-2">Layer:</span>
          {(['REGNOVA', 'RAW_NWP', 'GLOBAL_ML', 'PROB_HEAVY'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                activeLayer === layer
                  ? 'bg-[#42D9F5] text-[#071522] shadow'
                  : 'text-[#A6BACD] hover:text-[#F5FAFF] hover:bg-[#12304A]'
              }`}
            >
              {layer === 'REGNOVA' ? 'REGNOVA (AI)' : layer === 'RAW_NWP' ? 'Raw NWP' : layer === 'GLOBAL_ML' ? 'Global ML' : 'Prob (>35mm)'}
            </button>
          ))}
        </div>
      )}

      {/* Geospatial District Canvas Grid */}
      <div className="flex-1 w-full relative flex items-center justify-center p-6">
        <svg
          viewBox="65 6 35 32"
          className="w-full h-full max-h-[580px] drop-shadow-[0_0_25px_rgba(66,217,245,0.05)]"
        >
          {/* Subcontinent outline reference */}
          <path
            d="M 68 24 Q 72 32 77 36 Q 80 34 88 28 Q 92 26 95 28 L 96 24 Q 88 22 84 18 Q 80 8 77 8 Q 72 14 68 24 Z"
            fill="#0D2233"
            stroke="#28475C"
            strokeWidth="0.4"
            opacity="0.8"
          />

          {/* District Nodes with Dynamic Rainfall Iso-surfaces */}
          {districts.map((d) => {
            const val = getDisplayValue(d);
            const color = activeLayer === 'PROB_HEAVY'
              ? (val > 60 ? '#F43F5E' : val > 30 ? '#FACC15' : '#0284C7')
              : getRainfallColor(val);
            const isSelected = selectedDistrict?.district_id === d.district_id;
            const radius = isSelected ? 1.6 : 1.2;

            // Invert Latitude for SVG coordinate space
            const svgY = 38 - (d.centroid_lat - 6);
            const svgX = d.centroid_lon;

            return (
              <g
                key={d.district_id}
                className="cursor-pointer transition-all duration-300 group"
                onClick={() => setSelectedDistrict(d)}
              >
                {/* Glow pulse for active heavy rain */}
                {val > 35 && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={radius * 2.2}
                    fill={color}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* District circle */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={radius}
                  fill={color}
                  stroke={isSelected ? '#42D9F5' : '#F5FAFF'}
                  strokeWidth={isSelected ? '0.35' : '0.15'}
                  className="transition-transform group-hover:scale-125"
                />

                {/* District Label */}
                <text
                  x={svgX + 1.6}
                  y={svgY + 0.4}
                  fontSize="0.9"
                  fill="#F5FAFF"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="select-none pointer-events-none drop-shadow"
                >
                  {d.district_name.split(' ')[0]} ({val.toFixed(0)}{activeLayer === 'PROB_HEAVY' ? '%' : 'mm'})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 z-10">
          <RainfallLegend />
        </div>

        {/* Selected District Info HUD */}
        {selectedDistrict && (
          <div className="absolute top-4 right-4 z-10 w-72 bg-[#12304A]/95 backdrop-blur border border-[#42D9F5]/40 rounded-lg p-3.5 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-[#28475C] pb-2 mb-2">
              <div>
                <h4 className="font-bold text-[#F5FAFF] text-sm">{selectedDistrict.district_name}</h4>
                <p className="text-[11px] text-[#A6BACD]">{selectedDistrict.state_name}</p>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="text-[#A6BACD] hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2 text-[11px]">
              <div className="bg-[#071522] p-2 rounded border border-[#28475C]">
                <div className="text-[#A6BACD]">REGNOVA AI</div>
                <div className="text-base font-bold text-[#42D9F5]">
                  {selectedDistrict.regnova_corrected_rainfall_mm.toFixed(1)} <span className="text-[10px] text-white">mm</span>
                </div>
              </div>
              <div className="bg-[#071522] p-2 rounded border border-[#28475C]">
                <div className="text-[#A6BACD]">Raw NWP</div>
                <div className="text-base font-bold text-[#A6BACD]">
                  {selectedDistrict.raw_nwp_rainfall_mm.toFixed(1)} <span className="text-[10px] text-white">mm</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-[#A6BACD]">
              <div className="flex justify-between">
                <span>Heavy Rain Prob (&gt;35mm):</span>
                <span className="font-semibold text-[#F5FAFF]">{selectedDistrict.prob_heavy_rain_gt35_pct.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Very Heavy (&gt;64mm):</span>
                <span className="font-semibold text-[#F5FAFF]">{selectedDistrict.prob_vheavy_rain_gt64_pct.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Uncertainty (±1σ):</span>
                <span className="font-semibold text-[#17B897]">±{selectedDistrict.uncertainty_std_mm.toFixed(1)} mm</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
