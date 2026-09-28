"""Synthetic monsoon weather and district generator for guaranteed offline demonstration.

Generates realistic atmospheric variables, NWP raw rainfall forecasts, and matching
verification observations with physical monsoon patterns and documented NWP systematic biases.
All outputs are labeled SYNTHETIC DEMO.
"""
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Tuple


# Key representative Indian districts across varied meteorological regimes
SAMPLE_DISTRICTS = [
    {"district_id": "MH_MUMBAI", "district_name": "Mumbai City", "state_name": "Maharashtra", "lat": 18.92, "lon": 72.83, "elevation": 14.0, "coastal_dist": 0.0, "climatology": 2150.0},
    {"district_id": "MH_PUNE", "district_name": "Pune", "state_name": "Maharashtra", "lat": 18.52, "lon": 73.85, "elevation": 560.0, "coastal_dist": 110.0, "climatology": 720.0},
    {"district_id": "KL_WAYANAD", "district_name": "Wayanad", "state_name": "Kerala", "lat": 11.68, "lon": 76.13, "elevation": 850.0, "coastal_dist": 65.0, "climatology": 2600.0},
    {"district_id": "KL_ERNAKULAM", "district_name": "Ernakulam", "state_name": "Kerala", "lat": 9.98, "lon": 76.30, "elevation": 10.0, "coastal_dist": 5.0, "climatology": 2200.0},
    {"district_id": "KA_UDUPI", "district_name": "Udupi", "state_name": "Karnataka", "lat": 13.34, "lon": 74.74, "elevation": 30.0, "coastal_dist": 5.0, "climatology": 3800.0},
    {"district_id": "OD_PURI", "district_name": "Puri", "state_name": "Odisha", "lat": 19.81, "lon": 85.83, "elevation": 15.0, "coastal_dist": 2.0, "climatology": 1100.0},
    {"district_id": "WB_KOLKATA", "district_name": "Kolkata", "state_name": "West Bengal", "lat": 22.57, "lon": 88.36, "elevation": 9.0, "coastal_dist": 80.0, "climatology": 1350.0},
    {"district_id": "MP_BHOPAL", "district_name": "Bhopal", "state_name": "Madhya Pradesh", "lat": 23.25, "lon": 77.41, "elevation": 527.0, "coastal_dist": 600.0, "climatology": 950.0},
    {"district_id": "RJ_JAIPUR", "district_name": "Jaipur", "state_name": "Rajasthan", "lat": 26.91, "lon": 75.78, "elevation": 431.0, "coastal_dist": 750.0, "climatology": 520.0},
    {"district_id": "DL_NEW_DELHI", "district_name": "New Delhi", "state_name": "Delhi", "lat": 28.61, "lon": 77.20, "elevation": 216.0, "coastal_dist": 1100.0, "climatology": 650.0},
    {"district_id": "AS_GUWAHATI", "district_name": "Kamrup Metro (Guwahati)", "state_name": "Assam", "lat": 26.14, "lon": 91.73, "elevation": 55.0, "coastal_dist": 400.0, "climatology": 1600.0},
    {"district_id": "TN_CHENNAI", "district_name": "Chennai", "state_name": "Tamil Nadu", "lat": 13.08, "lon": 80.27, "elevation": 6.0, "coastal_dist": 0.0, "climatology": 420.0},
]


