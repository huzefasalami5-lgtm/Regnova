"""Unit tests for R-GATE Monsoon Regime Intelligence."""
import pytest
from packages.contracts.schemas import AtmosphericPredictors, RegimeType
from services.ml.r_gate import RGateClassifier


def test_r_gate_active_monsoon_detection():
    classifier = RGateClassifier()
    preds = AtmosphericPredictors(
        precipitable_water_mm=62.0,
        relative_humidity_850hpa_pct=85.0,
        u_wind_850hpa_ms=14.0,
        v_wind_850hpa_ms=2.0,
        mean_sea_level_pressure_hpa=1002.0,
        vorticity_850hpa_s1=3.0,
        monsoon_trough_latitude_deg=22.0,
        terrain_elevation_m=50.0,
        coastal_distance_km=200.0,
    )
    result = classifier.predict_regime(preds)
    assert result.primary_regime == RegimeType.ACTIVE_MONSOON
    assert result.confidence_score > 0.0
    assert abs(sum(result.gating_weights.values()) - 1.0) < 1e-3


def test_r_gate_break_monsoon_detection():
    classifier = RGateClassifier()
    preds = AtmosphericPredictors(
        precipitable_water_mm=42.0,
        relative_humidity_850hpa_pct=60.0,
        u_wind_850hpa_ms=5.0,
        v_wind_850hpa_ms=-1.0,
        mean_sea_level_pressure_hpa=1010.0,
        vorticity_850hpa_s1=1.0,
        monsoon_trough_latitude_deg=28.0,  # Shifted to foothills
        terrain_elevation_m=50.0,
        coastal_distance_km=400.0,
    )
    result = classifier.predict_regime(preds)
    assert result.primary_regime == RegimeType.BREAK_MONSOON


def test_r_gate_depression_detection():
    classifier = RGateClassifier()
    preds = AtmosphericPredictors(
        precipitable_water_mm=68.0,
        relative_humidity_850hpa_pct=92.0,
        u_wind_850hpa_ms=18.0,
        v_wind_850hpa_ms=8.0,
        mean_sea_level_pressure_hpa=993.0,  # Deep depression
        vorticity_850hpa_s1=14.0,
        monsoon_trough_latitude_deg=22.0,
        terrain_elevation_m=20.0,
        coastal_distance_km=80.0,
    )
    result = classifier.predict_regime(preds)
    assert result.primary_regime == RegimeType.DEPRESSION
