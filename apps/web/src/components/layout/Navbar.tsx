import React from 'react';
import { CloudRain, Sun, Moon, Play, Activity } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { DataModeBadge } from '../common/DataModeBadge';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, dataMode } = useStore();

  return (
    <header className="h-14 bg-[#0D2233] border-b border-[#28475C] px-4 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#42D9F5] to-[#17B897] p-0.5 flex items-center justify-center shadow-lg shadow-[#42D9F5]/10">
            <div className="w-full h-full bg-[#071522] rounded-[6px] flex items-center justify-center">
              <CloudRain className="w-4 h-4 text-[#42D9F5] group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wider text-base text-[#F5FAFF]">REGNOVA</span>
              <span className="text-[10px] bg-[#12304A] text-[#42D9F5] px-1.5 py-0.2 rounded font-mono border border-[#28475C]">SIH26080</span>
            </div>
            <p className="text-[10px] text-[#A6BACD] tracking-tight">Regime-Adaptive AI Post-Processing</p>
          </div>
        </Link>

        <DataModeBadge mode={dataMode} />
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/sih-demo"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-[#42D9F5]/20 to-[#17B897]/20 hover:from-[#42D9F5]/30 hover:to-[#17B897]/30 border border-[#42D9F5]/40 text-[#42D9F5] text-xs font-semibold shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>RUN SIH DEMO</span>
        </Link>

        <div className="h-4 w-px bg-[#28475C]" />

        <div className="flex items-center space-x-1.5 text-xs text-[#A6BACD] bg-[#12304A] px-2.5 py-1 rounded border border-[#28475C]">
          <Activity className="w-3.5 h-3.5 text-[#17B897] animate-pulse" />
          <span className="hidden sm:inline">Engine:</span>
          <span className="text-[#F5FAFF] font-mono">ONLINE (v1.0.0)</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-[#A6BACD] hover:text-[#F5FAFF] hover:bg-[#12304A] transition-colors"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
