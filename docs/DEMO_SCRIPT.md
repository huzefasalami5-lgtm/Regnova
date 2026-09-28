# Five-Minute SIH 2026 Evaluation Demo Script

**Team**: VYSTRAL | **Problem Statement**: SIH26080  
**Project**: REGNOVA (Regime-Adaptive AI for Monsoon Forecast Correction)

---

## ⏱ Minute 1: Problem & Mission (Landing Page)
1. Open `http://localhost:3000/`.
2. Explain Problem SIH26080: NWP models exhibit systematic regime-dependent errors during the Indian monsoon (orographic underprediction along Western Ghats, drizzle bias in break spells, depression displacement).
3. Introduce REGNOVA: A regime-adaptive post-processing layer that corrects NWP forecasts using specialized expert models.

## ⏱ Minute 2: Atmospheric Command Center & Geospatial Maps
1. Navigate to `/command-center`.
2. Point out:
   - **Interactive Indian District Map**: Switch layers between *REGNOVA (AI)*, *Raw NWP*, *Global ML*, and *Heavy Rain Prob (>35mm)*.
   - **R-GATE Soft Gating HUD**: Explain that regimes are not mutually exclusive; continuous weights sum to 1.0.
   - **Click a District** (e.g., Wayanad or Mumbai): Observe raw vs corrected rainfall and uncertainty bounds.

## ⏱ Minute 3: R-GATE Regime Studio & Scenarios
1. Navigate to `/regime-studio`.
2. Select Preset Scenarios: *Active Monsoon*, *Break Monsoon*, *Monsoon Depression*.
3. Show how shifting the Monsoon Trough Latitude or dropping MSLP triggers instant recalculation of soft gating weights.

## ⏱ Minute 4: AI Agent Control Room & Audit Trail
1. Navigate to `/agent-room`.
2. Click **"Run 5-Agent Orchestration"**.
3. Walk through the live audit trail:
   - Agent 01 (Data Quality) audits schema and asserts zero temporal feature leakage.
   - Agent 02 (Regime Analysis) evaluates atmospheric predictors.
   - Agent 03 (Forecast Correction) applies expert mixture fusion.
   - Agent 04 (Evaluation) computes continuous RMSE and categorical CSI/ETS.
   - Agent 05 (District Guidance) synthesizes plain-language advisory.

## ⏱ Minute 5: Evaluation Lab & Honest Scientific Reporting
1. Navigate to `/evaluation-lab`.
2. Review the backtest verification metrics:
   - Continuous: RMSE, MAE, Bias, Brier Score.
   - Categorical: CSI and ETS across IMD heavy rainfall thresholds.
   - Transparent reporting: Note both improved cases and degraded cases.
3. Conclude by highlighting that REGNOVA runs 100% locally and offline without external API requirements.
