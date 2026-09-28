"""Pydantic v2 schemas and data contracts for REGNOVA."""
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


def utc_now():
    return datetime.now(timezone.utc)


class DataMode(str, Enum):
    LIVE_VERIFIED = "LIVE_VERIFIED"
    HISTORICAL_REPLAY = "HISTORICAL_REPLAY"
    SYNTHETIC_DEMO = "SYNTHETIC_DEMO"
    UNAVAILABLE = "UNAVAILABLE"


class RegimeType(str, Enum):
    ACTIVE_MONSOON = "ACTIVE_MONSOON"
    BREAK_MONSOON = "BREAK_MONSOON"
    DEPRESSION = "DEPRESSION"
    COAST_TERRAIN = "COAST_TERRAIN"
    TRANSITION_OR_UNKNOWN = "TRANSITION_OR_UNKNOWN"


class ModelArchitecture(str, Enum):
    RAW_NWP = "RAW_NWP"
    GLOBAL_XGBOOST = "GLOBAL_XGBOOST"
    EXPERT_MIX_REGNOVA = "EXPERT_MIX_REGNOVA"


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SCIENTIST = "SCIENTIST"
    FORECAST_ANALYST = "FORECAST_ANALYST"
    DISTRICT_OFFICER = "DISTRICT_OFFICER"
    DEMO_VIEWER = "DEMO_VIEWER"


class AtmosphericPredictors(BaseModel):
    precipitable_water_mm: float = Field(..., description="Total precipitable water in mm (column integrated)")
    relative_humidity_850hpa_pct: float = Field(..., description="850 hPa relative humidity percentage")
    u_wind_850hpa_ms: float = Field(..., description="Zonal wind component at 850 hPa (m/s)")
    v_wind_850hpa_ms: float = Field(..., description="Meridional wind component at 850 hPa (m/s)")
    mean_sea_level_pressure_hpa: float = Field(..., description="MSLP in hPa")
    vorticity_850hpa_s1: float = Field(..., description="Relative vorticity at 850 hPa (10^-5 s^-1)")
    monsoon_trough_latitude_deg: float = Field(..., description="Position of monsoon trough latitude in degrees North")
    terrain_elevation_m: float = Field(default=0.0, description="Mean district elevation in meters")
    coastal_distance_km: float = Field(default=100.0, description="Distance from coastline in km")


class RegimeProbabilityBreakdown(BaseModel):
    ACTIVE_MONSOON: float = Field(..., ge=0.0, le=1.0)
    BREAK_MONSOON: float = Field(..., ge=0.0, le=1.0)
    DEPRESSION: float = Field(..., ge=0.0, le=1.0)
    COAST_TERRAIN: float = Field(..., ge=0.0, le=1.0)
    TRANSITION_OR_UNKNOWN: float = Field(..., ge=0.0, le=1.0)


class RegimePredictionResponse(BaseModel):
    primary_regime: RegimeType
    probabilities: RegimeProbabilityBreakdown
    gating_weights: Dict[str, float]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    predictor_evidence: Dict[str, Any]
    rule_or_model_provenance: str
    timestamp: datetime = Field(default_factory=utc_now)


class DistrictInfo(BaseModel):
    district_id: str
    district_name: str
    state_name: str
    centroid_lat: float
    centroid_lon: float
    terrain_elevation_m: float
    coastal_proximity_km: float
    climatological_mean_jjas_mm: float


class DistrictForecastItem(BaseModel):
    district_id: str
    district_name: str
    state_name: str
    centroid_lat: float
    centroid_lon: float
    raw_nwp_rainfall_mm: float
    global_ml_rainfall_mm: float
    regnova_corrected_rainfall_mm: float
    observed_rainfall_mm: Optional[float] = None
    prob_heavy_rain_gt35_pct: float = Field(..., ge=0.0, le=100.0)
    prob_vheavy_rain_gt64_pct: float = Field(..., ge=0.0, le=100.0)
    prob_extheavy_rain_gt115_pct: float = Field(..., ge=0.0, le=100.0)
    uncertainty_std_mm: float
    active_regime: RegimeType
    expert_weights: Dict[str, float]
    data_mode: DataMode


