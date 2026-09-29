import {
  AtmosphericPredictors,
  DataMode,
  DistrictForecastItem,
  EvaluationRunResponse,
  ForecastRunResponse,
  RegimePredictionResponse,
  RegimeType,
  AgentRunResponse,
} from '../types';
import indiaDistrictsData from '../data/geo/india_districts.json';

export const DEFAULT_PREDICTORS: AtmosphericPredictors = {
  precipitable_water_mm: 62.0,
  relative_humidity_850hpa_pct: 88.0,
  u_wind_850hpa_ms: 14.0,
  v_wind_850hpa_ms: 4.5,
  mean_sea_level_pressure_hpa: 998.0,
  vorticity_850hpa_s1: 0.000045,
  monsoon_trough_latitude_deg: 23.5,
};

export function classifyRegime(predictors: AtmosphericPredictors = DEFAULT_PREDICTORS): RegimePredictionResponse {
  const pw = predictors.precipitable_water_mm;
  const rh = predictors.relative_humidity_850hpa_pct;
  const u = predictors.u_wind_850hpa_ms;
  const p = predictors.mean_sea_level_pressure_hpa;
  const vort = predictors.vorticity_850hpa_s1;
  const troughLat = predictors.monsoon_trough_latitude_deg;

  let activeScore = 0.2;
  let breakScore = 0.1;
  let depScore = 0.1;
  let coastScore = 0.1;
  let transScore = 0.1;

  if (p < 996 || vort > 0.00006) {
    depScore += 2.5;
  }
  if (troughLat > 26 || (rh < 65 && pw < 45)) {
    breakScore += 2.2;
  } else if (pw > 55 && rh > 80 && u > 10) {
    activeScore += 2.0;
  }

  if (u > 12 && pw > 58) {
    coastScore += 1.4;
  }

  const sum = activeScore + breakScore + depScore + coastScore + transScore;
  const pActive = activeScore / sum;
  const pBreak = breakScore / sum;
  const pDep = depScore / sum;
  const pCoast = coastScore / sum;
  const pTrans = transScore / sum;

  let primary: RegimeType = 'ACTIVE_MONSOON';
  let maxP = pActive;

  if (pDep > maxP) {
    primary = 'DEPRESSION';
    maxP = pDep;
  }
  if (pBreak > maxP) {
    primary = 'BREAK_MONSOON';
    maxP = pBreak;
  }
  if (pCoast > maxP) {
    primary = 'COAST_TERRAIN';
    maxP = pCoast;
  }
  if (pTrans > maxP) {
    primary = 'TRANSITION_OR_UNKNOWN';
    maxP = pTrans;
  }

  return {
    primary_regime: primary,
    probabilities: {
      ACTIVE_MONSOON: Math.round(pActive * 1000) / 1000,
      BREAK_MONSOON: Math.round(pBreak * 1000) / 1000,
      DEPRESSION: Math.round(pDep * 1000) / 1000,
      COAST_TERRAIN: Math.round(pCoast * 1000) / 1000,
      TRANSITION_OR_UNKNOWN: Math.round(pTrans * 1000) / 1000,
    },
    gating_weights: {
      active_monsoon_expert: Math.round(pActive * 1000) / 1000,
      break_monsoon_expert: Math.round(pBreak * 1000) / 1000,
      depression_expert: Math.round(pDep * 1000) / 1000,
      coast_terrain_expert: Math.round(pCoast * 1000) / 1000,
      global_fallback_expert: Math.round(pTrans * 1000) / 1000,
    },
    confidence_score: Math.round(maxP * 1000) / 1000,
    predictor_evidence: {
      precipitable_water: `${pw} mm`,
      relative_humidity: `${rh} %`,
      zonal_wind_850hpa: `${u} m/s`,
      mslp: `${p} hPa`,
      monsoon_trough_lat: `${troughLat}°N`,
    },
    rule_or_model_provenance: 'R-GATE Ensemble Soft-Gating Classifier v2.4 (Supabase Cloud Sync)',
    timestamp: new Date().toISOString(),
  };
}

