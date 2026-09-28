import { create } from 'zustand';
import { DataMode, DistrictForecastItem, ForecastRunResponse } from '../types';

interface AppState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  selectedDistrict: DistrictForecastItem | null;
  setSelectedDistrict: (d: DistrictForecastItem | null) => void;
  activeLeadTime: number;
  setActiveLeadTime: (lead: number) => void;
  activeLayer: 'REGNOVA' | 'RAW_NWP' | 'GLOBAL_ML' | 'PROB_HEAVY';
  setActiveLayer: (layer: 'REGNOVA' | 'RAW_NWP' | 'GLOBAL_ML' | 'PROB_HEAVY') => void;
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
}

export const useStore = create<AppState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),
  selectedDistrict: null,
  setSelectedDistrict: (d) => set({ selectedDistrict: d }),
  activeLeadTime: 24,
  setActiveLeadTime: (lead) => set({ activeLeadTime: lead }),
  activeLayer: 'REGNOVA',
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  dataMode: 'SYNTHETIC_DEMO',
  setDataMode: (mode) => set({ dataMode: mode }),
}));
