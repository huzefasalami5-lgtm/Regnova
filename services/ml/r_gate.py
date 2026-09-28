"""R-GATE: Regime-Aware Gating & Intelligence Module for Indian Monsoon.

Classifies synoptic and meso-scale meteorological monsoon regimes:
1. ACTIVE_MONSOON
2. BREAK_MONSOON
3. DEPRESSION
4. COAST_TERRAIN
5. TRANSITION_OR_UNKNOWN

Calculates soft gating weights, confidence scores, and predictor contributions.
Strictly uses atmospheric predictors available at forecast issue time (no future observation leakage).
"""
import math
import numpy as np
from typing import Dict, Any, Tuple
from packages.contracts.schemas import (
    AtmosphericPredictors,
    RegimeType,
    RegimeProbabilityBreakdown,
    RegimePredictionResponse,
)


class RGateClassifier:
    """Monsoon regime classifier combining meteorological physics rules and soft gating."""

    def __init__(self):
        self.version = "1.0.0-physics-gating"

    def compute_regime_scores(self, predictors: AtmosphericPredictors) -> Dict[RegimeType, float]:
        """Evaluate physical atmospheric indicator scores for each regime."""
        pwv = predictors.precipitable_water_mm
        rh850 = predictors.relative_humidity_850hpa_pct
        u850 = predictors.u_wind_850hpa_ms
        mslp = predictors.mean_sea_level_pressure_hpa
        vort = predictors.vorticity_850hpa_s1
        trough_lat = predictors.monsoon_trough_latitude_deg
        elev = predictors.terrain_elevation_m
        coastal_dist = predictors.coastal_distance_km

        scores: Dict[RegimeType, float] = {}

        # 1. DEPRESSION Score: Low MSLP (<1000 hPa), high positive cyclonic vorticity (>8), high PWV
        depression_score = 0.0
        if mslp < 1000.0:
            depression_score += (1000.0 - mslp) * 1.5
        if vort > 5.0:
            depression_score += (vort - 5.0) * 1.8
        if pwv > 60.0:
            depression_score += (pwv - 60.0) * 0.4
        scores[RegimeType.DEPRESSION] = max(0.1, depression_score)

        # 2. ACTIVE MONSOON Score: Strong westerly jet (u850 > 10 m/s), high PWV (>55mm), central trough (20-24N)
        active_score = 0.0
        if u850 > 8.0:
            active_score += (u850 - 8.0) * 1.2
        if pwv > 55.0:
            active_score += (pwv - 55.0) * 0.5
        if rh850 > 80.0:
            active_score += (rh850 - 80.0) * 0.4
        if 19.0 <= trough_lat <= 25.0:
            active_score += 4.0
        scores[RegimeType.ACTIVE_MONSOON] = max(0.1, active_score)

        # 3. BREAK MONSOON Score: Trough shifted to foothills (>26N), weak westerlies, high pressure, low central RH
        break_score = 0.0
        if trough_lat > 25.5:
            break_score += (trough_lat - 25.5) * 3.0
        if mslp > 1006.0:
            break_score += (mslp - 1006.0) * 1.5
        if u850 < 8.0:
            break_score += (8.0 - u850) * 1.0
        if rh850 < 72.0:
            break_score += (72.0 - rh850) * 0.5
        scores[RegimeType.BREAK_MONSOON] = max(0.1, break_score)

        # 4. COAST_TERRAIN Score: Coastal proximity (<80km) or Western Ghats orography (elev > 250m) + cross-barrier westerly flow
        coast_score = 0.0
        if coastal_dist < 80.0:
            coast_score += (80.0 - coastal_dist) / 10.0
        if elev > 200.0:
            coast_score += min(10.0, (elev / 150.0))
        if u850 > 10.0 and (coastal_dist < 150.0 or elev > 200.0):
            coast_score += (u850 - 10.0) * 1.2
        scores[RegimeType.COAST_TERRAIN] = max(0.1, coast_score)

        # 5. TRANSITION / UNKNOWN baseline
        scores[RegimeType.TRANSITION_OR_UNKNOWN] = 2.0

        return scores

    def predict_regime(self, predictors: AtmosphericPredictors) -> RegimePredictionResponse:
        """Calculate normalized probabilities, gating weights, and predictor evidence."""
        scores = self.compute_regime_scores(predictors)

        # Softmax / normalized temperature scaling
        temperature = 2.5
        exp_scores = {k: math.exp(v / temperature) for k, v in scores.items()}
        total_exp = sum(exp_scores.values())

        probabilities = {
            k.value: round(v / total_exp, 4) for k, v in exp_scores.items()
        }

        # Determine primary regime
        primary_regime_key = max(exp_scores.items(), key=lambda item: item[1])[0]

        # Calculate gating weights (smooth fusion weights summing to 1.0)
        gating_weights = probabilities.copy()

        # Confidence metric: difference between top probability and uniform baseline
        max_prob = max(probabilities.values())
        confidence_score = round(min(1.0, max(0.1, (max_prob - 0.20) / 0.80)), 3)

        # Evidence dictionary for explainability
        predictor_evidence = {
            "precipitable_water_mm": predictors.precipitable_water_mm,
            "relative_humidity_850hpa_pct": predictors.relative_humidity_850hpa_pct,
            "u_wind_850hpa_ms": predictors.u_wind_850hpa_ms,
            "mean_sea_level_pressure_hpa": predictors.mean_sea_level_pressure_hpa,
            "vorticity_850hpa_s1": predictors.vorticity_850hpa_s1,
            "monsoon_trough_latitude_deg": predictors.monsoon_trough_latitude_deg,
            "terrain_elevation_m": predictors.terrain_elevation_m,
            "coastal_distance_km": predictors.coastal_distance_km,
            "dominant_indicators": [
                f"MSLP: {predictors.mean_sea_level_pressure_hpa:.1f} hPa",
                f"850hPa Wind: {predictors.u_wind_850hpa_ms:.1f} m/s",
                f"PWV: {predictors.precipitable_water_mm:.1f} mm",
                f"Trough Latitude: {predictors.monsoon_trough_latitude_deg:.1f}°N",
            ]
        }

        return RegimePredictionResponse(
            primary_regime=primary_regime_key,
            probabilities=RegimeProbabilityBreakdown(**probabilities),
            gating_weights=gating_weights,
            confidence_score=confidence_score,
            predictor_evidence=predictor_evidence,
            rule_or_model_provenance=f"R-GATE {self.version} [Deterministic Synoptic & Terrain Feature Evaluator]",
        )