def generate_synthetic_dataset(
    start_date: datetime = datetime(2026, 6, 1),
    num_days: int = 120,
    seed: int = 42
) -> pd.DataFrame:
    """Generate reproducible multi-day synthetic monsoon records across sample districts.

    Implements physical regime transitions:
    - Days 0-25: Active Monsoon
    - Days 25-45: Coast/Terrain Enhanced
    - Days 45-65: Monsoon Depression passing over Central India
    - Days 65-85: Break Monsoon (trough shift to foothills)
    - Days 85-120: Transition & Synoptic pulses
    """
    np.random.seed(seed)
    records = []

    for day in range(num_days):
        current_date = start_date + timedelta(days=day)

        # Base atmospheric drivers determined by regime phase
        if day < 25:
            # Active Monsoon: high PWV, strong westerly wind, central trough
            regime = "ACTIVE_MONSOON"
            pwv_base = 62.0 + np.random.normal(0, 3.0)
            rh_base = 86.0 + np.random.normal(0, 4.0)
            u_wind_base = 14.0 + np.random.normal(0, 2.0)
            v_wind_base = 2.0 + np.random.normal(0, 1.5)
            mslp_base = 1002.0 + np.random.normal(0, 1.5)
            trough_lat = 21.5 + np.random.normal(0, 0.8)
        elif day < 45:
            # Coast & Terrain: strong coastal moisture convergence
            regime = "COAST_TERRAIN"
            pwv_base = 58.0 + np.random.normal(0, 3.0)
            rh_base = 88.0 + np.random.normal(0, 3.0)
            u_wind_base = 16.0 + np.random.normal(0, 2.5)
            v_wind_base = 4.0 + np.random.normal(0, 1.5)
            mslp_base = 1004.0 + np.random.normal(0, 1.5)
            trough_lat = 20.0 + np.random.normal(0, 0.8)
        elif day < 65:
            # Depression: intense cyclonic vorticity, low pressure anomaly
            regime = "DEPRESSION"
            pwv_base = 68.0 + np.random.normal(0, 3.5)
            rh_base = 92.0 + np.random.normal(0, 3.0)
            u_wind_base = 18.0 + np.random.normal(0, 3.0)
            v_wind_base = 8.0 + np.random.normal(0, 2.5)
            mslp_base = 994.0 + np.random.normal(0, 2.0)
            trough_lat = 22.0 + np.random.normal(0, 0.5)
        elif day < 85:
            # Break Monsoon: dry air over central India, trough shifted to foothills
            regime = "BREAK_MONSOON"
            pwv_base = 44.0 + np.random.normal(0, 3.0)
            rh_base = 65.0 + np.random.normal(0, 5.0)
            u_wind_base = 6.0 + np.random.normal(0, 2.0)
            v_wind_base = -1.0 + np.random.normal(0, 1.5)
            mslp_base = 1009.0 + np.random.normal(0, 1.5)
            trough_lat = 27.5 + np.random.normal(0, 0.8)
        else:
            # Transition / Unknown
            regime = "TRANSITION_OR_UNKNOWN"
            pwv_base = 52.0 + np.random.normal(0, 4.0)
            rh_base = 74.0 + np.random.normal(0, 6.0)
            u_wind_base = 9.0 + np.random.normal(0, 2.5)
            v_wind_base = 1.0 + np.random.normal(0, 2.0)
            mslp_base = 1005.0 + np.random.normal(0, 2.0)
            trough_lat = 23.0 + np.random.normal(0, 1.5)

        for d in SAMPLE_DISTRICTS:
            # True physical rainfall generation
            dist_lat = d["lat"]
            dist_lon = d["lon"]
            elev = d["elevation"]
            coastal = d["coastal_dist"]

            # Orographic factor
            orographic_boost = (elev / 800.0) * max(0, u_wind_base / 10.0) * 18.0 if coastal < 150 else 0.0
            
            # Trough proximity factor
            lat_diff = abs(dist_lat - trough_lat)
            trough_factor = max(0.0, 1.0 - (lat_diff / 5.0))

            if regime == "ACTIVE_MONSOON":
                base_rain = 15.0 * trough_factor + (12.0 if coastal < 20 else 4.0) + orographic_boost
            elif regime == "BREAK_MONSOON":
                base_rain = 35.0 if dist_lat > 25.0 else 1.5  # Heavy in foothills (Assam/Delhi), dry elsewhere
            elif regime == "DEPRESSION":
                # Heavy rain in Odisha, Bengal, MP along track
                track_dist = math.sqrt((dist_lat - 21.0)**2 + (dist_lon - 83.0)**2)
                base_rain = max(0.0, 85.0 * math.exp(-track_dist / 6.0)) + 5.0
            elif regime == "COAST_TERRAIN":
                base_rain = orographic_boost * 2.5 + (30.0 if coastal < 30 else 5.0)
            else:
                base_rain = 8.0 * trough_factor + np.random.exponential(4.0)

            # Observed rainfall with positive skew (gamma distribution)
            true_rain = max(0.0, np.random.gamma(shape=max(1.0, base_rain / 5.0), scale=5.0))
            if base_rain < 2.0 and np.random.rand() > 0.4:
                true_rain = 0.0

            # Raw NWP model prediction (with documented realistic systematic biases)
            # 1. NWP underpredicts orographic/extreme terrain peaks by ~35%
            # 2. NWP overpredicts light drizzle in dry break spells (drizzle bias)
            # 3. NWP displaces depression centers slightly
            if regime == "COAST_TERRAIN" and elev > 200:
                nwp_rain = true_rain * 0.65 + np.random.normal(0, 4.0)
            elif regime == "BREAK_MONSOON" and true_rain < 2.0:
                nwp_rain = true_rain + np.random.uniform(3.0, 9.0)  # Overprediction bias
            elif regime == "DEPRESSION" and true_rain > 50.0:
                nwp_rain = true_rain * 0.75 + np.random.normal(0, 12.0)
            else:
                nwp_rain = true_rain * 0.90 + np.random.normal(2.0, 5.0)

            nwp_rain = max(0.0, float(nwp_rain))
            true_rain = round(float(true_rain), 2)
            nwp_rain = round(float(nwp_rain), 2)

            for lead in [24, 48, 72]:
                lead_factor = 1.0 + (lead - 24) * 0.05
                noisy_nwp = max(0.0, round(nwp_rain * lead_factor + np.random.normal(0, lead * 0.1), 2))

                records.append({
                    "date": current_date.strftime("%Y-%m-%d"),
                    "issue_time": (current_date - timedelta(hours=lead)).strftime("%Y-%m-%d %H:%M:%S"),
                    "valid_time": current_date.strftime("%Y-%m-%d %H:%M:%S"),
                    "lead_time_hours": lead,
                    "district_id": d["district_id"],
                    "district_name": d["district_name"],
                    "state_name": d["state_name"],
                    "lat": d["lat"],
                    "lon": d["lon"],
                    "terrain_elevation_m": elev,
                    "coastal_distance_km": coastal,
                    "precipitable_water_mm": round(pwv_base + np.random.normal(0, 2.0), 2),
                    "relative_humidity_850hpa_pct": min(100.0, max(20.0, round(rh_base + np.random.normal(0, 3.0), 2))),
                    "u_wind_850hpa_ms": round(u_wind_base + np.random.normal(0, 1.0), 2),
                    "v_wind_850hpa_ms": round(v_wind_base + np.random.normal(0, 1.0), 2),
                    "mean_sea_level_pressure_hpa": round(mslp_base + np.random.normal(0, 1.0), 2),
                    "vorticity_850hpa_s1": round((12.0 if regime == "DEPRESSION" else 2.0) + np.random.normal(0, 1.5), 2),
                    "monsoon_trough_latitude_deg": round(trough_lat, 2),
                    "raw_nwp_rainfall_mm": noisy_nwp,
                    "observed_rainfall_mm": true_rain,
                    "ground_truth_regime": regime,
                    "data_mode": "SYNTHETIC_DEMO",
                })

    df = pd.DataFrame(records)
    return df
