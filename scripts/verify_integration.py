"""End-to-end integration verification between React frontend and FastAPI backend."""
import urllib.request
import json
import sys

def test_integration():
    print("=" * 60)
    print("REGNOVA Full-Stack Integration Verification")
    print("=" * 60)

    # 1. Direct Backend Health
    try:
        req = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health")
        data = json.loads(req.read().decode())
        print(f"[OK] Direct Backend (8000): {data['status']} | Mode: {data['data_mode']}")
    except Exception as e:
        print(f"[FAIL] Direct Backend (8000): {e}")
        return False

    # 2. Frontend Web App HTTP
    try:
        req = urllib.request.urlopen("http://localhost:3000/")
        print(f"[OK] Frontend Web App (3000): HTTP {req.status}")
    except Exception as e:
        print(f"[FAIL] Frontend Web App (3000): {e}")
        return False

    # 3. Vite Proxy Forwarding /api/v1/health
    try:
        req = urllib.request.urlopen("http://localhost:3000/api/v1/health")
        data = json.loads(req.read().decode())
        print(f"[OK] Vite Proxy /api/v1/health: {data['status']} (Proxied to 8000)")
    except Exception as e:
        print(f"[FAIL] Vite Proxy /api/v1/health: {e}")
        return False

    # 4. Vite Proxy Forwarding /api/v1/districts
    try:
        req = urllib.request.urlopen("http://localhost:3000/api/v1/districts")
        districts = json.loads(req.read().decode())
        print(f"[OK] Vite Proxy /api/v1/districts: {len(districts)} districts loaded")
    except Exception as e:
        print(f"[FAIL] Vite Proxy /api/v1/districts: {e}")
        return False

    # 5. Vite Proxy Forwarding /api/v1/forecasts/latest
    try:
        req = urllib.request.urlopen("http://localhost:3000/api/v1/forecasts/latest")
        forecast = json.loads(req.read().decode())
        primary_reg = forecast['regime_summary']['primary_regime']
        dist_count = len(forecast['districts'])
        print(f"[OK] Vite Proxy /api/v1/forecasts/latest: Regime '{primary_reg}', {dist_count} district predictions")
    except Exception as e:
        print(f"[FAIL] Vite Proxy /api/v1/forecasts/latest: {e}")
        return False

    print("=" * 60)
    print("ALL FRONTEND-TO-BACKEND INTEGRATION TESTS PASSED [READY]")
    print("=" * 60)
    return True

if __name__ == "__main__":
    if not test_integration():
        sys.exit(1)
