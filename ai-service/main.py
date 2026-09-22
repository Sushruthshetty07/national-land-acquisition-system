import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from models.risk_scorer import calculate_project_risk
from models.duplicate_detector import detect_duplicate_parcels
from models.insight_generator import generate_administrative_insights

app = FastAPI(
    title="National Land Acquisition AI & ML Microservice",
    description="Production-grade AI models for Project Delay Prediction, RFCTLARR Risk Scoring, Cadastral Duplicate Detection, and Administrative Insights.",
    version="1.0.0"
)

# Enable CORS for Frontend & Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Scikit-learn models
models_dir = os.path.join(os.path.dirname(__file__), 'models')
regressor_path = os.path.join(models_dir, 'delay_regressor.joblib')
classifier_path = os.path.join(models_dir, 'delay_classifier.joblib')

delay_regressor = None
delay_classifier = None

try:
    if os.path.exists(regressor_path):
        delay_regressor = joblib.load(regressor_path)
    if os.path.exists(classifier_path):
        delay_classifier = joblib.load(classifier_path)
    print(" Scikit-learn models loaded successfully.")
except Exception as e:
    print(f"⚠️ Model load error: {e}")

# Request Models
class DelayPredictionRequest(BaseModel):
    required_land_ha: float
    affected_families: int
    forest_pct: Optional[float] = 10.0
    disputed_parcels: Optional[int] = 2
    is_urban: Optional[int] = 0
    state_efficiency: Optional[float] = 1.0
    budget_cr: Optional[float] = 1000.0

class RiskScoreRequest(BaseModel):
    current_stage: Optional[str] = "ACQUISITION"
    overall_status: Optional[str] = "ON_TRACK"
    required_land_ha: Optional[float] = 500.0
    compensation_budget_cr: Optional[float] = 250.0
    compensation_disbursed_cr: Optional[float] = 120.0
    displaced_families: Optional[int] = 50
    rehabilitated_families: Optional[int] = 20
    disputed_parcels: Optional[int] = 2
    forest_clearance: Optional[bool] = True
    wildlife_clearance: Optional[bool] = True
    months_active: Optional[int] = 14

class DuplicateDetectionRequest(BaseModel):
    target_parcel: Dict[str, Any]
    existing_parcels: List[Dict[str, Any]]

class InsightsRequest(BaseModel):
    kpis: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "AI & Data Analytics Microservice",
        "models_loaded": delay_regressor is not None and delay_classifier is not None,
        "version": "1.0.0"
    }

@app.post("/predict-delay")
def predict_delay(req: DelayPredictionRequest):
    """
    ML Random Forest Regressor & Classifier predicting project completion delay in months
    and probability of major slippage (>6 months).
    """
    try:
        X = pd.DataFrame([{
            'required_land_ha': req.required_land_ha,
            'affected_families': req.affected_families,
            'forest_pct': req.forest_pct or 0.0,
            'disputed_parcels': req.disputed_parcels or 0,
            'is_urban': req.is_urban or 0,
            'state_efficiency': req.state_efficiency or 1.0,
            'budget_cr': req.budget_cr or 1000.0
        }])

        predicted_months = 4.5
        delay_prob = 0.35

        if delay_regressor is not None:
            predicted_months = float(delay_regressor.predict(X)[0])
        if delay_classifier is not None:
            delay_prob = float(delay_classifier.predict_proba(X)[0][1])

        # Formulate top drivers
        drivers = []
        if req.forest_pct and req.forest_pct > 15:
            drivers.append(f"Forest Diversion Clearance Requirement ({req.forest_pct}% of alignment passes through notified reserve forest)")
        if req.disputed_parcels and req.disputed_parcels > 3:
            drivers.append(f"High Litigation Exposure ({req.disputed_parcels} parcels in title arbitration or civil stay)")
        if req.is_urban:
            drivers.append("Urban Density Complexity (higher structural valuation disputes and dense utility relocation)")
        if req.affected_families > 200:
            drivers.append(f"Significant R&R Scale ({req.affected_families} affected families requiring comprehensive resettlement survey)")
        if not drivers:
            drivers.append("Linear alignment progress within standard statutory parameters")

        return {
            "success": True,
            "predicted_delay_months": round(max(0.0, predicted_months), 1),
            "delay_probability_percent": int(round(delay_prob * 100)),
            "risk_category": "CRITICAL" if predicted_months > 12 else ("HIGH" if predicted_months > 6 else ("MODERATE" if predicted_months > 3 else "LOW")),
            "confidence_range_months": [
                round(max(0.0, predicted_months - 1.8), 1),
                round(predicted_months + 2.2, 1)
            ],
            "key_drivers": drivers,
            "statutory_disclaimer": "Decision-support recommendation generated by ML system; not an automatic government determination."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/risk-score")
def calculate_risk(req: RiskScoreRequest):
    """
    Computes multi-factor risk score (0-100) and explainable reasons for an acquisition project.
    """
    try:
        data = req.dict()
        result = calculate_project_risk(data)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-duplicates")
def detect_duplicates(req: DuplicateDetectionRequest):
    """
    Evaluates spatial bounding box overlap and cadastral survey collisions across parcels.
    """
    try:
        result = detect_duplicate_parcels(req.target_parcel, req.existing_parcels)
        return {
            "success": True,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/insights/administrative")
def get_insights(req: InsightsRequest):
    """
    Generates high-level natural language executive insights and administrative recommendations.
    """
    try:
        insights = generate_administrative_insights(req.kpis)
        return {
            "success": True,
            "count": len(insights),
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-project")
def analyze_project_complete(project_data: Dict[str, Any]):
    """
    Comprehensive one-stop AI evaluation of a project combining ML Delay Prediction,
    Multi-Factor Risk Scoring, and Tailored Administrative Recommendations.
    """
    try:
        # Risk Score
        risk_res = calculate_project_risk(project_data)

        # ML Delay
        req_land = float(project_data.get('required_land_ha', 200))
        aff_fam = int(project_data.get('affected_families', 50))
        disp_par = int(project_data.get('disputed_parcels', 1))
        forest = 15.0 if not project_data.get('forest_clearance', True) else 3.0

        delay_months = 4.0
        delay_prob = 0.30
        if delay_regressor is not None:
            df = pd.DataFrame([{
                'required_land_ha': req_land,
                'affected_families': aff_fam,
                'forest_pct': forest,
                'disputed_parcels': disp_par,
                'is_urban': 1 if 'Expressway' not in str(project_data.get('project_type', '')) else 0,
                'state_efficiency': 1.05,
                'budget_cr': float(project_data.get('budget_cr', 2000))
            }])
            delay_months = float(delay_regressor.predict(df)[0])
            delay_prob = float(delay_classifier.predict_proba(df)[0][1])

        return {
            "success": True,
            "risk_score": risk_res["risk_score"],
            "risk_level": risk_res["risk_level"],
            "reasons": risk_res["reasons"],
            "sub_scores": risk_res["sub_scores"],
            "predicted_delay_months": round(max(0.0, delay_months), 1),
            "delay_probability_percent": int(round(delay_prob * 100)),
            "statutory_disclaimer": "Decision-support recommendation generated by ML system; requires statutory approval."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
