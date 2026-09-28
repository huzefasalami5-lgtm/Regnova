"""SQLAlchemy ORM models for REGNOVA."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from .database import Base


def generate_uuid():
    return str(uuid.uuid4())


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False, default="DEMO_VIEWER")
    full_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class District(Base):
    __tablename__ = "districts"

    id = Column(String(50), primary_key=True)
    district_name = Column(String(100), nullable=False, index=True)
    state_name = Column(String(100), nullable=False, index=True)
    centroid_lat = Column(Float, nullable=False)
    centroid_lon = Column(Float, nullable=False)
    terrain_elevation_m = Column(Float, default=0.0)
    coastal_proximity_km = Column(Float, default=100.0)
    climatological_mean_jjas_mm = Column(Float, default=850.0)
    geojson_geometry = Column(JSON, nullable=True)


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    source_name = Column(String(100), nullable=False)
    data_mode = Column(String(30), nullable=False, default="SYNTHETIC_DEMO")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    spatial_resolution_deg = Column(Float, default=0.25)
    file_path = Column(String(255), nullable=True)
    provenance_metadata = Column(JSON, nullable=True)
    quality_check_passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)


class ForecastRun(Base):
    __tablename__ = "forecast_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=True)
    issue_time = Column(DateTime, nullable=False, index=True)
    valid_time = Column(DateTime, nullable=False, index=True)
    lead_time_hours = Column(Integer, nullable=False, default=24)
    data_mode = Column(String(30), nullable=False, default="SYNTHETIC_DEMO")
    primary_regime = Column(String(50), nullable=False)
    regime_probabilities = Column(JSON, nullable=False)
    gating_weights = Column(JSON, nullable=False)
    model_version = Column(String(50), nullable=False, default="v1.0.0")
    created_at = Column(DateTime, default=utc_now)

    district_forecasts = relationship("DistrictForecast", back_populates="forecast_run", cascade="all, delete-orphan")


class DistrictForecast(Base):
    __tablename__ = "district_forecasts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    forecast_run_id = Column(String(36), ForeignKey("forecast_runs.id"), nullable=False, index=True)
    district_id = Column(String(50), ForeignKey("districts.id"), nullable=False, index=True)
    raw_nwp_rainfall_mm = Column(Float, nullable=False)
    global_ml_rainfall_mm = Column(Float, nullable=False)
    regnova_corrected_rainfall_mm = Column(Float, nullable=False)
    observed_rainfall_mm = Column(Float, nullable=True)
    prob_heavy_rain_gt35_pct = Column(Float, default=0.0)
    prob_vheavy_rain_gt64_pct = Column(Float, default=0.0)
    prob_extheavy_rain_gt115_pct = Column(Float, default=0.0)
    uncertainty_std_mm = Column(Float, default=2.5)
    expert_weights = Column(JSON, nullable=True)

    forecast_run = relationship("ForecastRun", back_populates="district_forecasts")


class ModelArtifact(Base):
    __tablename__ = "model_artifacts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model_name = Column(String(100), nullable=False)
    architecture = Column(String(50), nullable=False)
    version = Column(String(30), nullable=False)
    status = Column(String(30), default="ACTIVE")
    training_rmse = Column(Float, nullable=True)
    validation_rmse = Column(Float, nullable=True)
    feature_names = Column(JSON, nullable=True)
    hyperparameters = Column(JSON, nullable=True)
    artifact_path = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_name = Column(String(100), nullable=False)
    data_mode = Column(String(30), nullable=False, default="SYNTHETIC_DEMO")
    test_period_start = Column(DateTime, nullable=False)
    test_period_end = Column(DateTime, nullable=False)
    metrics_summary = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=utc_now)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_name = Column(String(100), nullable=False)
    status = Column(String(30), default="COMPLETED")
    started_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)
    data_mode = Column(String(30), default="SYNTHETIC_DEMO")
    events_log = Column(JSON, nullable=False, default=list)
    summary_report = Column(Text, nullable=True)
    evidence = Column(JSON, nullable=True)
    approved_by = Column(String(100), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=utc_now)
