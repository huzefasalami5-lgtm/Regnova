"""Comprehensive endpoint testing script testing all API calls through the Vite frontend dev proxy."""
import urllib.request
import json
import time

PROXY_BASE = "http://localhost:3000/api/v1"

def test_endpoint(name: str, method: str, url: str, payload=None):
    t0 = time.time()
    try:
        data_bytes = json.dumps(payload).encode('utf-8') if payload else None
        headers = {"Content-Type": "application/json"} if payload else {}
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
        with urllib.request.urlopen(req) as response:
            status_code = response.status
            body = json.loads(response.read().decode('utf-8'))
            elapsed = int((time.time() - t0) * 1000)
            print(f"[PASSED] {name} ({method} {url.replace('http://localhost:3000', '')}) -> HTTP {status_code} [{elapsed}ms]")
            return True, body
    except Exception as e:
        elapsed = int((time.time() - t0) * 1000)
        print(f"[FAILED] {name} -> Error: {e} [{elapsed}ms]")
        return False, None

def run_all():
    print("=" * 70)
    print("REGNOVA Full-Stack Frontend Proxy Endpoint Verification")
    print("=" * 70)

    results = []

    # 1. System Health
    r1, d1 = test_endpoint("System Health", "GET", f"{PROXY_BASE}/health")
    results.append(("System Health", r1, d1))

    # 2. System Metadata
    r2, d2 = test_endpoint("System Metadata", "GET", f"{PROXY_BASE}/metadata")
    results.append(("System Metadata", r2, d2))

    # 3. Districts Catalog
    r3, d3 = test_endpoint("Districts Catalog", "GET", f"{PROXY_BASE}/districts")
    results.append(("Districts Catalog", r3, d3))

    # 4. Latest Forecast (Command Center & India Map)
    r4, d4 = test_endpoint("Latest Forecast", "GET", f"{PROXY_BASE}/forecasts/latest")
    results.append(("Latest Forecast", r4, d4))

    # 5. Run Forecast (Forecast Studio)
    fc_payload = {
        "lead_time_hours": 48,
        "data_mode": "SYNTHETIC_DEMO",
        "atmospheric_predictors": {
            "precipitable_water_mm": 64.0,
            "relative_humidity_850hpa_pct": 88.0,
            "u_wind_850hpa_ms": 15.0,
            "v_wind_850hpa_ms": 3.0,
            "mean_sea_level_pressure_hpa": 1001.0,
            "vorticity_850hpa_s1": 4.0,
            "monsoon_trough_latitude_deg": 21.0
        }
    }
    r5, d5 = test_endpoint("Run Forecast Correction", "POST", f"{PROXY_BASE}/forecasts/run", fc_payload)
    results.append(("Run Forecast Correction", r5, d5))

    # 6. R-GATE Predict Regime (Regime Studio)
    rg_payload = {
        "precipitable_water_mm": 68.0,
        "relative_humidity_850hpa_pct": 92.0,
        "u_wind_850hpa_ms": 18.0,
        "v_wind_850hpa_ms": 8.0,
        "mean_sea_level_pressure_hpa": 993.0,
        "vorticity_850hpa_s1": 14.0,
        "monsoon_trough_latitude_deg": 22.0
    }
    r6, d6 = test_endpoint("R-GATE Regime Prediction", "POST", f"{PROXY_BASE}/regimes/predict", rg_payload)
    results.append(("R-GATE Regime Prediction", r6, d6))

    # 7. Latest Evaluation (Evaluation Lab)
    r7, d7 = test_endpoint("Latest Evaluation Benchmark", "GET", f"{PROXY_BASE}/evaluations/latest")
    results.append(("Latest Evaluation Benchmark", r7, d7))

    # 8. Trigger Evaluation (Evaluation Lab)
    r8, d8 = test_endpoint("Trigger Evaluation Run", "POST", f"{PROXY_BASE}/evaluations/run")
    results.append(("Trigger Evaluation Run", r8, d8))

    # 9. AI Agent Workflow (Agent Room)
    r9, d9 = test_endpoint("AI 5-Agent Orchestration", "POST", f"{PROXY_BASE}/agents/workflows/run")
    results.append(("AI 5-Agent Orchestration", r9, d9))

    # 10. SIH 1-Click Demo (SIH Presentation Mode)
    r10, d10 = test_endpoint("One-Click SIH Live Demo", "POST", f"{PROXY_BASE}/sih-demo/run")
    results.append(("One-Click SIH Live Demo", r10, d10))

    print("=" * 70)
    passed_count = sum(1 for _, ok, _ in results if ok)
    print(f"SUMMARY: {passed_count}/{len(results)} Frontend Proxy Endpoints Verified")
    print("=" * 70)

if __name__ == "__main__":
    run_all()
