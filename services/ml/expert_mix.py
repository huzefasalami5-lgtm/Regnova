"""EXPERT-MIX: Regime-Aware Mixture-of-Experts for Monsoon Forecast Correction.

Orchestrates:
1. Raw NWP baseline (no correction)
2. Global ML baseline (Global Gradient Boosted Regressor)
3. Specialized Regime Experts (Active, Break, Depression, Coast/Terrain)
4. Dynamic soft gating fusion with fallback and non-negativity preservation.
"""
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple, Any
from packages.contracts.schemas import AtmosphericPredictors, RegimeType


class FastDecisionStump:
    """Fast decision stump for pure-numpy gradient boosted regression trees."""

    def __init__(self):
        self.feature_idx: int = 0
        self.threshold: float = 0.0
        self.left_val: float = 0.0
        self.right_val: float = 0.0

    def fit(self, X: np.ndarray, residuals: np.ndarray):
        n_samples, n_features = X.shape
        best_loss = float('inf')

        # Sample feature thresholds
        for f_idx in range(n_features):
            col_vals = X[:, f_idx]
            # Test percentiles as thresholds
            thresholds = np.percentile(col_vals, [20, 40, 60, 80])
            for th in thresholds:
                left_mask = col_vals <= th
                right_mask = ~left_mask
                if np.sum(left_mask) == 0 or np.sum(right_mask) == 0:
                    continue
                left_mean = float(np.mean(residuals[left_mask]))
                right_mean = float(np.mean(residuals[right_mask]))

                loss = np.sum((residuals[left_mask] - left_mean) ** 2) + np.sum((residuals[right_mask] - right_mean) ** 2)
                if loss < best_loss:
                    best_loss = loss
                    self.feature_idx = f_idx
                    self.threshold = float(th)
                    self.left_val = left_mean
                    self.right_val = right_mean

    def predict(self, X: np.ndarray) -> np.ndarray:
        col_vals = X[:, self.feature_idx]
        preds = np.where(col_vals <= self.threshold, self.left_val, self.right_val)
        return preds


class PureNumPyGradientBoostingRegressor:
    """Pure NumPy Gradient Boosted Tree Regressor."""

    def __init__(self, n_estimators: int = 20, learning_rate: float = 0.1):
        self.n_estimators = n_estimators
        self.learning_rate = learning_rate
        self.trees: List[FastDecisionStump] = []
        self.base_val: float = 0.0

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.base_val = float(np.mean(y))
        current_preds = np.full(len(y), self.base_val)
        self.trees = []

        for _ in range(self.n_estimators):
            residuals = y - current_preds
            stump = FastDecisionStump()
            stump.fit(X, residuals)
            self.trees.append(stump)
            current_preds += self.learning_rate * stump.predict(X)

    def predict(self, X: np.ndarray) -> np.ndarray:
        preds = np.full(X.shape[0], self.base_val)
        for stump in self.trees:
            preds += self.learning_rate * stump.predict(X)
        return preds


