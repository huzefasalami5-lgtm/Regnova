"""Integration tests for FastAPI REST API endpoints."""
import pytest
from fastapi.testclient import TestClient
from services.api.main import app

client = TestClient(app)


def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert data["data_mode"] == "SYNTHETIC_DEMO"


def test_metadata_endpoint():
    response = client.get("/api/v1/metadata")
    assert response.status_code == 200
    data = response.json()
    assert data["system_name"].startswith("REGNOVA")
    assert "ACTIVE_MONSOON" in data["regime_definitions"]


def test_districts_list_endpoint():
    response = client.get("/api/v1/districts")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(d["district_name"] == "Mumbai City" for d in data)


def test_regime_prediction_endpoint():
    payload = {
        "precipitable_water_mm": 65.0,
        "relative_humidity_850hpa_pct": 90.0,
        "u_wind_850hpa_ms": 15.0,
        "v_wind_850hpa_ms": 2.0,
        "mean_sea_level_pressure_hpa": 1001.0,
        "vorticity_850hpa_s1": 4.0,
        "monsoon_trough_latitude_deg": 22.0,
        "terrain_elevation_m": 10.0,
        "coastal_distance_km": 5.0,
    }
    response = client.post("/api/v1/regimes/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "primary_regime" in data
    assert "gating_weights" in data


def test_forecast_run_endpoint():
    payload = {
        "lead_time_hours": 24,
        "data_mode": "SYNTHETIC_DEMO"
    }
    response = client.post("/api/v1/forecasts/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["districts"]) > 0
    assert data["districts"][0]["regnova_corrected_rainfall_mm"] >= 0.0


def test_evaluation_run_endpoint():
    response = client.post("/api/v1/evaluations/run")
    assert response.status_code == 200
    data = response.json()
    assert "raw_nwp_metrics" in data
    assert "regnova_metrics" in data
    assert data["regnova_metrics"]["rmse_mm"] > 0.0


def test_agent_workflow_endpoint():
    response = client.post("/api/v1/agents/workflows/run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "COMPLETED"
    assert len(data["events"]) == 6


def test_sih_one_click_demo_endpoint():
    response = client.post("/api/v1/sih-demo/run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SIH_DEMO_COMPLETED"
    assert data["steps_completed"] == 14
