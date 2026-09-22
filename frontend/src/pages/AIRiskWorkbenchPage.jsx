import React, { useState, useEffect } from 'react';
import {
  BrainCircuit, Sparkles, TrendingUp, AlertTriangle,
  ShieldAlert, Layers, Search, RefreshCw, CheckCircle2, Sliders
} from 'lucide-react';
import { RiskBadge, SeverityBadge } from '../components/common/Badge';
import api from '../services/api';

export default function AIRiskWorkbenchPage() {
  const [activeTab, setActiveTab] = useState('delay'); // 'delay' | 'duplicate' | 'insights'

  // Delay Prediction State
  const [delayInputs, setDelayInputs] = useState({
    required_land_ha: 1450.0,
    affected_families: 240,
    forest_pct: 18.5,
    disputed_parcels: 6,
    is_urban: 0,
    state_efficiency: 0.95,
    budget_cr: 15400
  });
  const [delayPrediction, setDelayPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  // Duplicate Detector State
  const [targetParcel, setTargetParcel] = useState({
    survey_number: '100/1A',
    village: 'Pelhar',
    district_id: 'DIST-MH-01',
    latitude: 19.320,
    longitude: 72.850,
    owner_aadhaar_token: 'XXXX-XXXX-1037'
  });
  const [existingParcels, setExistingParcels] = useState([]);
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [detecting, setDetecting] = useState(false);

  // Administrative Insights State
  const [insights, setInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    // Run initial delay prediction
    runDelayPrediction();

    // Fetch existing parcels for duplicate testing
    api.getParcels({ limit: 50 }).then(res => {
      if (res.parcels) setExistingParcels(res.parcels);
    });

    // Fetch administrative insights
    loadInsights();
  }, []);

  const runDelayPrediction = async (e) => {
    if (e) e.preventDefault();
    setPredicting(true);
    try {
      const res = await api.predictDelay(delayInputs);
      if (res.success) {
        setDelayPrediction(res);
      }
    } catch (err) {
      console.error('Delay prediction error:', err);
    } finally {
      setPredicting(false);
    }
  };

  const runDuplicateDetection = async (e) => {
    if (e) e.preventDefault();
    setDetecting(true);
    try {
      const res = await api.detectDuplicates({
        target_parcel: targetParcel,
        existing_parcels: existingParcels
      });
      if (res.success) {
        setDuplicateResult(res);
      }
    } catch (err) {
      console.error('Duplicate detection error:', err);
    } finally {
      setDetecting(false);
    }
  };

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const analyticsRes = await api.getNationalAnalytics().catch(() => null);
      const kpis = analyticsRes?.kpis || {};
      const res = await api.getAdministrativeInsights(kpis);
      if (res.success) {
        setInsights(res.insights);
      }
    } catch (err) {
      console.error('Insights error:', err);
    } finally {
      setLoadingInsights(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2 mb-1">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
            Machine Learning & GIS Spatial Analytics Laboratory
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          AI Risk, Delay Prediction & Duplicate Cadastre Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          FastAPI & Scikit-learn microservices powering predictive delay regression, spatial boundary overlap detection, and policy insights
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('delay')}
          className={`py-2 px-3 border-b-2 transition ${
            activeTab === 'delay' ? 'border-indigo-700 text-indigo-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ML Delay Prediction Simulator
        </button>
        <button
          onClick={() => setActiveTab('duplicate')}
          className={`py-2 px-3 border-b-2 transition ${
            activeTab === 'duplicate' ? 'border-indigo-700 text-indigo-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Spatial & Cadastral Duplicate Detection
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`py-2 px-3 border-b-2 transition ${
            activeTab === 'insights' ? 'border-indigo-700 text-indigo-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Natural Language Administrative Insights
        </button>
      </div>

      {/* Tab 1: Delay Prediction Simulator */}
      {activeTab === 'delay' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-700" />
                <span>Project Parameters Simulation</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">RandomForestRegressor (3,000 Trained Samples)</span>
            </div>

            <form onSubmit={runDelayPrediction} className="space-y-4">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Required Land Area:</span>
                  <span className="font-bold text-indigo-700">{delayInputs.required_land_ha} Hectares</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="4000"
                  step="10"
                  value={delayInputs.required_land_ha}
                  onChange={(e) => setDelayInputs({ ...delayInputs, required_land_ha: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Affected Families Census:</span>
                  <span className="font-bold text-indigo-700">{delayInputs.affected_families} Families</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1500"
                  step="10"
                  value={delayInputs.affected_families}
                  onChange={(e) => setDelayInputs({ ...delayInputs, affected_families: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Forest & Protected Area Intersection:</span>
                  <span className="font-bold text-indigo-700">{delayInputs.forest_pct}% of alignment</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="1"
                  value={delayInputs.forest_pct}
                  onChange={(e) => setDelayInputs({ ...delayInputs, forest_pct: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Title Litigation & Disputed Parcels:</span>
                  <span className="font-bold text-indigo-700">{delayInputs.disputed_parcels} Parcels</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={delayInputs.disputed_parcels}
                  onChange={(e) => setDelayInputs({ ...delayInputs, disputed_parcels: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Territory Density</label>
                  <select
                    value={delayInputs.is_urban}
                    onChange={(e) => setDelayInputs({ ...delayInputs, is_urban: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={0}>Rural Greenfield Alignment</option>
                    <option value={1}>Urban / Peri-Urban Dense Corridor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State Clearance Speed Index</label>
                  <select
                    value={delayInputs.state_efficiency}
                    onChange={(e) => setDelayInputs({ ...delayInputs, state_efficiency: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={1.2}>Fast-Track Clearance (1.2x Benchmark)</option>
                    <option value={1.0}>Standard Baseline (1.0x)</option>
                    <option value={0.8}>Complex Multi-Department Clearance (0.8x)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={predicting}
                className="w-full py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{predicting ? 'Running Scikit-Learn Model...' : 'Recompute ML Delay Forecast'}</span>
              </button>
            </form>
          </div>

          {/* Outputs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {delayPrediction && (
              <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-5 shadow-lg space-y-4 text-xs">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Prediction Results</span>
                  <span className="px-2 py-0.5 rounded bg-red-900/70 text-red-200 font-bold text-[10px]">
                    {delayPrediction.risk_category} RISK
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-[10px]">Predicted Slippage:</span>
                    <div className="text-2xl font-black text-white mt-1">
                      +{delayPrediction.predicted_delay_months}
                      <span className="text-xs font-normal text-slate-400 ml-1">mo</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Range: [{delayPrediction.confidence_range_months?.join(' - ')}] mo
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 text-[10px]">Slippage Probability:</span>
                    <div className="text-2xl font-black text-amber-400 mt-1">
                      {delayPrediction.delay_probability_percent}%
                    </div>
                    <span className="text-[10px] text-slate-400">Exceeding 6mo SLA</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-2">
                  <span className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Key Contributing Risk Drivers:
                  </span>
                  <ul className="space-y-1.5 text-slate-300 text-[11px]">
                    {delayPrediction.key_drivers?.map((d, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-400 font-bold">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[10px] text-amber-200 leading-snug">
                  {delayPrediction.statutory_disclaimer}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Duplicate Cadastral Overlap Detection */}
      {activeTab === 'duplicate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Target Parcel Boundary & Titling Check</h3>
              <p className="text-[11px] text-slate-500">
                Spatial bounding-box proximity and cadastral survey collision analyzer
              </p>
            </div>

            <form onSubmit={runDuplicateDetection} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Survey Number</label>
                  <input
                    type="text"
                    required
                    value={targetParcel.survey_number}
                    onChange={(e) => setTargetParcel({ ...targetParcel, survey_number: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={targetParcel.village}
                    onChange={(e) => setTargetParcel({ ...targetParcel, village: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={targetParcel.latitude}
                    onChange={(e) => setTargetParcel({ ...targetParcel, latitude: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={targetParcel.longitude}
                    onChange={(e) => setTargetParcel({ ...targetParcel, longitude: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claimant Aadhaar Token</label>
                <input
                  type="text"
                  value={targetParcel.owner_aadhaar_token}
                  onChange={(e) => setTargetParcel({ ...targetParcel, owner_aadhaar_token: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={detecting}
                className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm transition"
              >
                {detecting ? 'Scanning National Cadastre...' : 'Run Spatial & Survey Overlap Scan'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {duplicateResult && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Scan Diagnostics</h3>
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    duplicateResult.is_duplicate_detected ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {duplicateResult.is_duplicate_detected ? '⚠️ COLLISION DETECTED' : '✓ CLEAN / NO COLLISION'}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{duplicateResult.recommendation}</p>

                {duplicateResult.collisions && duplicateResult.collisions.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-800 uppercase text-[10px]">Detected Overlaps:</span>
                    {duplicateResult.collisions.map((col, idx) => (
                      <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-red-900">{col.colliding_parcel_code} (Sy {col.survey_number})</span>
                          <SeverityBadge severity={col.severity} />
                        </div>
                        <div className="text-slate-600 text-[11px]">
                          Distance: <strong>{col.distance_meters} meters</strong> in village {col.village}
                        </div>
                        <ul className="text-red-700 text-[10px] space-y-0.5 list-disc pl-4">
                          {col.reasons.map((r, ri) => <li key={ri}>{r}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Administrative Insights */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Real-time macro policy and administrative directives</span>
            <button
              onClick={loadInsights}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
              <span>Regenerate Insights</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <div key={ins.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-sm">{ins.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold uppercase">{ins.category}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{ins.observation}</p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 space-y-1">
                  <strong>Administrative Recommendation:</strong>
                  <p>{ins.recommendation}</p>
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  <strong>Expected Impact:</strong> {ins.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
