import React, { useState, useEffect } from 'react';
import {
  MapPin, Filter, Search, Plus, Layers, RefreshCw,
  CheckCircle2, AlertTriangle, Eye, Compass, X
} from 'lucide-react';
import GISMap from '../components/gis/GISMap';
import ParcelDrawer from '../components/gis/ParcelDrawer';
import { StatusBadge } from '../components/common/Badge';
import api from '../services/api';

export default function GISMapPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    state_id: '',
    district_id: '',
    project_id: '',
    status: '',
    search: ''
  });

  // Geo-Tag New Parcel Modal
  const [showGeoTagModal, setShowGeoTagModal] = useState(false);
  const [newParcelForm, setNewParcelForm] = useState({
    project_id: '',
    state_id: 'ST-MH',
    district_id: 'DIST-MH-01',
    taluk: 'Vasai',
    village: 'Sasunavghar',
    survey_number: '142/3A',
    khata_number: 'KH-8812',
    land_type: 'Agricultural (Irrigated)',
    area_ha: 1.45,
    owner_name: 'Babu Rao Ganpat Rao',
    latitude: 19.315,
    longitude: 72.845,
    market_rate_per_ha: 4200000
  });

  const loadParcels = async () => {
    setLoading(true);
    try {
      const res = await api.getParcels(filters);
      if (res.success) {
        setParcels(res.parcels);
      }
    } catch (e) {
      console.error('Failed to load parcels:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial metadata load
    Promise.all([
      api.getStates().catch(() => ({ states: [] })),
      api.getProjects().catch(() => ({ projects: [] }))
    ]).then(([stRes, prjRes]) => {
      if (stRes.states) setStates(stRes.states);
      if (prjRes.projects) setProjects(prjRes.projects);
      if (prjRes.projects && prjRes.projects.length > 0) {
        setNewParcelForm(prev => ({ ...prev, project_id: prjRes.projects[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    if (filters.state_id) {
      api.getDistricts(filters.state_id).then(dRes => {
        if (dRes.districts) setDistricts(dRes.districts);
      });
    } else {
      setDistricts([]);
    }
  }, [filters.state_id]);

  useEffect(() => {
    loadParcels();
  }, [filters.state_id, filters.district_id, filters.project_id, filters.status]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadParcels();
  };

  const handleCreateParcel = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createParcel(newParcelForm);
      if (res.success) {
        alert('Parcel geo-tagged successfully with coordinates and polygon!');
        setShowGeoTagModal(false);
        loadParcels();
      }
    } catch (err) {
      alert('Failed to geo-tag parcel: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            <span>Interactive GIS Land Parcel & Cadastral Mapping Suite</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time geospatial boundaries, cadastral survey overlay, and physical demarcation tracking
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowGeoTagModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Geo-Tag New Parcel</span>
          </button>
          <button
            onClick={loadParcels}
            className="p-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs transition"
            title="Refresh Map"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
        {/* State Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">State</label>
          <select
            value={filters.state_id}
            onChange={(e) => setFilters({ ...filters, state_id: e.target.value, district_id: '' })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All States ({states.length})</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        {/* District Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">District</label>
          <select
            value={filters.district_id}
            onChange={(e) => setFilters({ ...filters, district_id: e.target.value })}
            disabled={!filters.state_id}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All Districts</option>
            {districts.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Infrastructure Project</label>
          <select
            value={filters.project_id}
            onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Infrastructure Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Acquisition Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="POSSESSION">Possession Taken</option>
            <option value="COMPENSATION_DISBURSEMENT">Compensation Disbursed</option>
            <option value="AWARD">Award Declared</option>
            <option value="ACQUISITION">Section 19 Declared</option>
            <option value="NOTIFICATION">Section 11 Notified</option>
            <option value="PROPOSED">Proposed</option>
            <option value="DISPUTED">Disputed / Stay</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Search Cadastre</label>
          <form onSubmit={handleSearch} className="flex space-x-1">
            <input
              type="text"
              placeholder="Survey / Village..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-gov-navy text-white rounded-lg hover:bg-slate-800 transition shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* GIS Map Canvas */}
      <GISMap
        parcels={parcels}
        selectedParcel={selectedParcel}
        onSelectParcel={(parcel) => setSelectedParcel(parcel)}
        height="640px"
        center={parcels.length > 0 ? [parcels[0].latitude, parcels[0].longitude] : [20.5937, 78.9629]}
        zoom={parcels.length > 0 ? 12 : 5}
      />

      {/* Parcel Drawer */}
      {selectedParcel && (
        <ParcelDrawer
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onRefresh={loadParcels}
        />
      )}

      {/* Geo-Tag New Parcel Modal */}
      {showGeoTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-700" />
                  <span>Geo-Tag New Land Parcel (GPS Boundary)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Record on-ground coordinates and register initial cadastral entry</p>
              </div>
              <button
                onClick={() => setShowGeoTagModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParcel} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Infrastructure Project</label>
                <select
                  value={newParcelForm.project_id}
                  onChange={(e) => setNewParcelForm({ ...newParcelForm, project_id: e.target.value })}
                  required
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.project_code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Survey Number</label>
                  <input
                    type="text"
                    required
                    value={newParcelForm.survey_number}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, survey_number: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    placeholder="e.g. 104/2B"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khata Number</label>
                  <input
                    type="text"
                    value={newParcelForm.khata_number}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, khata_number: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                    placeholder="e.g. KH-412"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={newParcelForm.village}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, village: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taluk / Tehsil</label>
                  <input
                    type="text"
                    required
                    value={newParcelForm.taluk}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, taluk: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area (Hectares)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newParcelForm.area_ha}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, area_ha: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Land Classification</label>
                  <select
                    value={newParcelForm.land_type}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, land_type: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option>Agricultural (Irrigated)</option>
                    <option>Agricultural (Dry)</option>
                    <option>Commercial</option>
                    <option>Industrial</option>
                    <option>Homestead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Latitude (WGS84)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newParcelForm.latitude}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, latitude: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GPS Longitude (WGS84)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={newParcelForm.longitude}
                    onChange={(e) => setNewParcelForm({ ...newParcelForm, longitude: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg p-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title Holder / Khatedar Name</label>
                <input
                  type="text"
                  required
                  value={newParcelForm.owner_name}
                  onChange={(e) => setNewParcelForm({ ...newParcelForm, owner_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGeoTagModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Save & Geo-Tag Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
