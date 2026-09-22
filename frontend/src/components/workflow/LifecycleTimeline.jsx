import React, { useState } from 'react';
import {
  CheckCircle2, Clock, AlertCircle, ChevronRight,
  ShieldCheck, FileText, ArrowRight, UserCheck
} from 'lucide-react';

export const STAGES_LIST = [
  { id: 'PROPOSAL', num: 1, name: 'Project Proposal', authority: 'Project Agency', sla: '30 Days' },
  { id: 'LAND_REQUIREMENT', num: 2, name: 'Land Req & SIA', authority: 'SIA Agency / Collector', sla: '180 Days' },
  { id: 'SCRUTINY', num: 3, name: 'Scrutiny', authority: 'Collector / CALA', sla: '45 Days' },
  { id: 'APPROVAL', num: 4, name: 'Statutory Approval', authority: 'Appropriate Govt', sla: '60 Days' },
  { id: 'NOTIFICATION', num: 5, name: 'Sec 11 Notification', authority: 'Govt / Collector', sla: '60 Days' },
  { id: 'ACQUISITION', num: 6, name: 'Sec 19 Declaration', authority: 'State Govt / MoRTH', sla: '365 Days' },
  { id: 'AWARD', num: 7, name: 'Award Declaration', authority: 'Collector / SLAO', sla: '90 Days' },
  { id: 'COMPENSATION_ASSESSMENT', num: 8, name: 'Comp Assessment', authority: 'Valuation Engineers', sla: '45 Days' },
  { id: 'COMPENSATION_DISBURSEMENT', num: 9, name: 'DBT Disbursement', authority: 'SLAO / Lead Bank', sla: '60 Days' },
  { id: 'POSSESSION', num: 10, name: 'Possession Takeover', authority: 'Collector & Agency', sla: '30 Days' },
  { id: 'REHABILITATION_RESETTLEMENT', num: 11, name: 'R&R Execution', authority: 'R&R Commissioner', sla: '180 Days' },
  { id: 'PROJECT_CLOSURE', num: 12, name: 'Project Closure', authority: 'Collector & Tahsildar', sla: '45 Days' }
];

export default function LifecycleTimeline({
  currentStage = 'ACQUISITION',
  overallStatus = 'ON_TRACK',
  milestones = [],
  onAdvanceStage,
  canEdit = false
}) {
  const [selectedStage, setSelectedStage] = useState(null);

  const stageOrder = {
    PROPOSAL: 1,
    LAND_REQUIREMENT: 2,
    SCRUTINY: 3,
    APPROVAL: 4,
    NOTIFICATION: 5,
    ACQUISITION: 6,
    AWARD: 7,
    COMPENSATION_ASSESSMENT: 8,
    COMPENSATION_DISBURSEMENT: 9,
    POSSESSION: 10,
    REHABILITATION_RESETTLEMENT: 11,
    PROJECT_CLOSURE: 12
  };

  const currentStageNum = stageOrder[currentStage] || 6;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>RFCTLARR 2013 Statutory Lifecycle Tracker</span>
            <span className="text-xs font-normal text-slate-500">(12 Standard Stages)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Stage {currentStageNum} of 12: <span className="font-semibold text-blue-700">{STAGES_LIST.find(s => s.id === currentStage)?.name}</span>
          </p>
        </div>

        {canEdit && currentStageNum < 12 && onAdvanceStage && (
          <button
            onClick={() => onAdvanceStage(STAGES_LIST[currentStageNum]?.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <span>Advance to Stage {currentStageNum + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Visual Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
        {STAGES_LIST.map((stage) => {
          const isCompleted = stage.num < currentStageNum;
          const isCurrent = stage.num === currentStageNum;
          const isPending = stage.num > currentStageNum;

          let cardStyle = 'bg-slate-50 border-slate-200 text-slate-400';
          let icon = <span className="text-[10px] font-bold text-slate-400">{stage.num}</span>;

          if (isCompleted) {
            cardStyle = 'bg-emerald-50/80 border-emerald-300 text-emerald-800 hover:bg-emerald-100/70';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
          } else if (isCurrent) {
            cardStyle = overallStatus === 'DELAYED'
              ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-2 ring-amber-400/40'
              : 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm ring-2 ring-blue-500/30';
            icon = overallStatus === 'DELAYED'
              ? <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
              : <Clock className="w-4 h-4 text-blue-600 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />;
          }

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`p-2 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer relative ${cardStyle}`}
            >
              <div className="flex items-center justify-between mb-1">
                {icon}
                <span className="text-[9px] font-mono opacity-60">S{stage.num}</span>
              </div>
              <div className="text-[11px] font-bold leading-tight line-clamp-2">{stage.name}</div>
              <div className="text-[9px] opacity-75 mt-1 truncate">{stage.sla}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Drawer / Info Box */}
      {selectedStage && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                STAGE {selectedStage.num}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{selectedStage.name}</h4>
            </div>
            <div className="mt-1 text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>Competent Authority:</strong> {selectedStage.authority}</span>
              <span><strong>Statutory SLA:</strong> {selectedStage.sla}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
              selectedStage.num < currentStageNum
                ? 'bg-emerald-100 text-emerald-800'
                : selectedStage.num === currentStageNum
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-200 text-slate-600'
            }`}>
              {selectedStage.num < currentStageNum ? 'COMPLETED' : (selectedStage.num === currentStageNum ? 'ACTIVE STAGE' : 'PENDING')}
            </span>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-slate-400 hover:text-slate-700 px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
