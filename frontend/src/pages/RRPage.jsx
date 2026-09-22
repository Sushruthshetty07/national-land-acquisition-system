import React, { useState, useEffect } from 'react';
import {
  Home, Users, CheckCircle2, Clock, AlertTriangle,
  GraduationCap, Award, MapPin, Search, Edit3, X
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RRPage() {
  const { role } = useAuth();
  const [rrCases, setRRCases] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' | 'families'
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState('');

  // Edit Case Modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [editForm, setEditForm] = useState({
    resettlement_colony_name: '',
    house_allotment_status: 'UNDER_CONSTRUCTION',
    house_plot_number: '',
    housing_grant_disbursed: 0,
    resettlement_allowance_disbursed: 0,
    skill_training_provided: 0,
    overall_rr_status: 'IN_PROGRESS'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, famRes, sumRes] = await Promise.all([
        api.getRRCases({ search }),
        api.getAffectedFamilies({}),
        api.getRRSummary()
      ]);
      if (casesRes.success) setRRCases(casesRes.cases);
      if (famRes.success) setFamilies(famRes.families);
      if (sumRes.success) setSummary(sumRes.summary);
    } catch (e) {
      console.error('Failed to load R&R data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (c) => {
    setSelectedCase(c);
    setEditForm({
      resettlement_colony_name: c.resettlement_colony_name || 'Adarsh Punarvas Colony',
      house_allotment_status: c.house_allotment_status || 'UNDER_CONSTRUCTION',
      house_plot_number: c.house_plot_number || 'PLOT-101',
      housing_grant_disbursed: c.housing_grant_disbursed ? 1 : 0,
      resettlement_allowance_disbursed: c.resettlement_allowance_disbursed ? 1 : 0,
      skill_training_provided: c.skill_training_provided ? 1 : 0,
      overall_rr_status: c.overall_rr_status || 'IN_PROGRESS'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateRREntitlement(selectedCase.id, editForm);
      if (res.success) {
        alert('R&R entitlement record updated successfully.');
        setSelectedCase(null);
        loadData();
      }
    } catch (err) {
      alert('Update failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Home className="w-5 h-5 text-emerald-700" />
          <span>Rehabilitation & Resettlement (R&R) Statutory Monitoring</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          RFCTLARR Act 2013 Second & Third Schedules: Displaced families census, housing colonies, grants, and livelihood restoration
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Affected Families"
          value={summary?.totalAffectedFamilies || 12}
          subtitle={`${summary?.bplFamilies || 4} BPL card holders`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Displaced Families"
          value={summary?.totalDisplacedFamilies || 8}
          subtitle="Homestead shelter loss"
          icon={Home}
          color="amber"
        />
        <StatCard
          title="Rehabilitated Families"
          value={summary?.rehabilitatedFamilies || 2}
          subtitle={`${summary?.resettlementRatePercent || 25}% resettlement rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Housing Plots Allotted"
          value={summary?.housingAllotted || 2}
          subtitle="Resettlement enclaves"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('cases')}
          className={`py-2 px-3 border-b-2 transition ${
            activeTab === 'cases' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Resettlement Dossiers ({rrCases.length})
        </button>
        <button
          onClick={() => setActiveTab('families')}
          className={`py-2 px-3 border-b-2 transition ${
            activeTab === 'families' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Affected Families Survey ({families.length})
        </button>
      </div>

      {/* Tab Content: R&R Cases Table */}
      {activeTab === 'cases' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Head of Household</th>
                  <th className="py-3 px-3">Project & District</th>
                  <th className="py-3 px-3">Resettlement Colony</th>
                  <th className="py-3 px-3 text-center">House Allotment</th>
                  <th className="py-3 px-3 text-center">Housing Grant</th>
                  <th className="py-3 px-3 text-center">Skill Training</th>
                  <th className="py-3 px-3 text-center">R&R Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rrCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{c.family_head_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {c.social_category} • {c.family_members_count} members • {c.bpl_card_holder ? 'BPL' : 'Non-BPL'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{c.project_name}</div>
                      <div className="text-[10px] text-slate-400">{c.district_name}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div className="font-medium">{c.resettlement_colony_name || 'Pending Colony Allocation'}</div>
                      <div className="text-[10px] text-slate-400">{c.house_plot_number || 'Plot pending'}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.house_allotment_status === 'OCCUPIED' ? 'bg-emerald-100 text-emerald-800' :
                        c.house_allotment_status === 'UNDER_CONSTRUCTION' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.house_allotment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.housing_grant_disbursed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.housing_grant_disbursed ? '₹1.5L Disbursed' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {c.skill_training_provided ? (
                        <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Trained
                        </span>
                      ) : (
                        <span className="text-slate-400">Not enrolled</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.overall_rr_status === 'RESETTLED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.overall_rr_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-emerald-800 font-semibold rounded text-[11px] border border-slate-200"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Affected Families Survey Table */}
      {activeTab === 'families' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Family Head</th>
                  <th className="py-3 px-3">Aadhaar Token</th>
                  <th className="py-3 px-3">Members</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Title Holder / Tenant</th>
                  <th className="py-3 px-3 text-center">Displaced (Homestead)</th>
                  <th className="py-3 px-3">District</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {families.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{f.family_head_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{f.family_head_aadhaar}</td>
                    <td className="py-2.5 px-3 text-slate-700">{f.family_members_count}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {f.social_category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{f.displacement_type}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.is_displaced ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {f.is_displaced ? 'YES (Displaced)' : 'NO (Livelihood Only)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{f.district_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit R&R Dossier Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Update R&R Entitlement Package</h3>
                <p className="text-[11px] text-slate-500">{selectedCase.family_head_name} ({selectedCase.id})</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resettlement Colony Name</label>
                <input
                  type="text"
                  value={editForm.resettlement_colony_name}
                  onChange={(e) => setEditForm({ ...editForm, resettlement_colony_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">House Allotment Status</label>
                  <select
                    value={editForm.house_allotment_status}
                    onChange={(e) => setEditForm({ ...editForm, house_allotment_status: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_CONSTRUCTION">Under Construction</option>
                    <option value="ALLOTTED">Allotted</option>
                    <option value="OCCUPIED">Occupied (Handed Over)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">House / Plot Number</label>
                  <input
                    type="text"
                    value={editForm.house_plot_number}
                    onChange={(e) => setEditForm({ ...editForm, house_plot_number: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.housing_grant_disbursed === 1}
                    onChange={(e) => setEditForm({ ...editForm, housing_grant_disbursed: e.target.checked ? 1 : 0 })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>₹1,50,000 Housing Construction Assistance Disbursed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.resettlement_allowance_disbursed === 1}
                    onChange={(e) => setEditForm({ ...editForm, resettlement_allowance_disbursed: e.target.checked ? 1 : 0 })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>₹50,000 One-Time Resettlement Allowance Disbursed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.skill_training_provided === 1}
                    onChange={(e) => setEditForm({ ...editForm, skill_training_provided: e.target.checked ? 1 : 0 })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Vocational Skill Development Program Completed</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Overall Case Status</label>
                <select
                  value={editForm.overall_rr_status}
                  onChange={(e) => setEditForm({ ...editForm, overall_rr_status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESETTLED">Resettled (Closure Approved)</option>
                  <option value="IDENTIFIED">Identified</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Dossier Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
