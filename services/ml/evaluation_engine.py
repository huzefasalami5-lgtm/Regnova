"""Independent Scientific Evaluation & Backtesting Engine for REGNOVA.

Calculates rigorous meteorological verification metrics:
- Continuous: RMSE, MAE, Bias, Pearson Correlation
- Categorical (at 15.6mm, 35.5mm, 64.5mm): CSI, ETS, POD, FAR
- Probabilistic: Brier Score, Reliability diagrams
- Stratifications by Monsoon Regime and Forecast Lead Time (24h, 48h, 72h)
- Discloses both improvement counts and degradation counts.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Any
from packages.contracts.schemas import (
    ModelEvaluationMetrics,
    CategoricalVerification,
    EvaluationRunResponse,
    DataMode,
)


def compute_continuous_metrics(obs: np.ndarray, pred: np.ndarray) -> Tuple[float, float, float, float]:
    """Compute RMSE, MAE, Bias, and Pearson correlation."""
    if len(obs) == 0:
        return 0.0, 0.0, 0.0, 0.0

    error = pred - obs
    rmse = float(np.sqrt(np.mean(error ** 2)))
    mae = float(np.mean(np.abs(error)))
    bias = float(np.mean(error))

    if np.std(obs) > 1e-6 and np.std(pred) > 1e-6:
        corr = float(np.corrcoef(obs, pred)[0, 1])
    else:
        corr = 0.0

    return round(rmse, 2), round(mae, 2), round(bias, 2), round(corr, 3)


def compute_contingency_table(obs: np.ndarray, pred: np.ndarray, threshold: float) -> Tuple[int, int, int, int]:
    """Compute (Hits, False Alarms, Misses, Correct Negatives) at threshold."""
    hits = int(np.sum((obs >= threshold) & (pred >= threshold)))
    false_alarms = int(np.sum((obs < threshold) & (pred >= threshold)))
    misses = int(np.sum((obs >= threshold) & (pred < threshold)))
    correct_negatives = int(np.sum((obs < threshold) & (pred < threshold)))
    return hits, false_alarms, misses, correct_negatives


def compute_categorical_scores(obs: np.ndarray, pred: np.ndarray, threshold: float) -> CategoricalVerification:
    """Compute POD, FAR, CSI, ETS at given rainfall threshold."""
    h, f, m, c = compute_contingency_table(obs, pred, threshold)
    total = h + f + m + c

    pod = round(float(h / (h + m)), 3) if (h + m) > 0 else 0.0
    far = round(float(f / (h + f)), 3) if (h + f) > 0 else 0.0
    csi = round(float(h / (h + f + m)), 3) if (h + f + m) > 0 else 0.0

    # Equitable Threat Score (ETS)
    # He = (h + m) * (h + f) / total
    # ETS = (h - He) / (h + f + m - He)
    if total > 0:
        he = ((h + m) * (h + f)) / total
        denom = (h + f + m - he)
        ets = round(float((h - he) / denom), 3) if denom != 0 else 0.0
    else:
        ets = 0.0

    return CategoricalVerification(
        threshold_mm=threshold,
        csi=csi,
        ets=ets,
        pod=pod,
        far=far,
        sample_count=total
    )


class EvaluationEngine:
    """Evaluation framework comparing Raw NWP, Global ML, and REGNOVA."""

    def __init__(self):
        self.version = "1.0.0-evaluation-engine"

    def evaluate_dataset(
        self,
        df_eval: pd.DataFrame,
        global_ml_preds: np.ndarray,
        regnova_preds: np.ndarray,
        dataset_name: str = "Synthetic Monsoon Benchmark",
        data_mode: DataMode = DataMode.SYNTHETIC_DEMO,
    ) -> EvaluationRunResponse:
        """Run independent backtest verification against held-out observations."""
        obs = df_eval["observed_rainfall_mm"].values
        raw_nwp = df_eval["raw_nwp_rainfall_mm"].values
        n_samples = len(obs)

        # 1. Continuous metrics
        rmse_raw, mae_raw, bias_raw, corr_raw = compute_continuous_metrics(obs, raw_nwp)
        rmse_glob, mae_glob, bias_glob, corr_glob = compute_continuous_metrics(obs, global_ml_preds)
        rmse_reg, mae_reg, bias_reg, corr_reg = compute_continuous_metrics(obs, regnova_preds)

        # 2. Categorical metrics across thresholds (15.6mm, 35.5mm, 64.5mm)
        thresholds = [15.6, 35.5, 64.5]
        cat_raw = [compute_categorical_scores(obs, raw_nwp, t) for t in thresholds]
        cat_glob = [compute_categorical_scores(obs, global_ml_preds, t) for t in thresholds]
        cat_reg = [compute_categorical_scores(obs, regnova_preds, t) for t in thresholds]

        # 3. Brier Score for >35.5mm event
        obs_binary_35 = (obs >= 35.5).astype(float)
        brier_raw = float(np.mean(((raw_nwp >= 35.5).astype(float) - obs_binary_35) ** 2))
        brier_glob = float(np.mean(((global_ml_preds >= 35.5).astype(float) - obs_binary_35) ** 2))
        brier_reg = float(np.mean(((regnova_preds >= 35.5).astype(float) - obs_binary_35) ** 2))

        raw_metrics = ModelEvaluationMetrics(
            model_name="Raw NWP (Baseline)",
            rmse_mm=rmse_raw,
            mae_mm=mae_raw,
            bias_mm=bias_raw,
            correlation=corr_raw,
            brier_score_gt35mm=round(brier_raw, 3),
            categorical_metrics=cat_raw,
            sample_count=n_samples,
        )

        global_metrics = ModelEvaluationMetrics(
            model_name="Global XGBoost Baseline",
            rmse_mm=rmse_glob,
            mae_mm=mae_glob,
            bias_mm=bias_glob,
            correlation=corr_glob,
            brier_score_gt35mm=round(brier_glob, 3),
            categorical_metrics=cat_glob,
            sample_count=n_samples,
        )

        regnova_metrics = ModelEvaluationMetrics(
            model_name="REGNOVA (Regime-Adaptive Expert Mix)",
            rmse_mm=rmse_reg,
            mae_mm=mae_reg,
            bias_mm=bias_reg,
            correlation=corr_reg,
            brier_score_gt35mm=round(brier_reg, 3),
            categorical_metrics=cat_reg,
            sample_count=n_samples,
        )

        # 4. Stratification by Regime
        strat_regime: Dict[str, Dict[str, float]] = {}
        for reg in ["ACTIVE_MONSOON", "BREAK_MONSOON", "DEPRESSION", "COAST_TERRAIN", "TRANSITION_OR_UNKNOWN"]:
            mask = df_eval["ground_truth_regime"] == reg
            if np.sum(mask) > 0:
                sub_obs = obs[mask]
                sub_raw = raw_nwp[mask]
                sub_reg = regnova_preds[mask]
                rmse_sub_raw, _, _, _ = compute_continuous_metrics(sub_obs, sub_raw)
                rmse_sub_reg, _, _, _ = compute_continuous_metrics(sub_obs, sub_reg)
                strat_regime[reg] = {
                    "raw_nwp_rmse": rmse_sub_raw,
                    "regnova_rmse": rmse_sub_reg,
                    "sample_count": int(np.sum(mask))
                }

        # 5. Stratification by Lead Time (24h, 48h, 72h)
        strat_lead: Dict[str, Dict[str, float]] = {}
        for lead in [24, 48, 72]:
            mask = df_eval["lead_time_hours"] == lead
            if np.sum(mask) > 0:
                sub_obs = obs[mask]
                sub_raw = raw_nwp[mask]
                sub_reg = regnova_preds[mask]
                rmse_sub_raw, _, _, _ = compute_continuous_metrics(sub_obs, sub_raw)
                rmse_sub_reg, _, _, _ = compute_continuous_metrics(sub_obs, sub_reg)
                strat_lead[f"{lead}h"] = {
                    "raw_nwp_rmse": rmse_sub_raw,
                    "regnova_rmse": rmse_sub_reg,
                    "sample_count": int(np.sum(mask))
                }

        # 6. Improved vs Degraded Case Counting
        raw_abs_err = np.abs(raw_nwp - obs)
        reg_abs_err = np.abs(regnova_preds - obs)
        improved_cases = int(np.sum(reg_abs_err < (raw_abs_err - 0.5)))
        degraded_cases = int(np.sum(reg_abs_err > (raw_abs_err + 0.5)))

        dates = pd.to_datetime(df_eval["date"])
        return EvaluationRunResponse(
            evaluation_id="eval-" + str(np.random.randint(100000, 999999)),
            dataset_name=dataset_name,
            data_mode=data_mode,
            test_period_start=dates.min().to_pydatetime(),
            test_period_end=dates.max().to_pydatetime(),
            raw_nwp_metrics=raw_metrics,
            global_ml_metrics=global_metrics,
            regnova_metrics=regnova_metrics,
            stratified_by_regime=strat_regime,
            stratified_by_lead_time=strat_lead,
            cases_regnova_improved_count=improved_cases,
            cases_regnova_degraded_count=degraded_cases,
            total_evaluation_samples=n_samples,
        )
