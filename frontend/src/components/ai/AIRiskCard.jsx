import React from 'react';
import { AlertTriangle, BrainCircuit, CheckCircle2, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { RiskBadge } from '../common/Badge';

export default function AIRiskCard({
  riskScore = 78,
  riskLevel = 'HIGH',
  reasons = [
    'Award declaration delayed beyond 74 statutory SLA days',
    'Compensation pending: 62% of award awaiting DBT release',
    'R&R progress below expected level: 28 families in transitional shelter'
  ],
  predictedDelayMonths = 7.8,
  delayProbability = 82,
  onRunSimulation
}) {
  const isHigh = riskScore >= 70;
  const isMedium = riskScore >= 40 && riskScore < 70;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>AI Decision-Support & Risk Engine</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-normal">Scikit-Learn ML</span>
            </h3>
            <p className="text-[11px] text-slate-500">Predictive project slippage & RFCTLARR statutory risk analysis</p>
          </div>
        </div>

        <RiskBadge level={riskLevel} score={riskScore} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Risk Score Meter */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Composite Risk Score</div>
          <div className="flex items-baseline gap-2 my-2">
            <span className={`text-3xl font-extrabold ${isHigh ? 'text-red-600' : isMedium ? 'text-amber-600' : 'text-emerald-600'}`}>
              {riskScore}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 100</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isHigh ? 'bg-red-600' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(riskScore, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Predicted Delay Months */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">ML Delay Forecast</div>
          <div className="flex items-baseline gap-1 my-2">
            <span className="text-3xl font-extrabold text-slate-900">
              +{predictedDelayMonths}
            </span>
            <span className="text-xs text-slate-500 font-semibold">months estimated</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
            <span>Probability: <strong className="text-slate-800">{delayProbability}%</strong></span>
          </div>
        </div>

        {/* Statutory Compliance Indicator */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
          <div className="text-xs text-slate-500 font-medium">Statutory SLA Compliance</div>
          <div className="my-2">
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
              isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isHigh ? '⚠️ SLA Breached (Sec 19/23)' : '⚡ Active Watchlist'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400">Section 19(7) RFCTLARR statutory clock active</div>
        </div>
      </div>

      {/* Explainable Administrative Reasons */}
      <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 mb-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>Explainable Risk & Delay Factors:</span>
        </div>
        <ul className="space-y-1.5">
          {reasons && reasons.length > 0 ? (
            reasons.map((r, i) => (
              <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                <span className="text-red-500 font-bold leading-tight">•</span>
                <span>{r}</span>
              </li>
            ))
          ) : (
            <li className="text-xs text-slate-500">No major statutory risk factors currently flagged.</li>
          )}
        </ul>
      </div>

      {/* Mandatory Statutory Disclaimer */}
      <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 leading-snug flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Statutory Governance Notice:</strong> AI predictions and risk scores are decision-support recommendations to assist Competent Authorities and Land Acquisition Officers. They do not constitute an automatic government order or determination under the RFCTLARR Act 2013.
        </div>
      </div>
    </div>
  );
}
