"""Unit tests for RAIN-CAL heavy-rainfall probability calibration."""
import pytest
from services.ml.rain_cal import RainCalibrator


def test_rain_cal_probability_bounds():
    calibrator = RainCalibrator()
    res = calibrator.estimate_event_probabilities(
        predicted_rainfall_mm=45.0,
        precipitable_water_mm=62.0,
        terrain_elevation_m=500.0,
    )

    assert 0.0 <= res["prob_heavy_rain_gt35_pct"] <= 100.0
    assert 0.0 <= res["prob_vheavy_rain_gt64_pct"] <= 100.0
    assert 0.0 <= res["prob_extheavy_rain_gt115_pct"] <= 100.0
    # Monotonic probability decrease with higher thresholds
    assert res["prob_heavy_rain_gt35_pct"] >= res["prob_vheavy_rain_gt64_pct"]
    assert res["prob_vheavy_rain_gt64_pct"] >= res["prob_extheavy_rain_gt115_pct"]
    assert res["uncertainty_std_mm"] > 0.0
