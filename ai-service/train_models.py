import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

print("Training Machine Learning models for Land Acquisition Delay & Risk Prediction...")

# Generate realistic training data based on Indian Infrastructure land acquisition case histories
np.random.seed(42)
n_samples = 3000

# Features:
# 1. required_land_ha (10 to 5000 ha)
required_land = np.random.exponential(scale=300, size=n_samples) + 15
required_land = np.clip(required_land, 15, 6000)

# 2. affected_families (10 to 1500)
affected_families = (required_land * np.random.uniform(0.2, 1.8, size=n_samples)).astype(int)
affected_families = np.clip(affected_families, 5, 4000)

# 3. forest_land_pct (0 to 60%)
forest_pct = np.random.beta(a=1.5, b=5, size=n_samples) * 100

# 4. disputed_parcels_count (0 to 50)
disputed_parcels = np.random.poisson(lam=3 + (required_land / 400), size=n_samples)

# 5. is_urban (0 or 1)
is_urban = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])

# 6. state_clearance_efficiency (0.6 to 1.4, where <1 is slower, >1 is faster)
state_efficiency = np.random.uniform(0.65, 1.35, size=n_samples)

# 7. budget_cr (50 to 50000 Cr)
budget_cr = required_land * np.random.uniform(8, 35, size=n_samples)

# Target: Actual delay in months
# Urban areas, high forest %, high disputed parcels, and low state efficiency drive delay
delay_months = (
    (required_land / 500) * 2.5 +
    (forest_pct / 10) * 2.2 +
    (disputed_parcels * 0.85) +
    (is_urban * 3.5) +
    ((1.4 - state_efficiency) * 8.0) +
    np.random.normal(0, 2.0, size=n_samples)
)
delay_months = np.clip(delay_months, 0, 48)

# Binary target: High delay (> 6 months)
high_delay_flag = (delay_months > 6.0).astype(int)

# Create DataFrame
X = pd.DataFrame({
    'required_land_ha': required_land,
    'affected_families': affected_families,
    'forest_pct': forest_pct,
    'disputed_parcels': disputed_parcels,
    'is_urban': is_urban,
    'state_efficiency': state_efficiency,
    'budget_cr': budget_cr
})

# 1. Train Regression Model (Delay in months)
reg_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('rf_reg', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
])
reg_pipeline.fit(X, delay_months)

# 2. Train Classification Model (Probability of delay)
clf_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('rf_clf', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
])
clf_pipeline.fit(X, high_delay_flag)

# Ensure models directory exists
models_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(models_dir, exist_ok=True)

# Save models
joblib.dump(reg_pipeline, os.path.join(models_dir, 'delay_regressor.joblib'))
joblib.dump(clf_pipeline, os.path.join(models_dir, 'delay_classifier.joblib'))

print(f" Models successfully trained on {n_samples} samples and saved to {models_dir}")