class ExpertModelWrapper:
    """Wrapper around trained regressor for specific meteorological regime."""

    def __init__(self, name: str, regime_type: RegimeType):
        self.name = name
        self.regime_type = regime_type
        self.model: Optional[PureNumPyGradientBoostingRegressor] = None
        self.is_trained = False
        self.feature_names = [
            "raw_nwp_rainfall_mm",
            "lead_time_hours",
            "precipitable_water_mm",
            "relative_humidity_850hpa_pct",
            "u_wind_850hpa_ms",
            "v_wind_850hpa_ms",
            "mean_sea_level_pressure_hpa",
            "terrain_elevation_m",
            "coastal_distance_km",
        ]

    def fit(self, X: pd.DataFrame, y: pd.Series):
        """Train expert model on subset of historical cases."""
        X_mat = X[self.feature_names].to_numpy(dtype=np.float64)
        y_vec = y.to_numpy(dtype=np.float64)
        self.model = PureNumPyGradientBoostingRegressor(n_estimators=15, learning_rate=0.1)
        self.model.fit(X_mat, y_vec)
        self.is_trained = True

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Predict corrected rainfall with non-negativity enforcement."""
        if not self.is_trained or self.model is None:
            return X["raw_nwp_rainfall_mm"].values
        X_mat = X[self.feature_names].to_numpy(dtype=np.float64)
        preds = self.model.predict(X_mat)
        return np.clip(preds, 0.0, None)


class ExpertMixPipeline:
    """Core Mixture-of-Experts pipeline."""

    def __init__(self):
        self.version = "1.0.0-expert-mix"
        self.global_model = ExpertModelWrapper("Global_XGBoost_Baseline", RegimeType.TRANSITION_OR_UNKNOWN)
        self.active_expert = ExpertModelWrapper("Active_Monsoon_Expert", RegimeType.ACTIVE_MONSOON)
        self.break_expert = ExpertModelWrapper("Break_Monsoon_Expert", RegimeType.BREAK_MONSOON)
        self.depression_expert = ExpertModelWrapper("Depression_Expert", RegimeType.DEPRESSION)
        self.coast_expert = ExpertModelWrapper("Coast_Terrain_Expert", RegimeType.COAST_TERRAIN)
        self.experts = {
            RegimeType.ACTIVE_MONSOON.value: self.active_expert,
            RegimeType.BREAK_MONSOON.value: self.break_expert,
            RegimeType.DEPRESSION.value: self.depression_expert,
            RegimeType.COAST_TERRAIN.value: self.coast_expert,
        }
        self.is_trained = False

    def train_all_models(self, df_train: pd.DataFrame) -> Dict[str, Any]:
        """Train global model and regime-specialized experts on partitioned training data."""
        y = df_train["observed_rainfall_mm"]

        # 1. Train Global Baseline on all data
        self.global_model.fit(df_train, y)

        # 2. Train Active Monsoon Expert
        active_df = df_train[df_train["ground_truth_regime"] == "ACTIVE_MONSOON"]
        if len(active_df) >= 10:
            self.active_expert.fit(active_df, active_df["observed_rainfall_mm"])

        # 3. Train Break Monsoon Expert
        break_df = df_train[df_train["ground_truth_regime"] == "BREAK_MONSOON"]
        if len(break_df) >= 10:
            self.break_expert.fit(break_df, break_df["observed_rainfall_mm"])

        # 4. Train Depression Expert
        dep_df = df_train[df_train["ground_truth_regime"] == "DEPRESSION"]
        if len(dep_df) >= 10:
            self.depression_expert.fit(dep_df, dep_df["observed_rainfall_mm"])

        # 5. Train Coast & Terrain Expert
        coast_df = df_train[df_train["ground_truth_regime"] == "COAST_TERRAIN"]
        if len(coast_df) >= 10:
            self.coast_expert.fit(coast_df, coast_df["observed_rainfall_mm"])

        self.is_trained = True

        return {
            "status": "TRAINED",
            "global_model_samples": len(df_train),
            "active_samples": len(active_df),
            "break_samples": len(break_df),
            "depression_samples": len(dep_df),
            "coast_samples": len(coast_df),
        }

    def predict_fusion(
        self,
        features_df: pd.DataFrame,
        gating_weights: Dict[str, float]
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """Perform probability-weighted soft fusion across experts."""
        raw_nwp = features_df["raw_nwp_rainfall_mm"].values

        # Global ML prediction
        global_pred = self.global_model.predict(features_df)

        # Expert predictions
        weighted_sum = np.zeros(len(features_df))
        total_weight = 0.0

        for regime_key, expert in self.experts.items():
            weight = gating_weights.get(regime_key, 0.0)
            if weight > 0.001:
                expert_pred = expert.predict(features_df)
                weighted_sum += weight * expert_pred
                total_weight += weight

        # Include transition / unknown weight routed to global model
        transition_weight = gating_weights.get(RegimeType.TRANSITION_OR_UNKNOWN.value, 0.0)
        if transition_weight > 0.001 or total_weight < 0.99:
            rem_weight = max(transition_weight, 1.0 - total_weight)
            weighted_sum += rem_weight * global_pred
            total_weight += rem_weight

        regnova_pred = weighted_sum / max(total_weight, 1e-6)
        regnova_pred = np.clip(regnova_pred, 0.0, None)

        return raw_nwp, global_pred, regnova_pred
