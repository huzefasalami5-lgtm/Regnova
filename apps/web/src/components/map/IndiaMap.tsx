import React, { useState, useMemo } from 'react';
import { DistrictForecastItem } from '../../types';
import { useStore } from '../../store/useStore';
import { RainfallLegend } from '../common/RainfallLegend';
import statesGeoJson from '../../data/geo/india_states.json';
import districtsGeoJson from '../../data/geo/india_districts.json';
import worldGeoJson from '../../data/geo/world_context.json';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Layers,
  Compass,
  Info,
  ChevronRight,
  Globe,
  Map as MapIcon,
} from 'lucide-react';

interface Props {
  districts: DistrictForecastItem[];
  showControls?: boolean;
}

type MapScope = 'WORLD' | 'INDIA' | 'STATE';

export const IndiaMap: React.FC<Props> = ({ districts, showControls = true }) => {
  const { selectedDistrict, setSelectedDistrict, activeLayer, setActiveLayer } = useStore();
  const [mapScope, setMapScope] = useState<MapScope>('INDIA');
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictForecastItem | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Map projection helpers (Equirectangular Mercator mapped to SVG Viewbox)
  // Base India Bounding Box: Lon [67°E - 98°E], Lat [7°N - 37°N]
  const lonToSvgX = (lon: number) => {
    if (mapScope === 'WORLD') {
      return ((lon - 50.0) / 55.0) * 100;
    }
    return ((lon - 67.0) / 31.0) * 100;
  };

  const latToSvgY = (lat: number) => {
    if (mapScope === 'WORLD') {
      return 100 - ((lat - (-10.0)) / 50.0) * 100;
    }
    return 100 - ((lat - 7.0) / 30.0) * 100;
  };

  const getRainfallColor = (mm: number) => {
    if (mm <= 2.5) return '#1E293B';
    if (mm <= 15.5) return '#0284C7';
    if (mm <= 35.5) return '#38BDF8';
    if (mm <= 64.5) return '#4ADE80';
    if (mm <= 115.5) return '#FACC15';
    if (mm <= 204.4) return '#FB923C';
    return '#F43F5E';
  };

  const getDeltaColor = (delta: number) => {
    if (delta > 10) return '#38BDF8';
    if (delta > 2) return '#0284C7';
    if (delta >= -2) return '#1E293B';
    if (delta >= -10) return '#FACC15';
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

  // Convert GeoJSON polygon coordinates to SVG path `d` string
  const polygonToPath = (coords: number[][][]) => {
    if (!coords || !coords[0]) return '';
    return coords
      .map((ring) => {
        return ring
          .map((pt, idx) => {
            const x = lonToSvgX(pt[0]);
            const y = latToSvgY(pt[1]);
            return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
          })
          .join(' ') + ' Z';
      })
      .join(' ');
  };

  // Filtered districts matching search
  const filteredDistricts = useMemo(() => {
    if (!searchTerm) return districts;
    const term = searchTerm.toLowerCase();
    return districts.filter(
      (d) =>
        d.district_name.toLowerCase().includes(term) ||
        d.state_name.toLowerCase().includes(term)
    );
  }, [districts, searchTerm]);

  const handleDistrictClick = (d: DistrictForecastItem) => {
    setSelectedDistrict(d);
    setSelectedState(d.state_name);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedState(null);
    setSelectedDistrict(null);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full h-full min-h-[520px] bg-[#071522] rounded-xl border border-[#28475C] overflow-hidden flex flex-col select-none">
      {/* Top Controls Toolbar */}
      {showControls && (
        <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          {/* Left Layer Switcher & Scope */}
          <div className="flex items-center space-x-2 bg-[#0D2233]/90 backdrop-blur-md border border-[#28475C] p-1.5 rounded-lg shadow-lg pointer-events-auto">
            {/* Scope Selection */}
            <div className="flex items-center space-x-1 border-r border-[#28475C] pr-2">
              <button
                onClick={() => {
                  setMapScope('WORLD');
                  setSelectedState(null);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                  mapScope === 'WORLD'
                    ? 'bg-[#12304A] text-[#42D9F5] border border-[#42D9F5]/40'
                    : 'text-[#A6BACD] hover:text-white'
                }`}
                title="South Asia Monsoon Domain"
              >
                <Globe className="w-3 h-3" />
                <span>Domain</span>
              </button>
              <button
                onClick={() => {
                  setMapScope('INDIA');
                  setSelectedState(null);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 transition-all ${
                  mapScope === 'INDIA' && !selectedState
                    ? 'bg-[#12304A] text-[#42D9F5] border border-[#42D9F5]/40'
                    : 'text-[#A6BACD] hover:text-white'
                }`}
                title="All India Meteorological Extent"
              >
                <MapIcon className="w-3 h-3" />
                <span>India</span>
              </button>
            </div>

            {/* Layer Selection */}
            <div className="flex items-center space-x-1">
              <span className="text-[#A6BACD] text-[10px] uppercase font-bold px-1.5 flex items-center space-x-1">
                <Layers className="w-3 h-3 text-[#42D9F5]" />
                <span className="hidden sm:inline">Layer</span>
              </span>
              {(['REGNOVA', 'RAW_NWP', 'GLOBAL_ML', 'PROB_HEAVY'] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    activeLayer === layer
                      ? 'bg-[#42D9F5] text-[#071522] shadow font-bold'
                      : 'text-[#A6BACD] hover:text-[#F5FAFF] hover:bg-[#12304A]'
                  }`}
                >
                  {layer === 'REGNOVA'
                    ? 'REGNOVA (AI)'
                    : layer === 'RAW_NWP'
                    ? 'Raw NWP'
                    : layer === 'GLOBAL_ML'
                    ? 'Global ML'
                    : 'Heavy Prob (>35mm)'}
                </button>
              ))}
            </div>
          </div>

          {/* Right Search and Quick Filter */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#A6BACD] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find district / state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-44 sm:w-56 bg-[#0D2233]/95 backdrop-blur border border-[#28475C] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A6BACD]/60 focus:outline-none focus:border-[#42D9F5]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#A6BACD] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb drill-down bar */}
      <div className="absolute top-16 left-3 z-10 flex items-center space-x-1.5 text-[11px] font-mono bg-[#0D2233]/80 backdrop-blur px-2.5 py-1 rounded-md border border-[#28475C] text-[#A6BACD]">
        <button
          onClick={() => {
            setMapScope('INDIA');
            setSelectedState(null);
            setSelectedDistrict(null);
          }}
          className="hover:text-[#42D9F5] transition-colors"
        >
          India (National)
        </button>
        {selectedState && (
          <>
            <ChevronRight className="w-3 h-3 text-[#28475C]" />
            <span className="text-[#42D9F5] font-semibold">{selectedState}</span>
          </>
        )}
        {selectedDistrict && (
          <>
            <ChevronRight className="w-3 h-3 text-[#28475C]" />
            <span className="text-[#17B897] font-semibold">{selectedDistrict.district_name}</span>
          </>
        )}
      </div>

      {/* Floating Zoom Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col space-y-1.5 bg-[#0D2233]/90 backdrop-blur border border-[#28475C] p-1 rounded-lg shadow-lg">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3.5))}
          className="p-1.5 rounded hover:bg-[#12304A] text-[#A6BACD] hover:text-[#42D9F5] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 0.8))}
          className="p-1.5 rounded hover:bg-[#12304A] text-[#A6BACD] hover:text-[#42D9F5] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 rounded hover:bg-[#12304A] text-[#A6BACD] hover:text-[#42D9F5] transition-colors"
          title="Reset Extent"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Geospatial SVG Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden p-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-h-[680px] transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          {/* Subtle Geospatial Coordinate Grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#12304A" strokeWidth="0.15" opacity="0.4" />
            </pattern>
            {/* Radial glow for selected centroid */}
            <radialGradient id="centroidGlow">
              <stop offset="0%" stopColor="#42D9F5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#42D9F5" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* 1. South Asia / Surrounding Ocean Boundaries Context */}
          {worldGeoJson.features.map((feat, idx) => (
            <path
              key={`world-${idx}`}
              d={polygonToPath(feat.geometry.coordinates as number[][][])}
              fill="#06121C"
              stroke="#19384B"
              strokeWidth="0.2"
              opacity="0.6"
            />
          ))}

          {/* 2. Indian State & UT Boundaries */}
          {statesGeoJson.features.map((state) => {
            const isStateSelected = selectedState === state.properties.state_name;
            const isStateHovered = hoveredState === state.properties.state_name;

            return (
              <path
                key={state.id}
                d={polygonToPath(state.geometry.coordinates as number[][][])}
                fill={
                  isStateSelected
                    ? '#12304A'
                    : isStateHovered
                    ? '#0F283C'
                    : '#091A28'
                }
                stroke={isStateSelected ? '#42D9F5' : '#28475C'}
                strokeWidth={isStateSelected ? '0.6' : '0.3'}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredState(state.properties.state_name)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => {
                  setSelectedState(state.properties.state_name);
                  setMapScope('STATE');
                }}
              >
                <title>{state.properties.state_name} ({state.properties.category})</title>
              </path>
            );
          })}

          {/* 3. District Rainfall Polygons / Iso-surfaces */}
          {districtsGeoJson.features.map((dFeat) => {
            const matchingForecast = districts.find(
              (item) => item.district_id === dFeat.properties.district_id
            );
            if (!matchingForecast) return null;

            const val = getDisplayValue(matchingForecast);
            const fillColor =
              activeLayer === 'PROB_HEAVY'
                ? val > 60
                  ? '#F43F5E'
                  : val > 30
                  ? '#FACC15'
                  : '#0284C7'
                : getRainfallColor(val);

            const isSelected = selectedDistrict?.district_id === matchingForecast.district_id;

            return (
              <path
                key={`poly-${dFeat.properties.district_id}`}
                d={polygonToPath(dFeat.geometry.coordinates as number[][][])}
                fill={fillColor}
                fillOpacity={isSelected ? 0.85 : 0.6}
                stroke={isSelected ? '#42D9F5' : '#12304A'}
                strokeWidth={isSelected ? '0.5' : '0.15'}
                className="transition-all duration-150 cursor-pointer hover:fill-opacity-95"
                onClick={() => handleDistrictClick(matchingForecast)}
                onMouseEnter={() => setHoveredDistrict(matchingForecast)}
                onMouseLeave={() => setHoveredDistrict(null)}
              />
            );
          })}

          {/* 4. District Centroids & Synoptic Weather Markers */}
          {filteredDistricts.map((d) => {
            const val = getDisplayValue(d);
            const color =
              activeLayer === 'PROB_HEAVY'
                ? val > 60
                  ? '#F43F5E'
                  : val > 30
                  ? '#FACC15'
                  : '#0284C7'
                : getRainfallColor(val);

            const isSelected = selectedDistrict?.district_id === d.district_id;
            const isHovered = hoveredDistrict?.district_id === d.district_id;
            const radius = isSelected ? 1.6 : isHovered ? 1.4 : 1.0;

            const svgX = lonToSvgX(d.centroid_lon);
            const svgY = latToSvgY(d.centroid_lat);

            return (
              <g
                key={`centroid-${d.district_id}`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => handleDistrictClick(d)}
                onMouseEnter={() => setHoveredDistrict(d)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Heavy Rainfall Exceedance Pulse */}
                {val > 35 && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={radius * 2.4}
                    fill={color}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Selection Halo */}
                {isSelected && (
                  <circle
                    cx={svgX}
                    cy={svgY}
                    r={radius * 2.0}
                    fill="none"
                    stroke="#42D9F5"
                    strokeWidth="0.3"
                    strokeDasharray="0.6 0.3"
                  />
                )}

                {/* Core District Node */}
                <circle
                  cx={svgX}
                  cy={svgY}
                  r={radius}
                  fill={color}
                  stroke={isSelected ? '#42D9F5' : '#F5FAFF'}
                  strokeWidth={isSelected ? '0.4' : '0.15'}
                />

                {/* District Label with Computed Value */}
                <text
                  x={svgX + 1.4}
                  y={svgY + 0.35}
                  fontSize="0.95"
                  fill="#F5FAFF"
                  fontWeight={isSelected ? 'bold' : '500'}
                  className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-sans"
                >
                  {d.district_name.split(' ')[0]} ({val.toFixed(0)}
                  {activeLayer === 'PROB_HEAVY' ? '%' : 'mm'})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Rainfall Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
          <RainfallLegend />
        </div>

        {/* Live Hover Tooltip */}
        {hoveredDistrict && !selectedDistrict && (
          <div className="absolute top-16 right-4 z-20 bg-[#0D2233]/95 backdrop-blur border border-[#42D9F5]/40 rounded-lg p-3 shadow-xl text-xs space-y-1 max-w-[220px] pointer-events-none animate-in fade-in duration-150">
            <div className="font-bold text-[#F5FAFF]">{hoveredDistrict.district_name}</div>
            <div className="text-[11px] text-[#A6BACD]">{hoveredDistrict.state_name}</div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-[#28475C]">
              <span className="text-[#A6BACD]">REGNOVA AI:</span>
              <span className="font-bold text-[#42D9F5] font-mono">
                {hoveredDistrict.regnova_corrected_rainfall_mm.toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#A6BACD]">Raw NWP:</span>
              <span className="font-bold text-[#A6BACD] font-mono">
                {hoveredDistrict.raw_nwp_rainfall_mm.toFixed(1)} mm
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-[#17B897]">
              <span>Heavy Rain (&gt;35mm):</span>
              <span className="font-mono font-bold">{hoveredDistrict.prob_heavy_rain_gt35_pct.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* Selected District HUD Panel */}
        {selectedDistrict && (
          <div className="absolute top-16 right-4 z-20 w-80 bg-[#12304A]/95 backdrop-blur-md border border-[#42D9F5]/50 rounded-xl p-4 shadow-2xl text-xs space-y-3 animate-in slide-in-from-right-2 duration-200">
            <div className="flex items-center justify-between border-b border-[#28475C] pb-2">
              <div>
                <h4 className="font-bold text-[#F5FAFF] text-sm flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-[#42D9F5]" />
                  <span>{selectedDistrict.district_name}</span>
                </h4>
                <p className="text-[11px] text-[#A6BACD]">{selectedDistrict.state_name}</p>
              </div>
              <button
                onClick={() => setSelectedDistrict(null)}
                className="w-5 h-5 rounded hover:bg-[#071522] flex items-center justify-center text-[#A6BACD] hover:text-white transition-colors"
                title="Close Info Panel"
              >
                ✕
              </button>
            </div>

            {/* Side by Side Comparative Rain Numbers */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-[#071522] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[#A6BACD] text-[10px] uppercase tracking-wider block">REGNOVA (AI)</span>
                <div className="text-lg font-bold text-[#42D9F5] font-mono mt-0.5">
                  {selectedDistrict.regnova_corrected_rainfall_mm.toFixed(1)}{' '}
                  <span className="text-[10px] text-white">mm</span>
                </div>
              </div>
              <div className="bg-[#071522] p-2.5 rounded-lg border border-[#28475C]">
                <span className="text-[#A6BACD] text-[10px] uppercase tracking-wider block">Raw NWP Physics</span>
                <div className="text-lg font-bold text-[#A6BACD] font-mono mt-0.5">
                  {selectedDistrict.raw_nwp_rainfall_mm.toFixed(1)}{' '}
                  <span className="text-[10px] text-white">mm</span>
                </div>
              </div>
            </div>

            {/* Multi-Threshold Exceedance Probabilities */}
            <div className="space-y-1.5 text-[11px] text-[#A6BACD] bg-[#071522]/60 p-2.5 rounded-lg border border-[#28475C]">
              <div className="flex justify-between">
                <span>Heavy Rain (&gt;35 mm/24h):</span>
                <span className="font-semibold text-[#F5FAFF] font-mono">
                  {selectedDistrict.prob_heavy_rain_gt35_pct.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Very Heavy (&gt;64 mm/24h):</span>
                <span className="font-semibold text-[#F5FAFF] font-mono">
                  {selectedDistrict.prob_vheavy_rain_gt64_pct.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Extremely Heavy (&gt;115 mm/24h):</span>
                <span className="font-semibold text-[#F2BC63] font-mono">
                  {selectedDistrict.prob_extheavy_rain_gt115_pct.toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#28475C]/60 text-[10px]">
                <span>Uncertainty Spread (±1σ):</span>
                <span className="font-bold text-[#17B897] font-mono">
                  ±{selectedDistrict.uncertainty_std_mm.toFixed(1)} mm
                </span>
              </div>
            </div>

            {/* Regime Assignment */}
            <div className="flex items-center justify-between text-[11px] bg-[#071522] px-2.5 py-1.5 rounded-lg border border-[#28475C]">
              <span className="text-[#A6BACD]">Active Regime:</span>
              <span className="font-mono text-[#42D9F5] font-semibold">
                {selectedDistrict.active_regime.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cartographic Attribution Bar */}
      <div className="px-3 py-1 bg-[#050E17] border-t border-[#28475C] text-[10px] text-[#A6BACD]/70 flex flex-wrap items-center justify-between gap-2">
        <span>Attribution: Standard Survey of India Aligned Boundaries • IMD Meteorological Grids</span>
        <span>REGNOVA Post-Processing Engine v1.0.0</span>
      </div>
    </div>
  );
};
