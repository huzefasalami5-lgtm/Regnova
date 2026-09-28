# REGNOVA Meteorological Regime Definitions

**Team**: VYSTRAL | **SIH 2026**: SIH26080

---

## 1. Active Monsoon (`ACTIVE_MONSOON`)
- **Atmospheric Profile**: Column-integrated precipitable water (PWV) > 55 mm, 850 hPa relative humidity > 80%, low-level westerly jet speed > 10 m/s over Arabian Sea, monsoon trough aligned across Central India (19°N – 24°N).
- **Rainfall Characteristics**: Widespread, persistent convective rainfall across the core monsoon zone.

## 2. Break Monsoon (`BREAK_MONSOON`)
- **Atmospheric Profile**: Trough shifted northwards to Himalayan foothills (> 26°N), surface pressure above climatology over central India, weak westerlies (< 8 m/s), low central RH (< 70%).
- **Rainfall Characteristics**: Suppressed precipitation over Central & Peninsular India; heavy orographic rain concentrated along foothills and Northeast India.

## 3. Monsoon Depression (`DEPRESSION`)
- **Atmospheric Profile**: Pronounced cyclonic vorticity at 850 hPa (> 8 × 10⁻⁵ s⁻¹), central MSLP anomaly (< 1000 hPa), high moisture convergence.
- **Rainfall Characteristics**: Intense, localized precipitation swaths along westward-moving cyclonic tracks across Odisha, West Bengal, and Central India.

## 4. Coast & Terrain Enhancement (`COAST_TERRAIN`)
- **Atmospheric Profile**: Cross-barrier low-level flow intercepting Western Ghats orography (elevation > 200m) and coastal boundary layer convergence (< 80 km from coast).
- **Rainfall Characteristics**: Strong localized orographic precipitation spikes with steep gradients between windward and leeward zones.

## 5. Transition or Unknown (`TRANSITION_OR_UNKNOWN`)
- **Atmospheric Profile**: Equivocal atmospheric signals, weak synoptic forcing, or regime change phases.
- **Fallback**: System routes majority weight to the Global Baseline Regressor.
