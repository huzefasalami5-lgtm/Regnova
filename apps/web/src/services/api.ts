import {
  HealthCheckResponse,
  DistrictInfo,
  ForecastRunResponse,
  EvaluationRunResponse,
  AgentRunResponse,
  RegimePredictionResponse,
  AtmosphericPredictors,
  DataMode,
} from '../types';

const API_ROOT = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_BASE = API_ROOT ? `${API_ROOT.replace(/\/+$/, '')}/api/v1` : '/api/v1';

export const api = {
  async getHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getDistricts(): Promise<DistrictInfo[]> {
    const res = await fetch(`${API_BASE}/districts`);
    if (!res.ok) throw new Error('Failed to load districts');
    return res.json();
  },

  async getLatestForecast(): Promise<ForecastRunResponse> {
    const res = await fetch(`${API_BASE}/forecasts/latest`);
    if (!res.ok) throw new Error('Failed to load forecast');
    return res.json();
  },

  async runForecast(params: {
    lead_time_hours: number;
    atmospheric_predictors?: AtmosphericPredictors;
    data_mode?: DataMode;
  }): Promise<ForecastRunResponse> {
    const res = await fetch(`${API_BASE}/forecasts/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to execute forecast correction');
    return res.json();
  },

  async predictRegime(predictors: AtmosphericPredictors): Promise<RegimePredictionResponse> {
    const res = await fetch(`${API_BASE}/regimes/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(predictors),
    });
    if (!res.ok) throw new Error('Regime prediction failed');
    return res.json();
  },

  async getLatestEvaluation(): Promise<EvaluationRunResponse> {
    const res = await fetch(`${API_BASE}/evaluations/latest`);
    if (!res.ok) throw new Error('Failed to load evaluation benchmark');
    return res.json();
  },

  async runEvaluation(): Promise<EvaluationRunResponse> {
    const res = await fetch(`${API_BASE}/evaluations/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run evaluation benchmark');
    return res.json();
  },

  async runAgentWorkflow(): Promise<AgentRunResponse> {
    const res = await fetch(`${API_BASE}/agents/workflows/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run agent workflow');
    return res.json();
  },

  async runSihDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/sih-demo/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to execute SIH demonstration');
    return res.json();
  },

  async getIndiaStatesGeoJson(): Promise<any> {
    const res = await fetch(`${API_BASE}/geo/states`);
    if (!res.ok) throw new Error('Failed to load state boundary GeoJSON');
    return res.json();
  },

  async getDistrictsGeoJson(): Promise<any> {
    const res = await fetch(`${API_BASE}/geo/districts`);
    if (!res.ok) throw new Error('Failed to load district boundary GeoJSON');
    return res.json();
  },

  async getWorldContextGeoJson(): Promise<any> {
    const res = await fetch(`${API_BASE}/geo/world`);
    if (!res.ok) throw new Error('Failed to load world boundary GeoJSON');
    return res.json();
  },

  async getAgentRunsHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/agents/runs`);
    if (!res.ok) throw new Error('Failed to load agent runs history');
    return res.json();
  },
};
