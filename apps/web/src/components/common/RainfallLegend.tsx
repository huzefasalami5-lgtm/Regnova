import React from 'react';

export const RainfallLegend: React.FC = () => {
  const categories = [
    { label: '0 - 2.5 mm (No/Light Rain)', color: '#1E293B' },
    { label: '2.5 - 15.5 mm (Moderate)', color: '#0284C7' },
    { label: '15.6 - 35.5 mm (Rather Heavy)', color: '#38BDF8' },
    { label: '35.6 - 64.5 mm (Heavy)', color: '#4ADE80' },
    { label: '64.6 - 115.5 mm (Very Heavy)', color: '#FACC15' },
    { label: '115.6 - 204.4 mm (Extremely Heavy)', color: '#FB923C' },
    { label: '> 204.4 mm (Exceptional)', color: '#F43F5E' },
  ];

  return (
    <div className="bg-[#12304A]/90 backdrop-blur border border-[#28475C] p-3 rounded-lg text-xs shadow-lg">
      <div className="font-semibold text-[#F5FAFF] mb-2 flex items-center justify-between">
        <span>IMD Rainfall Classification (mm/24h)</span>
        <span className="text-[10px] text-[#A6BACD]">Units: mm</span>
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center space-x-2">
            <span
              className="w-3.5 h-3.5 rounded-sm flex-shrink-0 border border-white/20"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-[#A6BACD] text-[11px]">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
