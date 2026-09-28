# REGNOVA Architecture & System Design

**Project**: REGNOVA (Regime-Adaptive AI for Monsoon Forecast Correction)  
**Team**: VYSTRAL | **SIH 2026**: SIH26080  

---

## 1. High-Level System Architecture

REGNOVA decouples numerical weather prediction from statistical post-processing through four core layers:

```
[ NWP Grids (GEFS/NCUM) ] + [ Issue-Time Synoptic Predictors ]
                         │
                         ▼
             [ 1. R-GATE Classifier ]
        (Active / Break / Depression / Coast-Terrain)
                         │  (Soft Gating Weights w_k)
                         ▼
             [ 2. EXPERT-MIX Engine ]
  ┌───────────────┬───────────────┬───────────────┐
  │ Active Expert │ Break Expert  │ Depr Expert   │ Coast Expert  │ Global Baseline │
  └───────────────┴───────────────┴───────────────┘
                         │
                         ▼
             [ 3. Weighted Fusion & Non-Negativity ]
                         │
                         ▼
             [ 4. RAIN-CAL Probability Calibration ]
        (Heavy >35.5mm, Very Heavy >64.5mm Exceedance)
                         │
                         ▼
       [ 5. District Area-Weighted Aggregator ]
                         │
                         ▼
    [ FastAPI REST API ] ──► [ React Atmospheric Command UI ]
```

---

## 2. Leakage Prevention & Scientific Guarantees
- **Strict Issue-Time Constraints**: Features used for inference are restricted to observations and NWP model runs available before or at forecast initialization.
- **Partition Independence**: Normalization, feature scaling, and Platt probability calibrations are computed exclusively on training/validation partitions.
- **Non-Negativity**: All precipitation post-processing passes through `max(0.0, y_hat)` constraints.
