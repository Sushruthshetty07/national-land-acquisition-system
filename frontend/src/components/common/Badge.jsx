import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    PROPOSAL: { bg: 'bg-amber-50 text-amber-800 border-amber-300', label: 'Proposal' },
    LAND_REQUIREMENT: { bg: 'bg-orange-50 text-orange-800 border-orange-300', label: 'Land Req & SIA' },
    SCRUTINY: { bg: 'bg-blue-50 text-blue-800 border-blue-300', label: 'Scrutiny' },
    APPROVAL: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-300', label: 'Govt Approved' },
    NOTIFICATION: { bg: 'bg-purple-50 text-purple-800 border-purple-300', label: 'Sec 11 Notified' },
    ACQUISITION: { bg: 'bg-cyan-50 text-cyan-800 border-cyan-300', label: 'Sec 19 Declared' },
    AWARD: { bg: 'bg-sky-50 text-sky-800 border-sky-300', label: 'Award Declared' },
    COMPENSATION_ASSESSMENT: { bg: 'bg-teal-50 text-teal-800 border-teal-300', label: 'Comp Assessed' },
    COMPENSATION_DISBURSEMENT: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', label: 'Comp Disbursed' },
    POSSESSION: { bg: 'bg-green-100 text-green-900 border-green-400 font-semibold', label: 'Possession Taken' },
    REHABILITATION_RESETTLEMENT: { bg: 'bg-yellow-50 text-yellow-800 border-yellow-300', label: 'R&R Ongoing' },
    PROJECT_CLOSURE: { bg: 'bg-slate-100 text-slate-800 border-slate-300', label: 'Closed & Mutated' },
    DISPUTED: { bg: 'bg-red-50 text-red-800 border-red-300 font-semibold', label: 'Disputed / Stay' },
    ON_TRACK: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', label: 'On Track' },
    DELAYED: { bg: 'bg-amber-50 text-amber-700 border-amber-300', label: 'Delayed' },
    CRITICAL: { bg: 'bg-red-50 text-red-700 border-red-300', label: 'Critical' },
    COMPLETED: { bg: 'bg-green-50 text-green-700 border-green-300', label: 'Completed' }
  };

  const item = map[status] || { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${item.bg}`}>
      {item.label}
    </span>
  );
}

export function RiskBadge({ level, score }) {
  if (level === 'HIGH' || score >= 70) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
        HIGH RISK {score ? `(${score})` : ''}
      </span>
    );
  }
  if (level === 'MEDIUM' || (score >= 40 && score < 70)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
        MEDIUM RISK {score ? `(${score})` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-300">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
      LOW RISK {score ? `(${score})` : ''}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const map = {
    CRITICAL: 'bg-red-600 text-white font-bold',
    HIGH: 'bg-orange-500 text-white font-semibold',
    MEDIUM: 'bg-amber-100 text-amber-800 border border-amber-300',
    LOW: 'bg-slate-100 text-slate-700 border border-slate-300'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-wide uppercase ${map[severity] || map.LOW}`}>
      {severity}
    </span>
  );
}
