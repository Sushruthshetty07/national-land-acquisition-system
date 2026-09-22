import React, { useState, useEffect } from 'react';
import {
  FileCheck, CheckCircle2, XCircle, AlertCircle, ArrowRight,
  ShieldCheck, Upload, BookOpen, Clock, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function WorkflowPage() {
  const { role } = useAuth();
  const [stages, setStages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [activeStageId, setActiveStageId] = useState('SCRUTINY');

  // Scrutiny checklist state
  const [checklist, setChecklist] = useState({
    multiCropChecked: true,
    siaHearingHeld: true,
    cadastralMatched: true,
    forestNocReceived: false,
    collectorApproved: true
  });
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Gazette publish form
  const [gazetteForm, setGazetteForm] = useState({
    projectId: '',
    notificationType: 'SEC11_PRELIMINARY',
    gazetteNumber: 'E-GAZETTE-2026/SEC11-901',
    issuingAuthority: 'Revenue Department & District Collector',
    affectedVillagesCount: 8,
    totalAreaHa: 240.5,
    remarks: 'Preliminary notification under Section 11(1) RFCTLARR published for public notice.'
  });

  useEffect(() => {
    api.getWorkflowStages().then(res => { if (res.stages) setStages(res.stages); });
    api.getProjects().then(res => {
      if (res.projects && res.projects.length > 0) {
        setProjects(res.projects);
        setSelectedProject(res.projects[0].id);
        setGazetteForm(prev => ({ ...prev, projectId: res.projects[0].id }));
      }
    });
  }, []);

  const handleProcessScrutiny = async (action) => {
    if (!selectedProject) return alert('Please select a project.');
    setSubmitting(true);
    try {
      const res = await api.processWorkflowAction({
        projectId: selectedProject,
        currentStage: activeStageId,
        targetStage: action === 'APPROVE' ? 'APPROVAL' : activeStageId,
        action: action,
        remarks: remarks || `${action} action completed under Competent Authority review.`
      });
      alert(res.message);
    } catch (err) {
      alert('Workflow action failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishGazette = async (e) => {
    e.preventDefault();
    try {
      const res = await api.publishGazetteNotification(gazetteForm);
      if (res.success) {
        alert(res.message);
      }
    } catch (err) {
      alert('Gazette publication failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-700" />
          <span>Statutory Land Acquisition Workflow & Scrutiny Engine</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step statutory verification, multi-tiered scrutiny checklists, and e-Gazette notifications
        </p>
      </div>

      {/* Select Active Project */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div>
          <span className="text-slate-500 font-medium">Select Infrastructure Project for Workflow Execution:</span>
        </div>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.project_code}) - Stage: {p.current_stage}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 12-Stage Guide (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-gov-navy" />
            <span>12 Statutory Stages (RFCTLARR 2013)</span>
          </h2>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {stages.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStageId(s.id)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                  activeStageId === s.id
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                    {s.stepNumber}
                  </span>
                  <span className="truncate">{s.name}</span>
                </div>
                <span className="text-[10px] text-slate-400">{s.slaDays}d</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Scrutiny Checklist & Gazette Tools (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Scrutiny Checklist Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Active Stage Scrutiny</span>
                <h3 className="text-base font-bold text-slate-900">
                  {stages.find(s => s.id === activeStageId)?.name || 'Scrutiny & Verification'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                SLA: {stages.find(s => s.id === activeStageId)?.slaDays || 45} Days
              </span>
            </div>

            <p className="text-slate-600 text-xs">
              {stages.find(s => s.id === activeStageId)?.description || 'Verify statutory requirements before submitting for clearance.'}
            </p>

            {/* Checklist Items */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Competent Authority Verification Checklist
              </span>
              <div className="space-y-2 pt-1 text-slate-700">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.cadastralMatched}
                    onChange={(e) => setChecklist({ ...checklist, cadastralMatched: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Joint Measurement Survey (JMS) cadastral coordinates matched with RoR / 7/12 village maps</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.multiCropChecked}
                    onChange={(e) => setChecklist({ ...checklist, multiCropChecked: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Section 10 multi-crop irrigated land restrictions verified and within statutory ceiling</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.siaHearingHeld}
                    onChange={(e) => setChecklist({ ...checklist, siaHearingHeld: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Section 4 Social Impact Assessment (SIA) public hearings conducted in affected Gram Sabhas</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.forestNocReceived}
                    onChange={(e) => setChecklist({ ...checklist, forestNocReceived: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Forest & Environmental in-principle NOC cleared</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Competent Authority Scrutiny Remarks</label>
              <textarea
                rows="2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter Collectorate verification findings or discrepancy notes..."
                className="w-full border border-slate-300 rounded-lg p-2 text-xs"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                disabled={submitting}
                onClick={() => handleProcessScrutiny('REJECT')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg font-semibold text-xs transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject & Return for Correction</span>
              </button>
              <button
                disabled={submitting}
                onClick={() => handleProcessScrutiny('APPROVE')}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-xs shadow-sm transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Approve Stage</span>
              </button>
            </div>
          </div>

          {/* e-Gazette Notification Publication Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 text-xs">
            <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-700" />
                <span>Issue Statutory e-Gazette Notification (Section 11 / 19)</span>
              </h3>
              <span className="text-[10px] text-slate-400">Official Gazette Publishing Gateway</span>
            </div>

            <form onSubmit={handlePublishGazette} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notification Type</label>
                  <select
                    value={gazetteForm.notificationType}
                    onChange={(e) => setGazetteForm({ ...gazetteForm, notificationType: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="SEC11_PRELIMINARY">Section 11 Preliminary Notification</option>
                    <option value="SEC19_DECLARATION">Section 19 Declaration of Acquisition</option>
                    <option value="SEC4_SIA">Section 4 SIA Preliminary Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">e-Gazette Bulletin Number</label>
                  <input
                    type="text"
                    required
                    value={gazetteForm.gazetteNumber}
                    onChange={(e) => setGazetteForm({ ...gazetteForm, gazetteNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Affected Villages Count</label>
                  <input
                    type="number"
                    value={gazetteForm.affectedVillagesCount}
                    onChange={(e) => setGazetteForm({ ...gazetteForm, affectedVillagesCount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Notified Area (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gazetteForm.totalAreaHa}
                    onChange={(e) => setGazetteForm({ ...gazetteForm, totalAreaHa: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-sm text-xs transition"
                >
                  Publish Gazette Notification & Trigger Statutory Clock
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
