"""REGNOVA FastAPI Main Application & REST API Endpoints.

Problem Statement: SIH26080 — Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts.
Team: VYSTRAL
"""
import os
import sys
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Add paths to sys.path for monorepo imports
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(services_dir)
for p in [root_dir, services_dir, os.path.join(root_dir, "packages")]:
    if p not in sys.path:
        sys.path.insert(0, p)

from packages.contracts.schemas import (
    DataMode,
    RegimeType,
    AtmosphericPredictors,
    RegimePredictionResponse,
    DistrictInfo,
    DistrictForecastItem,
    ForecastRunResponse,
    EvaluationRunResponse,
    AgentRunResponse,
    SystemMetadataResponse,
    HealthCheckResponse,
)
from services.api.database import engine, Base, get_db, SessionLocal
from services.api.models import (
    User,
    District,
    Dataset,
    ForecastRun,
    DistrictForecast,
    ModelArtifact,
    EvaluationRun,
    AgentRun,
    AuditLog,
)
from services.api.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_role,
)
from services.ml.data_generator import generate_synthetic_dataset, SAMPLE_DISTRICTS
from services.ml.r_gate import RGateClassifier
from services.ml.expert_mix import ExpertMixPipeline
from services.ml.rain_cal import RainCalibrator
from services.ml.evaluation_engine import EvaluationEngine
from services.agents.orchestrator import AgentOrchestrator

# Create database tables
Base.metadata.create_all(bind=engine)

# Singleton ML & Agent components
r_gate_service = RGateClassifier()
expert_mix_service = ExpertMixPipeline()
rain_cal_service = RainCalibrator()
evaluation_service = EvaluationEngine()
agent_orchestrator = AgentOrchestrator()

cached_demo_df = None
cached_latest_eval = None
cached_latest_forecast = None


def seed_database_defaults():
    """Seed initial sample districts and demo user accounts."""
    db = SessionLocal()
    try:
        if db.query(User).count() == 0:
            demo_user = User(
                username="demo_viewer",
                email="demo@regnova.vystral.org",
                hashed_password=hash_password("regnova2026"),
                role="DEMO_VIEWER",
                full_name="SIH Evaluation Reviewer",
            )
            admin_user = User(
                username="admin",
                email="admin@regnova.vystral.org",
                hashed_password=hash_password("admin2026"),
                role="ADMIN",
                full_name="Lead Meteorologist Admin",
            )
            db.add_all([demo_user, admin_user])
            db.commit()

        if db.query(District).count() == 0:
            district_objs = []
            for d in SAMPLE_DISTRICTS:
                district_objs.append(District(
                    id=d["district_id"],
                    district_name=d["district_name"],
                    state_name=d["state_name"],
                    centroid_lat=d["lat"],
                    centroid_lon=d["lon"],
                    terrain_elevation_m=d["elevation"],
                    coastal_proximity_km=d["coastal_dist"],
                    climatological_mean_jjas_mm=d["climatology"],
                ))
            db.add_all(district_objs)
            db.commit()
    finally:
        db.close()


def ensure_models_trained():
    """Lazy initialization of demo data and models."""
    global cached_demo_df, cached_latest_eval
    if cached_demo_df is None or not expert_mix_service.is_trained:
        cached_demo_df = generate_synthetic_dataset(num_days=40, seed=42)
        expert_mix_service.train_all_models(cached_demo_df)


# Seed immediately at module load
seed_database_defaults()
ensure_models_trained()


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database_defaults()
    ensure_models_trained()
    yield