class ForecastRunResponse(BaseModel):
    forecast_run_id: str
    issue_time: datetime
    valid_time: datetime
    lead_time_hours: int
    data_mode: DataMode
    model_version: str
    regime_summary: RegimePredictionResponse
    districts: List[DistrictForecastItem]
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now)


class CategoricalVerification(BaseModel):
    threshold_mm: float
    csi: float
    ets: float
    pod: float
    far: float
    sample_count: int


class ModelEvaluationMetrics(BaseModel):
    model_name: str
    rmse_mm: float
    mae_mm: float
    bias_mm: float
    correlation: float
    brier_score_gt35mm: float
    categorical_metrics: List[CategoricalVerification]
    sample_count: int


class EvaluationRunResponse(BaseModel):
    evaluation_id: str
    dataset_name: str
    data_mode: DataMode
    test_period_start: datetime
    test_period_end: datetime
    raw_nwp_metrics: ModelEvaluationMetrics
    global_ml_metrics: ModelEvaluationMetrics
    regnova_metrics: ModelEvaluationMetrics
    stratified_by_regime: Dict[str, Dict[str, float]]
    stratified_by_lead_time: Dict[str, Dict[str, float]]
    cases_regnova_improved_count: int
    cases_regnova_degraded_count: int
    total_evaluation_samples: int
    created_at: datetime = Field(default_factory=utc_now)


class AgentEventLog(BaseModel):
    timestamp: datetime = Field(default_factory=utc_now)
    agent_name: str
    step_name: str
    action_type: str
    tool_name: Optional[str] = None
    input_payload: Optional[Dict[str, Any]] = None
    output_summary: Optional[str] = None
    status: str
    duration_ms: int = 0


class AgentRunResponse(BaseModel):
    run_id: str
    workflow_name: str
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    data_mode: DataMode
    events: List[AgentEventLog]
    summary_report: str
    evidence: Dict[str, Any] = Field(default_factory=dict)
    approval_required: bool = False
    approved_by: Optional[str] = None


class SystemMetadataResponse(BaseModel):
    system_name: str = "REGNOVA — Regime-Adaptive AI for Monsoon Forecast Correction"
    version: str = "1.0.0-SIH26080"
    team: str = "VYSTRAL"
    problem_statement: str = "SIH26080"
    supported_data_modes: List[DataMode] = [
        DataMode.SYNTHETIC_DEMO,
        DataMode.HISTORICAL_REPLAY,
        DataMode.LIVE_VERIFIED,
        DataMode.UNAVAILABLE,
    ]
    supported_lead_times_hours: List[int] = [24, 48, 72]
    rainfall_thresholds_mm: Dict[str, float] = {
        "Moderate": 15.6,
        "Heavy (>35.5mm)": 35.5,
        "Very Heavy (>64.5mm)": 64.5,
        "Extremely Heavy (>115.5mm)": 115.5,
        "Exceptionally Heavy (>204.4mm)": 204.4,
    }
    regime_definitions: Dict[str, str] = {
        "ACTIVE_MONSOON": "Widespread monsoon rainfall with strong low-level westerly jet and active trough.",
        "BREAK_MONSOON": "Suppressed rainfall over core monsoon zone with shift of trough to Himalayan foothills.",
        "DEPRESSION": "Organized synoptic low-pressure system/depression bringing localized extreme precipitation.",
        "COAST_TERRAIN": "Orographic enhancement along the Western Ghats and coastal convergence.",
        "TRANSITION_OR_UNKNOWN": "Equivocal atmospheric signals or transitional meteorological regime.",
    }


class HealthCheckResponse(BaseModel):
    status: str
    database: str
    ml_models_ready: bool
    agents_ready: bool
    data_mode: DataMode
    timestamp: datetime = Field(default_factory=utc_now)