export function generateForecastRun(
  leadTimeHours = 24,
  predictors: AtmosphericPredictors = DEFAULT_PREDICTORS,
  dataMode: DataMode = 'SYNTHETIC_DEMO'
): ForecastRunResponse {
  const regimeSummary = classifyRegime(predictors);
  const now = new Date();
  const validTime = new Date(now.getTime() + leadTimeHours * 3600 * 1000);

  const features = (indiaDistrictsData as any).features || [];
  const districts: DistrictForecastItem[] = features.map((f: any) => {
    const p = f.properties || {};
    const lat = p.lat || 20.5;
    const lon = p.lon || 78.9;

    let baseRain = 8.0;
    if (lat < 16 && lon < 76) baseRain += 42.0; // Western Ghats
    else if (lat > 20 && lat < 26 && lon > 82) baseRain += 34.0; // Northeast & East
    else if (lat > 26 && lon < 76) baseRain += 2.0; // Northwest Dry

    if (regimeSummary.primary_regime === 'ACTIVE_MONSOON') baseRain *= 1.45;
    else if (regimeSummary.primary_regime === 'BREAK_MONSOON') baseRain *= 0.35;
    else if (regimeSummary.primary_regime === 'DEPRESSION') baseRain *= 1.85;

    // NWP systematic wet bias
    const rawNwp = Math.max(0, Math.round((baseRain * 1.35 + Math.sin(lat * 3) * 4) * 10) / 10);
    const globalMl = Math.max(0, Math.round((baseRain * 0.92 + Math.cos(lon * 2) * 3) * 10) / 10);
    const regnovaCorrected = Math.max(0, Math.round(baseRain * 1.02 * 10) / 10);

    const heavyRainProb = Math.min(99.5, Math.max(1.0, Math.round((regnovaCorrected / 45.0) * 85 * 10) / 10));
    const vHeavyRainProb = Math.min(95.0, Math.max(0.5, Math.round((regnovaCorrected / 75.0) * 65 * 10) / 10));
    const extHeavyRainProb = Math.min(85.0, Math.max(0.0, Math.round((regnovaCorrected / 120.0) * 45 * 10) / 10));

    return {
      district_id: p.district_id || `DIST-${p.name || '001'}`,
      district_name: p.name || 'District',
      state_name: p.state || 'India',
      centroid_lat: lat,
      centroid_lon: lon,
      raw_nwp_rainfall_mm: rawNwp,
      global_ml_rainfall_mm: globalMl,
      regnova_corrected_rainfall_mm: regnovaCorrected,
      observed_rainfall_mm: Math.max(0, Math.round((regnovaCorrected + (Math.random() * 2 - 1)) * 10) / 10),
      prob_heavy_rain_gt35_pct: heavyRainProb,
      prob_vheavy_rain_gt64_pct: vHeavyRainProb,
      prob_extheavy_rain_gt115_pct: extHeavyRainProb,
      uncertainty_std_mm: Math.round((2.1 + regnovaCorrected * 0.08) * 10) / 10,
      active_regime: regimeSummary.primary_regime,
      expert_weights: regimeSummary.gating_weights,
      data_mode: dataMode,
    };
  });

  return {
    forecast_run_id: `FCST-${Date.now()}-${leadTimeHours}H`,
    issue_time: now.toISOString(),
    valid_time: validTime.toISOString(),
    lead_time_hours: leadTimeHours,
    data_mode: dataMode,
    model_version: 'REGNOVA-PROD-v2.6.4-SUPABASE',
    regime_summary: regimeSummary,
    districts,
    notes: 'Multi-scale adaptive post-processing powered by R-GATE & EXPERT-MIX',
    created_at: now.toISOString(),
  };
}

export function generateEvaluationRun(dataMode: DataMode = 'SYNTHETIC_DEMO'): EvaluationRunResponse {
  const now = new Date();
  return {
    evaluation_id: `EVAL-${Date.now()}-BENCHMARK`,
    dataset_name: 'IMD-JJAS-Monsoon-MultiYear-Partition',
    data_mode: dataMode,
    test_period_start: '2025-06-01T00:00:00Z',
    test_period_end: '2025-09-30T23:59:59Z',
    raw_nwp_metrics: {
      model_name: 'Raw ECMWF/NCMRWF NWP',
      rmse_mm: 14.82,
      mae_mm: 9.45,
      bias_mm: 4.12,
      correlation: 0.684,
      brier_score_gt35mm: 0.228,
      categorical_metrics: [
        { threshold_mm: 35.5, csi: 0.442, ets: 0.315, pod: 0.612, far: 0.384, sample_count: 8520 },
        { threshold_mm: 64.5, csi: 0.318, ets: 0.214, pod: 0.472, far: 0.491, sample_count: 3240 },
        { threshold_mm: 115.5, csi: 0.185, ets: 0.112, pod: 0.310, far: 0.610, sample_count: 980 },
      ],
      sample_count: 24500,
    },
    global_ml_metrics: {
      model_name: 'Global ML Baseline (GraphCast / Pangu)',
      rmse_mm: 11.24,
      mae_mm: 7.15,
      bias_mm: -1.45,
      correlation: 0.772,
      brier_score_gt35mm: 0.174,
      categorical_metrics: [
        { threshold_mm: 35.5, csi: 0.526, ets: 0.402, pod: 0.718, far: 0.312, sample_count: 8520 },
        { threshold_mm: 64.5, csi: 0.412, ets: 0.301, pod: 0.584, far: 0.395, sample_count: 3240 },
        { threshold_mm: 115.5, csi: 0.264, ets: 0.182, pod: 0.425, far: 0.510, sample_count: 980 },
      ],
      sample_count: 24500,
    },
    regnova_metrics: {
      model_name: 'REGNOVA Regime-Adaptive AI',
      rmse_mm: 7.64,
      mae_mm: 4.82,
      bias_mm: 0.28,
      correlation: 0.891,
      brier_score_gt35mm: 0.098,
      categorical_metrics: [
        { threshold_mm: 35.5, csi: 0.738, ets: 0.624, pod: 0.884, far: 0.182, sample_count: 8520 },
        { threshold_mm: 64.5, csi: 0.642, ets: 0.528, pod: 0.812, far: 0.245, sample_count: 3240 },
        { threshold_mm: 115.5, csi: 0.495, ets: 0.394, pod: 0.690, far: 0.340, sample_count: 980 },
      ],
      sample_count: 24500,
    },
    stratified_by_regime: {
      ACTIVE_MONSOON: { raw_nwp_rmse: 16.4, regnova_rmse: 8.1, sample_count: 9800 },
      BREAK_MONSOON: { raw_nwp_rmse: 9.8, regnova_rmse: 4.2, sample_count: 5200 },
      DEPRESSION: { raw_nwp_rmse: 24.2, regnova_rmse: 11.5, sample_count: 3400 },
      COAST_TERRAIN: { raw_nwp_rmse: 18.7, regnova_rmse: 9.2, sample_count: 4300 },
      TRANSITION_OR_UNKNOWN: { raw_nwp_rmse: 12.1, regnova_rmse: 6.9, sample_count: 1800 },
    },
    stratified_by_lead_time: {
      '+24h': { raw_nwp_rmse: 12.2, regnova_rmse: 6.1, sample_count: 8200 },
      '+48h': { raw_nwp_rmse: 14.9, regnova_rmse: 7.8, sample_count: 8200 },
      '+72h': { raw_nwp_rmse: 17.4, regnova_rmse: 9.1, sample_count: 8100 },
    },
    cases_regnova_improved_count: 21870,
    cases_regnova_degraded_count: 2630,
    total_evaluation_samples: 24500,
    created_at: now.toISOString(),
  };
}

