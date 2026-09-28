# REGNOVA: Regime-Adaptive AI for Monsoon Forecast Correction

**Team**: VYSTRAL  
**Smart India Hackathon 2026**  
**Problem Statement**: SIH26080 — Regime-Aware AI Post-Processing of Monsoon Rainfall Forecasts  
**Category**: Software | **Theme**: Smart Automation  

---

## 🌟 Executive Summary

**REGNOVA** is a meteorological AI post-processing platform designed specifically for the Indian Summer Monsoon (JJAS). Operating as a layer over Numerical Weather Prediction (NWP) models, REGNOVA:
1. **Identifies Synoptic & Meso-scale Regimes** (*Active Monsoon*, *Break Monsoon*, *Monsoon Depression*, *Coast & Terrain Convergence*, and *Transition*) via **R-GATE**.
2. **Applies Regime-Specialized Correction Experts** via **EXPERT-MIX** with continuous soft-gating fusion and global fallback.
3. **Calibrates Heavy Rainfall Exceedance Probabilities** (>35.5 mm, >64.5 mm, >115.5 mm) via **RAIN-CAL**.
4. **Delivers Operational District-Level Guidance & Verification Reports** with transparent 5-Agent orchestration and honest performance audits.

> **Scientific Integrity Notice**: REGNOVA is a non-destructive post-processing layer. It does not replace core numerical weather prediction models and strictly distinguishes `LIVE_VERIFIED`, `HISTORICAL_REPLAY`, and `SYNTHETIC_DEMO` datasets.

---

## 🏗 Monorepo Architecture

```
regnova/
├── apps/
│   └── web/                   # React + TypeScript + Vite + Tailwind CSS dashboard
├── services/
│   ├── api/                   # FastAPI backend REST services & OpenAPI schemas
│   ├── ml/                    # R-GATE, EXPERT-MIX, RAIN-CAL, Evaluation Engine
│   └── agents/                # Deterministic 5-Agent Orchestrator & Audit Trail
├── packages/
│   └── contracts/             # Pydantic v2 schemas and shared data types
├── data/
│   ├── sample/                # Seed district metadata & atmospheric samples
│   ├── processed/             # Ingested datasets
│   └── artifacts/             # Serialized model weights & evaluation artifacts
├── tests/
│   ├── unit/                  # Unit tests for R-GATE, Experts, Rain-Cal, Evaluator
│   └── integration/           # Integration tests for FastAPI endpoints & workflows
├── scripts/
│   └── validate_setup.py      # Automated setup & health verification script
├── docker-compose.yml         # Containerized full-stack deployment
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js v18+ & npm

### 1. Backend Setup (PowerShell / Bash)
```powershell
# In the workspace root
cd regnova

# Install Python dependencies & run setup validation
python scripts/validate_setup.py

# Start FastAPI server (Runs on http://localhost:8000)
uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Setup
```powershell
# Open a second terminal window
cd regnova/apps/web

# Install npm dependencies (if not already installed)
npm install

# Start Vite Development Server (Runs on http://localhost:3000)
npm run dev
```

### 3. Run Backend Smoke & Integration Tests
```powershell
pytest tests -v
```

---

## 🎯 1-Click SIH Live Demonstration
Navigate to `http://localhost:3000/sih-demo` in your browser and click **"EXECUTE ONE-CLICK SIH DEMO"**.
This performs:
1. Synthetic monsoon dataset ingestion with known NWP systematic biases.
2. 5-Agent quality validation and temporal leakage audit.
3. R-GATE regime classification & soft gating weight generation.
4. EXPERT-MIX specialist model training and fusion.
5. RAIN-CAL probability calibration.
6. Geospatial district map rendering and independent backtesting verification.
