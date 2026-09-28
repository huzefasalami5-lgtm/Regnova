"""Unit tests for EXPERT-MIX Mixture-of-Experts pipeline."""
import numpy as np
import pytest
from services.ml.data_generator import generate_synthetic_dataset
from services.ml.expert_mix import ExpertMixPipeline


def test_expert_mix_training_and_fusion():
    df = generate_synthetic_dataset(num_days=30, seed=42)
    pipeline = ExpertMixPipeline()
    res = pipeline.train_all_models(df)

    assert res["status"] == "TRAINED"
    assert pipeline.is_trained is True

    # Test fusion inference
    weights = {"ACTIVE_MONSOON": 0.5, "COAST_TERRAIN": 0.5}
    raw, glob, fusion = pipeline.predict_fusion(df.head(10), weights)

    assert len(fusion) == 10
    # Strict non-negativity constraint
    assert np.all(fusion >= 0.0)
