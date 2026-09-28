"""Unit tests for Evaluation Engine."""
import numpy as np
import pytest
from services.ml.evaluation_engine import (
    compute_continuous_metrics,
    compute_categorical_scores,
    EvaluationEngine,
)
from services.ml.data_generator import generate_synthetic_dataset
from packages.contracts.schemas import DataMode


def test_continuous_and_categorical_metrics():
    obs = np.array([0.0, 10.0, 40.0, 70.0, 120.0])
    pred = np.array([2.0, 12.0, 38.0, 65.0, 110.0])

    rmse, mae, bias, corr = compute_continuous_metrics(obs, pred)
    assert rmse >= 0.0
    assert mae >= 0.0
    assert corr > 0.90

    cat_35 = compute_categorical_scores(obs, pred, 35.5)
    assert 0.0 <= cat_35.csi <= 1.0
    assert 0.0 <= cat_35.pod <= 1.0
    assert 0.0 <= cat_35.far <= 1.0
