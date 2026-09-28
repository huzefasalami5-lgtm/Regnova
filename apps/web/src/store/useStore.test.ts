import { describe, it, expect } from 'vitest';
import { useStore } from './useStore';

describe('useStore Zustand Store', () => {
  it('initializes with default state values', () => {
    const state = useStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.activeLeadTime).toBe(24);
    expect(state.activeLayer).toBe('REGNOVA');
    expect(state.dataMode).toBe('SYNTHETIC_DEMO');
    expect(state.selectedDistrict).toBeNull();
  });

  it('updates lead time correctly', () => {
    useStore.getState().setActiveLeadTime(48);
    expect(useStore.getState().activeLeadTime).toBe(48);
  });

  it('updates active layer correctly', () => {
    useStore.getState().setActiveLayer('RAW_NWP');
    expect(useStore.getState().activeLayer).toBe('RAW_NWP');
  });

  it('updates data mode correctly', () => {
    useStore.getState().setDataMode('LIVE_VERIFIED');
    expect(useStore.getState().dataMode).toBe('LIVE_VERIFIED');
  });
});
