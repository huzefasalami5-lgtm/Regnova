import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Sliders,
  SplitSquareVertical,
  Bot,
  BarChart3,
  MapPin,
  Sparkles,
  Home,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Overview', icon: Home },
    { to: '/command-center', label: 'Command Center', icon: LayoutDashboard },
    { to: '/regime-studio', label: 'R-GATE Regime', icon: Compass },
    { to: '/forecast-studio', label: 'Forecast Studio', icon: Sliders },
    { to: '/comparison-lab', label: 'Comparison Lab', icon: SplitSquareVertical },
    { to: '/agent-room', label: 'AI Agent Room', icon: Bot },
    { to: '/evaluation-lab', label: 'Evaluation Lab', icon: BarChart3 },
    { to: '/district-guidance', label: 'District Guidance', icon: MapPin },
    { to: '/sih-demo', label: 'SIH Presentation', icon: Sparkles },
  ];

  return (
    <aside className="w-56 bg-[#0D2233] border-r border-[#28475C] flex flex-col justify-between p-3 flex-shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-[#A6BACD]/70">
          Atmospheric Suite
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#12304A] text-[#42D9F5] border-l-2 border-[#42D9F5] shadow-inner font-semibold'
                    : 'text-[#A6BACD] hover:text-[#F5FAFF] hover:bg-[#12304A]/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-[#071522]/80 border border-[#28475C] rounded-lg text-[11px] text-[#A6BACD]">
        <div className="text-white font-medium mb-0.5">Team VYSTRAL</div>
        <div className="mt-1 text-[9px] text-[#A6BACD]/80">Research AI Prototype</div>
      </div>
    </aside>
  );
};
