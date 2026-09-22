import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderKanban, MapPin, Coins, Home, Clock, FileText,
  AlertTriangle, CheckCircle2, ChevronRight, ArrowLeft,
  BrainCircuit, ShieldCheck, Download, Plus, Layers
} from 'lucide-react';
import LifecycleTimeline from '../components/workflow/LifecycleTimeline';
import AIRiskCard from '../components/ai/AIRiskCard';
import GISMap from '../components/gis/GISMap';
import ParcelDrawer from '../components/gis/ParcelDrawer';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { role } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, gis, ai, notifications, awards, milestones, documents
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);

  // Stage Advance Modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [targetStage, setTargetStage] = useState('');
  const [advanceRemarks, setAdvanceRemarks] = useState('');

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await api.getProject(id);
      if (res.success) {
        setProject(res.project);
      }

      const pRes = await api.getParcels({ project_id: id });
      if (pRes.success) {
        setParcels(pRes.parcels);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const handleAdvanceStage = async (e) => {
    e.preventDefault();
    try {
      const res = await api.processWorkflowAction({
        projectId: project.id,
        currentStage: project.current_stage,
        targetStage: targetStage,
        action: 'APPROVE',
        remarks: advanceRemarks
      });
      if (res.success) {
        alert(res.message);
        setShowAdvanceModal(false);
        loadProjectDetails();
      }
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading project telemetry...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center text-slate-600">
        <p>Project not found.</p>
        <Link to="/projects" className="text-blue-600 underline text-xs mt-2 inline-block">Back to Projects</Link>
      </div>
    );
  }

  const canAdvanceStage = ['SUPER_ADMIN', 'CENTRAL_MINISTRY', 'STATE_ADMIN', 'DISTRICT_ADMIN'].includes(role);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-800">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/projects" className="hover:text-slate-800">Projects</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 truncate">{project.name}</span>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                {project.project_code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                {project.project_type}
              </span>
              <StatusBadge status={project.overall_status} />
              <RiskBadge level={project.risk_level} score={project.risk_score} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span><strong>Implementing Agency:</strong> {project.implementing_agency}</span>
              <span><strong>Ministry:</strong> {project.ministry}</span>
              <span><strong>State / District:</strong> {project.state_name}, {project.district_name}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {canAdvanceStage && (
              <button
                onClick={() => {
                  setTargetStage('');
                  setShowAdvanceModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <span>Process Stage Approval</span>
              </button>
            )}
            <Link
              to="/reports"
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Export Dossier
            </Link>
          </div>
        </div>

        {/* 12-Stage Visual Lifecycle Stepper */}
        <LifecycleTimeline
          currentStage={project.current_stage}
          overallStatus={project.overall_status}
          milestones={project.milestones || []}
          canEdit={canAdvanceStage}
          onAdvanceStage={(next) => {
            setTargetStage(next);
            setShowAdvanceModal(true);
          }}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex space-x-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Project Overview' },
          { id: 'gis', label: `Land Parcels & GIS (${parcels.length})` },
          { id: 'ai', label: 'AI Risk & Delay Prediction' },
          { id: 'notifications', label: `Notifications (${project.notifications?.length || 0})` },
          { id: 'awards', label: `Awards & Valuation (${project.awards?.length || 0})` },
          { id: 'milestones', label: 'Milestones Schedule' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-2 px-3 border-b-2 font-semibold transition whitespace-nowrap ${
              activeTab === t.id
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500">Required Land</span>
              <div className="text-xl font-bold text-slate-900 mt-1">{project.required_land_ha} Ha</div>
              <span className="text-[10px] text-slate-400">Total statutory requisition</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500">Acquired / Demarcated</span>
              <div className="text-xl font-bold text-emerald-700 mt-1">{project.acquired_land_ha} Ha</div>
              <span className="text-[10px] text-slate-400">{Math.round((project.acquired_land_ha / project.required_land_ha) * 100)}% possession handover</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500">Remaining Land</span>
              <div className="text-xl font-bold text-amber-700 mt-1">{project.remaining_land_ha} Ha</div>
              <span className="text-[10px] text-slate-400">Pending award / possession</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-500">Compensation Outlay</span>
              <div className="text-xl font-bold text-slate-900 mt-1">₹{project.compensation_budget_cr} Cr</div>
              <span className="text-[10px] text-slate-400">Allocated in project budget</span>
            </div>
          </div>

          {/* Description & Environmental Clearances */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Detailed Project Scope & Public Purpose</h3>
              <p className="text-slate-600 leading-relaxed">{project.description || 'Public infrastructure corridor executed under national connectivity scheme.'}</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 text-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Statutory Clearances</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Social Impact Assessment (SIA):</span>
                  <span className="font-bold text-emerald-700">✓ Completed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Stage-II Forest Clearance:</span>
                  <span className={`font-bold ${project.forest_clearance ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {project.forest_clearance ? '✓ Cleared' : '⏳ In Review'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Wildlife Sanctuary Clearance:</span>
                  <span className={`font-bold ${project.wildlife_clearance ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {project.wildlife_clearance ? '✓ Cleared' : 'Not Required'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: GIS Land Parcels */}
      {activeTab === 'gis' && (
        <div className="space-y-4">
          <GISMap
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={(p) => setSelectedParcel(p)}
            height="500px"
            center={parcels.length > 0 ? [parcels[0].latitude, parcels[0].longitude] : [20.0, 78.0]}
            zoom={parcels.length > 0 ? 12 : 6}
          />

          {/* Parcels List Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
              Surveyed Land Parcels ({parcels.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Survey No</th>
                    <th className="py-2.5 px-3">Village / Taluk</th>
                    <th className="py-2.5 px-3">Khatedar Owner</th>
                    <th className="py-2.5 px-3 text-right">Area (Ha)</th>
                    <th className="py-2.5 px-3 text-right">Assessed Comp (₹)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Possession</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parcels.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3 font-bold text-slate-900">{p.survey_number}</td>
                      <td className="py-2 px-3 text-slate-600">{p.village}, {p.taluk}</td>
                      <td className="py-2 px-3 text-slate-800">{p.owner_name}</td>
                      <td className="py-2 px-3 text-right font-semibold">{p.area_ha}</td>
                      <td className="py-2 px-3 text-right">₹{(p.assessed_compensation / 100000).toFixed(2)} L</td>
                      <td className="py-2 px-3 text-center">
                        <StatusBadge status={p.acquisition_status} />
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.possession_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {p.possession_status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => setSelectedParcel(p)}
                          className="px-2 py-1 bg-blue-50 text-blue-700 font-semibold rounded text-[10px] hover:bg-blue-100"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI Risk & Delay Forecast */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <AIRiskCard
            riskScore={project.risk_score || 45}
            riskLevel={project.risk_level || 'MEDIUM'}
            reasons={[
              'Section 19 declaration statutory timeline active',
              'Compensation disbursement in progress: 38% pending escrow',
              'R&R resettlement colony amenities construction ongoing'
            ]}
            predictedDelayMonths={project.risk_score > 60 ? 8.2 : 3.4}
            delayProbability={project.risk_score > 60 ? 78 : 34}
          />
        </div>
      )}

      {/* Tab 4: Gazette Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
            Statutory RFCTLARR Gazette Publications
          </div>
          <div className="divide-y divide-slate-100">
            {project.notifications && project.notifications.length > 0 ? (
              project.notifications.map((n) => (
                <div key={n.id} className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{n.gazette_number}</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold text-[10px]">{n.notification_type}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>Issue Date:</strong> {n.issue_date}</span>
                    <span><strong>Authority:</strong> {n.issuing_authority}</span>
                    <span><strong>Affected Area:</strong> {n.total_area_ha} Ha ({n.affected_villages_count} villages)</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{n.remarks}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">No statutory notifications issued yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Collector Awards */}
      {activeTab === 'awards' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
            Collector Award Orders (Section 23/30 RFCTLARR Act 2013)
          </div>
          <div className="divide-y divide-slate-100">
            {project.awards && project.awards.length > 0 ? (
              project.awards.map((a) => (
                <div key={a.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{a.award_number}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">{a.status}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div>
                      <div className="text-slate-500 text-[10px]">Market Value:</div>
                      <div className="font-semibold">₹{(a.total_market_value / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">100% Solatium:</div>
                      <div className="font-semibold text-emerald-700">₹{(a.solatium_amount / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">12% Interest:</div>
                      <div className="font-semibold">₹{(a.additional_interest / 10000000).toFixed(2)} Cr</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">Total Award:</div>
                      <div className="font-bold text-blue-800">₹{(a.total_award_amount / 10000000).toFixed(2)} Cr</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Approved by: <strong>{a.approved_by}</strong> on {a.award_date}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400">No collector awards declared yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Milestones */}
      {activeTab === 'milestones' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
            Statutory Milestone Adherence Schedule
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Stage #</th>
                <th className="py-2.5 px-3">Milestone Name</th>
                <th className="py-2.5 px-3">Target Date</th>
                <th className="py-2.5 px-3">Actual Date</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {project.milestones?.map(m => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-slate-500">{m.stage_number}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{m.stage_name}</td>
                  <td className="py-2 px-3 text-slate-600">{m.target_date}</td>
                  <td className="py-2 px-3 text-slate-600">{m.actual_completion_date || '—'}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      m.status === 'DELAYED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Parcel Drawer */}
      {selectedParcel && (
        <ParcelDrawer
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onRefresh={loadProjectDetails}
        />
      )}

      {/* Stage Advance / Approval Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Process Statutory Stage Progression</h3>
            <p className="text-[11px] text-slate-500 mb-3">Advance project lifecycle stage under Competent Authority review</p>

            <form onSubmit={handleAdvanceStage} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Stage</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value)}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="">Select next stage...</option>
                  <option value="LAND_REQUIREMENT">2. Land Requirement & SIA</option>
                  <option value="SCRUTINY">3. Scrutiny & Verification</option>
                  <option value="APPROVAL">4. Statutory Approval</option>
                  <option value="NOTIFICATION">5. Section 11 Notification</option>
                  <option value="ACQUISITION">6. Section 19 Declaration</option>
                  <option value="AWARD">7. Award Declaration</option>
                  <option value="COMPENSATION_ASSESSMENT">8. Compensation Assessment</option>
                  <option value="COMPENSATION_DISBURSEMENT">9. Compensation Disbursement</option>
                  <option value="POSSESSION">10. Possession Takeover</option>
                  <option value="REHABILITATION_RESETTLEMENT">11. Rehabilitation & Resettlement</option>
                  <option value="PROJECT_CLOSURE">12. Project Closure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Statutory Order / Approval Remarks</label>
                <textarea
                  rows="3"
                  required
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                  placeholder="Record order reference number, committee sign-off, or gazette date..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Approve & Advance Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
