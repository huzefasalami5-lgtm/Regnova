export type DataMode = 'LIVE_VERIFIED' | 'HISTORICAL_REPLAY' | 'SYNTHETIC_DEMO' | 'UNAVAILABLE';

export type RegimeType =
  | 'ACTIVE_MONSOON'
  | 'BREAK_MONSOON'
  | 'DEPRESSION'
  | 'COAST_TERRAIN'
  | 'TRANSITION_OR_UNKNOWN';

export interface AtmosphericPredictors {
  precipitable_water_mm: number;
  relative_humidity_850hpa_pct: number;
  u_wind_850hpa_ms: number;
  v_wind_850hpa_ms: number;
  mean_sea_level_pressure_hpa: number;
  vorticity_850hpa_s1: number;
  monsoon_trough_latitude_deg: number;
  terrain_elevation_m?: number;
  coastal_distance_km?: number;
}

export interface RegimeProbabilityBreakdown {
  ACTIVE_MONSOON: number;
  BREAK_MONSOON: number;
  DEPRESSION: number;
  COAST_TERRAIN: number;
  TRANSITION_OR_UNKNOWN: number;
}

export interface RegimePredictionResponse {
  primary_regime: RegimeType;
  probabilities: RegimeProbabilityBreakdown;
  gating_weights: Record<string, number>;
  confidence_score: number;
  predictor_evidence: Record<string, any>;
  rule_or_model_provenance: string;
  timestamp: string;
}

export interface DistrictInfo {
  district_id: string;
  district_name: string;
  state_name: string;
  centroid_lat: number;
  centroid_lon: number;
  terrain_elevation_m: number;
  coastal_proximity_km: number;
  climatological_mean_jjas_mm: number;
}

export interface DistrictForecastItem {
  district_id: string;
  district_name: string;
  state_name: string;
  centroid_lat: number;
  centroid_lon: number;
  raw_nwp_rainfall_mm: number;
  global_ml_rainfall_mm: number;
  regnova_corrected_rainfall_mm: number;
  observed_rainfall_mm?: number | null;
  prob_heavy_rain_gt35_pct: number;
  prob_vheavy_rain_gt64_pct: number;
  prob_extheavy_rain_gt115_pct: number;
  uncertainty_std_mm: number;
  active_regime: RegimeType;
  expert_weights: Record<string, number>;
  data_mode: DataMode;
}

export interface ForecastRunResponse {
  forecast_run_id: string;
  issue_time: string;
  valid_time: string;
  lead_time_hours: number;
  data_mode: DataMode;
  model_version: string;
  regime_summary: RegimePredictionResponse;
  districts: DistrictForecastItem[];
  notes?: string;
  created_at: string;
}

export interface CategoricalVerification {
  threshold_mm: number;
  csi: number;
  ets: number;
  pod: number;
  far: number;
  sample_count: number;
}

export interface ModelEvaluationMetrics {
  model_name: string;
  rmse_mm: number;
  mae_mm: number;
  bias_mm: number;
  correlation: number;
  brier_score_gt35mm: number;
  categorical_metrics: CategoricalVerification[];
  sample_count: number;
}

export interface EvaluationRunResponse {
  evaluation_id: string;
  dataset_name: string;
  data_mode: DataMode;
  test_period_start: string;
  test_period_end: string;
  raw_nwp_metrics: ModelEvaluationMetrics;
  global_ml_metrics: ModelEvaluationMetrics;
  regnova_metrics: ModelEvaluationMetrics;
  stratified_by_regime: Record<string, { raw_nwp_rmse: number; regnova_rmse: number; sample_count: number }>;
  stratified_by_lead_time: Record<string, { raw_nwp_rmse: number; regnova_rmse: number; sample_count: number }>;
  cases_regnova_improved_count: number;
  cases_regnova_degraded_count: number;
  total_evaluation_samples: number;
  created_at: string;
}

export interface AgentEventLog {
  timestamp: string;
  agent_name: string;
  step_name: string;
  action_type: string;
  tool_name?: string;
  input_payload?: Record<string, any>;
  output_summary?: string;
  status: string;
  duration_ms: number;
}

export interface AgentRunResponse {
  run_id: string;
  workflow_name: string;
  status: string;
  started_at: string;
  completed_at?: string;
  data_mode: DataMode;
  events: AgentEventLog[];
  summary_report: string;
  evidence: Record<string, any>;
  approval_required: boolean;
  approved_by?: string;
}

export interface HealthCheckResponse {
  status: string;
  database: string;
  ml_models_ready: boolean;
  agents_ready: boolean;
  data_mode: DataMode;
  timestamp: string;
}
