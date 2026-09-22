import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Plus, Search, Filter, ArrowRight,
  Clock, AlertTriangle, CheckCircle2, TrendingUp, X
} from 'lucide-react';
import { StatusBadge, RiskBadge } from '../components/common/Badge';
import api from '../services/api';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState([]);
  const [filters, setFilters] = useState({
    state_id: '',
    status: '',
    type: '',
    search: ''
  });

  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    name: '',
    project_type: 'Expressway',
    implementing_agency: 'NHAI',
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    state_id: 'ST-MH',
    district_id: 'DIST-MH-01',
    required_land_ha: 850.0,
    budget_cr: 12000,
    compensation_budget_cr: 2200,
    start_date: new Date().toISOString().split('T')[0],
    expected_completion_date: '2028-12-31',
    description: ''
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects(filters);
      if (res.success) {
        setProjects(res.projects);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getStates().then(res => { if (res.states) setStates(res.states); });
  }, []);

  useEffect(() => {
    loadProjects();
  }, [filters.state_id, filters.status, filters.type]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProjects();
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createProject(proposalForm);
      if (res.success) {
        alert(`Project proposal ${res.projectCode} submitted successfully!`);
        setShowProposalModal(false);
        loadProjects();
      }
    } catch (err) {
      alert('Failed to submit proposal: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-blue-700" />
            <span>National Infrastructure Projects & Acquisition Registry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized registry tracking linear infrastructure, corridors, and 12-stage RFCTLARR milestones
          </p>
        </div>

        <button
          onClick={() => setShowProposalModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gov-navy hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Submit Project Proposal</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
          <select
            value={filters.state_id}
            onChange={(e) => setFilters({ ...filters, state_id: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All States</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Sector / Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Project Types</option>
            <option value="Expressway">Expressway</option>
            <option value="High Speed Railway">High Speed Railway</option>
            <option value="Freight Corridor">Freight Corridor</option>
            <option value="Metro / Suburban Rail">Metro / Suburban Rail</option>
            <option value="Industrial Corridor">Industrial Corridor</option>
            <option value="Port Rail Link">Port Rail Link</option>
            <option value="Aerospace & Defense">Aerospace & Defense</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Overall Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="ON_TRACK">On Track</option>
            <option value="DELAYED">Delayed</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Project</label>
          <form onSubmit={handleSearch} className="flex space-x-1">
            <input
              type="text"
              placeholder="Name / Code / Agency..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-gov-navy text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Projects Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Project Details</th>
                <th className="py-3 px-4">Agency & Ministry</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Required (Ha)</th>
                <th className="py-3 px-4 text-right">Acquired (Ha)</th>
                <th className="py-3 px-4 text-center">Current Stage</th>
                <th className="py-3 px-4 text-center">AI Risk Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => {
                const percent = Math.round(((p.acquired_land_ha || 0) / (p.required_land_ha || 1)) * 100);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <Link to={`/projects/${p.id}`} className="font-bold text-slate-900 hover:text-blue-700 text-xs block">
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono text-slate-500">
                        <span>{p.project_code}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-sans">{p.project_type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{p.implementing_agency}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{p.ministry}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{p.state_name}</div>
                      <div className="text-[10px] text-slate-400">{p.district_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      {p.required_land_ha?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                      <div>{p.acquired_land_ha?.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{percent}% done</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={p.current_stage} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <RiskBadge level={p.risk_level} score={p.risk_score} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={p.overall_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/projects/${p.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 font-semibold rounded text-[11px] transition border border-slate-200 hover:border-blue-200"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Project Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Submit New Land Acquisition Proposal</h3>
                <p className="text-[11px] text-slate-500">Stage 1 of RFCTLARR 2013 Statutory Lifecycle</p>
              </div>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Ring Road Western Bypass"
                  value={proposalForm.name}
                  onChange={(e) => setProposalForm({ ...proposalForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Project Sector / Type</label>
                  <select
                    value={proposalForm.project_type}
                    onChange={(e) => setProposalForm({ ...proposalForm, project_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option>Expressway</option>
                    <option>High Speed Railway</option>
                    <option>Freight Corridor</option>
                    <option>Metro / Suburban Rail</option>
                    <option>Industrial Corridor</option>
                    <option>Port Rail Link</option>
                    <option>Aerospace & Defense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Implementing Agency</label>
                  <input
                    type="text"
                    required
                    value={proposalForm.implementing_agency}
                    onChange={(e) => setProposalForm({ ...proposalForm, implementing_agency: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={proposalForm.state_id}
                    onChange={(e) => setProposalForm({ ...proposalForm, state_id: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nodal Ministry</label>
                  <input
                    type="text"
                    required
                    value={proposalForm.ministry}
                    onChange={(e) => setProposalForm({ ...proposalForm, ministry: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Required Land (Ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={proposalForm.required_land_ha}
                    onChange={(e) => setProposalForm({ ...proposalForm, required_land_ha: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Budget (₹ Cr)</label>
                  <input
                    type="number"
                    required
                    value={proposalForm.budget_cr}
                    onChange={(e) => setProposalForm({ ...proposalForm, budget_cr: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Comp Budget (₹ Cr)</label>
                  <input
                    type="number"
                    required
                    value={proposalForm.compensation_budget_cr}
                    onChange={(e) => setProposalForm({ ...proposalForm, compensation_budget_cr: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Proposal Summary / Requisition Rationale</label>
                <textarea
                  rows="3"
                  value={proposalForm.description}
                  onChange={(e) => setProposalForm({ ...proposalForm, description: e.target.value })}
                  placeholder="Describe public purpose alignment, preliminary survey details, and connecting corridors..."
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Submit Proposal to Collectorate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