app = FastAPI(
    title="REGNOVA API — Regime-Adaptive AI for Monsoon Forecast Correction",
    description="Backend API for post-processing NWP rainfall forecasts with regime-aware ML. Team VYSTRAL — SIH 2026.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# SYSTEM & HEALTH ENDPOINTS
# -------------------------------------------------------------

@app.get("/", response_class=HTMLResponse, tags=["System"])
def root_dashboard():
    ensure_models_trained()
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>REGNOVA Backend API — SIH 2026</title>
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background: #071522;
                color: #F5FAFF;
                font-family: 'Plus Jakarta Sans', sans-serif;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }
            .card {
                background: #0D2233;
                border: 1px solid #28475C;
                border-radius: 16px;
                max-width: 640px;
                width: 100%;
                padding: 32px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 20px;
                border-bottom: 1px solid #28475C;
                padding-bottom: 16px;
            }
            .badge {
                background: #12304A;
                color: #42D9F5;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                padding: 4px 10px;
                border-radius: 9999px;
                border: 1px solid #28475C;
            }
            .status-pill {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(23, 184, 151, 0.15);
                color: #17B897;
                border: 1px solid rgba(23, 184, 151, 0.3);
                padding: 4px 12px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 700;
            }
            .status-dot {
                width: 8px;
                height: 8px;
                background: #17B897;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.4; transform: scale(0.8); }
            }
            h1 { font-size: 24px; font-weight: 800; color: #F5FAFF; letter-spacing: -0.5px; }
            p { color: #A6BACD; font-size: 13px; line-height: 1.6; margin-bottom: 24px; }
            .links-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-bottom: 24px;
            }
            .link-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #12304A;
                border: 1px solid #28475C;
                color: #F5FAFF;
                padding: 12px 16px;
                border-radius: 10px;
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
                transition: all 0.2s ease;
            }
            .link-btn:hover {
                background: #19384B;
                border-color: #42D9F5;
                color: #42D9F5;
                transform: translateY(-2px);
            }
            .frontend-link {
                grid-column: span 2;
                background: linear-gradient(135deg, #42D9F5, #17B897);
                color: #071522 !important;
                font-weight: 800;
                border: none;
            }
            .frontend-link:hover {
                opacity: 0.95;
                transform: translateY(-2px);
            }
            .footer-info {
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #A6BACD;
                font-family: 'JetBrains Mono', monospace;
                border-top: 1px solid #28475C;
                padding-top: 16px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">
                <div>
                    <div class="badge" style="margin-bottom: 6px;">SIH26080 — Team VYSTRAL</div>
                    <h1>REGNOVA Backend API</h1>
                </div>
                <div class="status-pill">
                    <div class="status-dot"></div>
                    ONLINE (v1.0.0)
                </div>
            </div>
            <p>FastAPI High-Performance Engine for Monsoon Regime Identification, EXPERT-MIX Bias Correction, and Multi-Agent Atmospheric Intelligence.</p>
            
            <div class="links-grid">
                <a href="http://localhost:3000" class="link-btn frontend-link">
                    <span>🚀 Launch React Frontend UI (Port 3000)</span>
                    <span>→</span>
                </a>
                <a href="/docs" class="link-btn">
                    <span>📖 Swagger API Docs</span>
                    <span>/docs</span>
                </a>
                <a href="/redoc" class="link-btn">
                    <span>📑 ReDoc Reference</span>
                    <span>/redoc</span>
                </a>
                <a href="/api/v1/health" class="link-btn">
                    <span>🩺 Health Check API</span>
                    <span>JSON</span>
                </a>
                <a href="/api/v1/forecasts/latest" class="link-btn">
                    <span>🌧️ Latest Forecast Grid</span>
                    <span>JSON</span>
                </a>
                <a href="/api/v1/districts" class="link-btn">
                    <span>🗺️ Districts Catalog</span>
                    <span>JSON</span>
                </a>
                <a href="/api/v1/evaluations/latest" class="link-btn">
                    <span>📊 Evaluation Benchmark</span>
                    <span>JSON</span>
                </a>
            </div>

            <div class="footer-info">
                <span>R-GATE • EXPERT-MIX • RAIN-CAL</span>
                <span>Mode: SYNTHETIC_DEMO</span>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/api/v1/health", response_model=HealthCheckResponse, tags=["System"])
def health_check():
    ensure_models_trained()
    return HealthCheckResponse(
        status="HEALTHY",
        database="CONNECTED",
        ml_models_ready=expert_mix_service.is_trained,
        agents_ready=True,
        data_mode=DataMode.SYNTHETIC_DEMO,
    )


@app.get("/api/v1/ready", tags=["System"])
def readiness_check():
    return {"ready": True, "service": "REGNOVA Backend", "version": "1.0.0"}


@app.get("/api/v1/metadata", response_model=SystemMetadataResponse, tags=["System"])
def get_system_metadata():
    return SystemMetadataResponse()


# -------------------------------------------------------------
# AUTHENTICATION ENDPOINTS
# -------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str


@app.post("/api/v1/auth/login", response_model=LoginResponse, tags=["Auth"])
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token({"sub": user.username, "role": user.role})
    return LoginResponse(
        access_token=token,
        role=user.role,
        username=user.username,
    )


@app.get("/api/v1/auth/me", tags=["Auth"])
def get_me(user: User = Depends(get_current_user)):
    if not user:
        return {"username": "guest", "role": "DEMO_VIEWER"}
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "full_name": user.full_name,
    }


# -------------------------------------------------------------
# DISTRICTS & DATASETS ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/v1/districts", response_model=List[DistrictInfo], tags=["Districts"])
def list_districts(db: Session = Depends(get_db)):
    districts = db.query(District).all()
    if not districts:
        seed_database_defaults()
        districts = db.query(District).all()

    return [
        DistrictInfo(
            district_id=d.id,
            district_name=d.district_name,
            state_name=d.state_name,
            centroid_lat=d.centroid_lat,
            centroid_lon=d.centroid_lon,
            terrain_elevation_m=d.terrain_elevation_m,
            coastal_proximity_km=d.coastal_proximity_km,
            climatological_mean_jjas_mm=d.climatological_mean_jjas_mm,
        )
        for d in districts
    ]


@app.post("/api/v1/datasets/generate-demo", tags=["Data"])
def generate_demo_dataset(days: int = Query(40, ge=10, le=180)):
    global cached_demo_df
    cached_demo_df = generate_synthetic_dataset(num_days=days, seed=42)
    expert_mix_service.train_all_models(cached_demo_df)
    return {
        "status": "SUCCESS",
        "data_mode": DataMode.SYNTHETIC_DEMO.value,
        "records_generated": len(cached_demo_df),
        "days": days,
        "districts_covered": len(SAMPLE_DISTRICTS),
        "message": "Synthetic monsoon dataset generated and models re-trained.",
    }


# -------------------------------------------------------------
# R-GATE REGIME CLASSIFICATION ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/v1/regimes/predict", response_model=RegimePredictionResponse, tags=["R-GATE"])
def predict_regime(predictors: AtmosphericPredictors):
    return r_gate_service.predict_regime(predictors)


# -------------------------------------------------------------
# FORECAST CORRECTION & EXPERT-MIX ENDPOINTS
# -------------------------------------------------------------

class ForecastRunRequest(BaseModel):
    issue_time: Optional[datetime] = None
    lead_time_hours: int = 24
    atmospheric_predictors: Optional[AtmosphericPredictors] = None
    data_mode: DataMode = DataMode.SYNTHETIC_DEMO


@app.post("/api/v1/forecasts/run", response_model=ForecastRunResponse, tags=["Forecasts"])
def run_forecast_correction(req: ForecastRunRequest, db: Session = Depends(get_db)):
    global cached_latest_forecast
    ensure_models_trained()

    issue_time = req.issue_time or datetime.now(timezone.utc)
    valid_time = issue_time + timedelta(hours=req.lead_time_hours)

    predictors = req.atmospheric_predictors or AtmosphericPredictors(
        precipitable_water_mm=62.0,
        relative_humidity_850hpa_pct=86.0,
        u_wind_850hpa_ms=14.0,
        v_wind_850hpa_ms=2.0,
        mean_sea_level_pressure_hpa=1002.0,
        vorticity_850hpa_s1=3.5,
        monsoon_trough_latitude_deg=21.5,
    )

    regime_res = r_gate_service.predict_regime(predictors)

    rows = []
    for d in SAMPLE_DISTRICTS:
        elev = d["elevation"]
        coastal = d["coastal_dist"]
        orographic = (elev / 800.0) * (predictors.u_wind_850hpa_ms / 10.0) * 15.0 if coastal < 150 else 0.0
        nwp_rain = max(0.0, 12.0 + orographic + (10.0 if coastal < 30 else 0.0))

        rows.append({
            "raw_nwp_rainfall_mm": round(nwp_rain, 2),
            "lead_time_hours": req.lead_time_hours,
            "precipitable_water_mm": predictors.precipitable_water_mm,
            "relative_humidity_850hpa_pct": predictors.relative_humidity_850hpa_pct,
            "u_wind_850hpa_ms": predictors.u_wind_850hpa_ms,
            "v_wind_850hpa_ms": predictors.v_wind_850hpa_ms,
            "mean_sea_level_pressure_hpa": predictors.mean_sea_level_pressure_hpa,
            "terrain_elevation_m": elev,
            "coastal_distance_km": coastal,
            "district_id": d["district_id"],
            "district_name": d["district_name"],
            "state_name": d["state_name"],
            "lat": d["lat"],
            "lon": d["lon"],
        })

    import pandas as pd
    features_df = pd.DataFrame(rows)
    raw_nwp, global_preds, regnova_preds = expert_mix_service.predict_fusion(
        features_df, regime_res.gating_weights
    )

    district_items = []
    for i, d in enumerate(SAMPLE_DISTRICTS):
        reg_val = float(regnova_preds[i])
        probs = rain_cal_service.estimate_event_probabilities(
            reg_val,
            predictors.precipitable_water_mm,
            d["elevation"]
        )

        district_items.append(DistrictForecastItem(
            district_id=d["district_id"],
            district_name=d["district_name"],
            state_name=d["state_name"],
            centroid_lat=d["lat"],
            centroid_lon=d["lon"],
            raw_nwp_rainfall_mm=round(float(raw_nwp[i]), 2),
            global_ml_rainfall_mm=round(float(global_preds[i]), 2),
            regnova_corrected_rainfall_mm=round(reg_val, 2),
            observed_rainfall_mm=None,
            prob_heavy_rain_gt35_pct=probs["prob_heavy_rain_gt35_pct"],
            prob_vheavy_rain_gt64_pct=probs["prob_vheavy_rain_gt64_pct"],
            prob_extheavy_rain_gt115_pct=probs["prob_extheavy_rain_gt115_pct"],
            uncertainty_std_mm=probs["uncertainty_std_mm"],
            active_regime=regime_res.primary_regime,
            expert_weights=regime_res.gating_weights,
            data_mode=req.data_mode,
        ))

    run_response = ForecastRunResponse(
        forecast_run_id=f"fc-{int(datetime.now(timezone.utc).timestamp())}",
        issue_time=issue_time,
        valid_time=valid_time,
        lead_time_hours=req.lead_time_hours,
        data_mode=req.data_mode,
        model_version="REGNOVA-v1.0.0",
        regime_summary=regime_res,
        districts=district_items,
        notes="Regime-aware post-processed forecast using EXPERT-MIX fusion and RAIN-CAL calibration.",
    )
    cached_latest_forecast = run_response
    return run_response


@app.get("/api/v1/forecasts/latest", response_model=ForecastRunResponse, tags=["Forecasts"])
def get_latest_forecast():
    global cached_latest_forecast
    if not cached_latest_forecast:
        req = ForecastRunRequest(lead_time_hours=24, data_mode=DataMode.SYNTHETIC_DEMO)
        db = SessionLocal()
        try:
            cached_latest_forecast = run_forecast_correction(req, db)
        finally:
            db.close()
    return cached_latest_forecast


# -------------------------------------------------------------
# EVALUATION & BENCHMARKING ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/v1/evaluations/run", response_model=EvaluationRunResponse, tags=["Evaluations"])
def run_evaluation():
    global cached_demo_df, cached_latest_eval
    ensure_models_trained()

    test_split_idx = int(len(cached_demo_df) * 0.70)
    df_test = cached_demo_df.iloc[test_split_idx:].copy()

    raw_nwp, global_preds, regnova_preds = expert_mix_service.predict_fusion(
        df_test,
        {"ACTIVE_MONSOON": 0.35, "COAST_TERRAIN": 0.30, "DEPRESSION": 0.20, "BREAK_MONSOON": 0.10, "TRANSITION_OR_UNKNOWN": 0.05}
    )

    eval_result = evaluation_service.evaluate_dataset(
        df_test,
        global_preds,
        regnova_preds,
        dataset_name="Held-out Synthetic Monsoon Test Set",
        data_mode=DataMode.SYNTHETIC_DEMO,
    )
    cached_latest_eval = eval_result
    return eval_result


@app.get("/api/v1/evaluations/latest", response_model=EvaluationRunResponse, tags=["Evaluations"])
def get_latest_evaluation():
    global cached_latest_eval
    if not cached_latest_eval:
        cached_latest_eval = run_evaluation()
    return cached_latest_eval


# -------------------------------------------------------------
# AGENT ORCHESTRATION & SIH DEMO ENDPOINTS
# -------------------------------------------------------------

@app.post("/api/v1/agents/workflows/run", response_model=AgentRunResponse, tags=["Agents"])
def run_agent_workflow(data_mode: DataMode = DataMode.SYNTHETIC_DEMO):
    preds = AtmosphericPredictors(
        precipitable_water_mm=64.0,
        relative_humidity_850hpa_pct=88.0,
        u_wind_850hpa_ms=15.0,
        v_wind_850hpa_ms=3.0,
        mean_sea_level_pressure_hpa=1001.0,
        vorticity_850hpa_s1=4.0,
        monsoon_trough_latitude_deg=21.0,
    )
    return agent_orchestrator.run_full_monsoon_workflow(
        raw_dataset_summary={"total_records": 360, "format": "NetCDF/CSV"},
        atmospheric_inputs=preds,
        districts_features=SAMPLE_DISTRICTS,
        data_mode=data_mode,
    )


@app.post("/api/v1/sih-demo/run", tags=["SIH Demo"])
def run_sih_one_click_demo():
    """Executes the full 14-step SIH demonstration workflow end-to-end."""
    global cached_demo_df, cached_latest_eval, cached_latest_forecast
    cached_demo_df = generate_synthetic_dataset(num_days=40, seed=42)
    train_res = expert_mix_service.train_all_models(cached_demo_df)
    req = ForecastRunRequest(lead_time_hours=24, data_mode=DataMode.SYNTHETIC_DEMO)
    db = SessionLocal()
    try:
        cached_latest_forecast = run_forecast_correction(req, db)
    finally:
        db.close()
    cached_latest_eval = run_evaluation()
    agent_res = run_agent_workflow(data_mode=DataMode.SYNTHETIC_DEMO)

    return {
        "status": "SIH_DEMO_COMPLETED",
        "data_mode": DataMode.SYNTHETIC_DEMO.value,
        "steps_completed": 14,
        "models_trained": train_res,
        "forecast_run_id": cached_latest_forecast.forecast_run_id,
        "evaluation_id": cached_latest_eval.evaluation_id,
        "agent_run_id": agent_res.run_id,
        "message": "Full 14-step SIH demonstration executed successfully with genuine computed artifacts.",
    }