export function generateAgentWorkflowRun(): AgentRunResponse {
  const now = new Date();
  return {
    run_id: `AGENT-${Date.now()}`,
    workflow_name: 'REGNOVA-6-STAGE-METEOROLOGICAL-PIPELINE',
    status: 'COMPLETED',
    started_at: new Date(now.getTime() - 2000).toISOString(),
    completed_at: now.toISOString(),
    data_mode: 'SYNTHETIC_DEMO',
    summary_report:
      'Multi-agent regime identification, correction fusion, probability calibration, and advisory generation completed with 0 errors.',
    evidence: {
      nwp_stations: 734,
      regime: 'ACTIVE_MONSOON',
      rmse_improvement: '48.4%',
      advisories_published: 57,
    },
    approval_required: false,
    events: [
      {
        timestamp: new Date(now.getTime() - 1800).toISOString(),
        agent_name: 'DATA_INGESTION_AGENT',
        step_name: 'ingest_nwp_and_radar',
        action_type: 'DATA_INGESTION',
        status: 'SUCCESS',
        duration_ms: 240,
        output_summary: 'Ingested raw NWP grids, radar composites, and AWS telemetry across 734 districts.',
      },
      {
        timestamp: new Date(now.getTime() - 1400).toISOString(),
        agent_name: 'REGIME_CLASSIFICATION_AGENT',
        step_name: 'classify_synoptic_regime',
        action_type: 'REGIME_CLASSIFICATION',
        status: 'SUCCESS',
        duration_ms: 310,
        output_summary: 'Identified synoptic regime: ACTIVE MONSOON with 92.4% confidence using R-GATE.',
      },
      {
        timestamp: new Date(now.getTime() - 1000).toISOString(),
        agent_name: 'EXPERT_FUSION_AGENT',
        step_name: 'fuse_correction_experts',
        action_type: 'ML_CORRECTION',
        status: 'SUCCESS',
        duration_ms: 390,
        output_summary: 'Synthesized 5 specialized correction experts via dynamic soft-gating weights.',
      },
      {
        timestamp: new Date(now.getTime() - 650).toISOString(),
        agent_name: 'CALIBRATION_AGENT',
        step_name: 'calibrate_quantile_probabilities',
        action_type: 'UNCERTAINTY_CALIBRATION',
        status: 'SUCCESS',
        duration_ms: 280,
        output_summary: 'Calibrated RAIN-CAL quantile exceedance distributions (>35.5mm, >64.5mm, >115.5mm).',
      },
      {
        timestamp: new Date(now.getTime() - 300).toISOString(),
        agent_name: 'VERIFICATION_QC_AGENT',
        step_name: 'verify_physical_conservation',
        action_type: 'VERIFICATION_AUDIT',
        status: 'SUCCESS',
        duration_ms: 180,
        output_summary: 'Quality control verified: zero negative precipitation, physical bounds compliant.',
      },
      {
        timestamp: now.toISOString(),
        agent_name: 'ADVISORY_GENERATOR_AGENT',
        step_name: 'generate_district_bulletins',
        action_type: 'ADVISORY_DISPATCH',
        status: 'SUCCESS',
        duration_ms: 140,
        output_summary: 'Generated operational meteorological bulletins and color-coded district alerts.',
      },
    ],
  };
}
