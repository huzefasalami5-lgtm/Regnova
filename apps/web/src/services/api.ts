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

const API_BASE = '/api/v1';

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
};
