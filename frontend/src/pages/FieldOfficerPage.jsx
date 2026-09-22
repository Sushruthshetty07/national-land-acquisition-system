import React, { useState, useEffect } from 'react';
import {
  Smartphone, MapPin, CheckCircle2, ShieldCheck, Camera,
  Navigation, Upload, FileText, AlertCircle, RefreshCw
} from 'lucide-react';
import { StatusBadge } from '../components/common/Badge';
import api from '../services/api';

export default function FieldOfficerPage() {
  const [parcels, setParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Field verification form
  const [fieldOfficerName, setFieldOfficerName] = useState('Govind Patil (Revenue Inspector)');
  const [possessionType, setPossessionType] = useState('COMPLETED');
  const [demarcationConfirmed, setDemarcationConfirmed] = useState(true);
  const [panchnamaWitnesses, setPanchnamaWitnesses] = useState('2 Witnesses (Tahsildar & Village Talathi)');
  const [remarks, setRemarks] = useState('Physical boundary stones installed; panchnama executed with witnesses on ground.');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Simulated GPS Coordinates
  const [gpsLocation, setGpsLocation] = useState({ lat: 19.3204, lng: 72.8512, accuracy: '±2.4m' });

  const loadParcels = async () => {
    setLoading(true);
    try {
      const res = await api.getParcels({ limit: 25 });
      if (res.success) {
        setParcels(res.parcels);
        if (res.parcels.length > 0 && !selectedParcel) {
          setSelectedParcel(res.parcels[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  const handleSelectParcel = (p) => {
    setSelectedParcel(p);
    setSuccessMsg('');
    setGpsLocation({
      lat: Number((p.latitude + 0.0001).toFixed(6)),
      lng: Number((p.longitude + 0.0001).toFixed(6)),
      accuracy: '±1.8m (DGPS Verified)'
    });
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setSaving(true);
    try {
      const res = await api.fieldVerifyParcel(selectedParcel.id, {
        possession_status: possessionType,
        remarks: `${remarks} | Witnesses: ${panchnamaWitnesses} | Officer: ${fieldOfficerName}`,
        demarcation_verified: demarcationConfirmed,
        latitude: gpsLocation.lat,
        longitude: gpsLocation.lng
      });
      if (res.success) {
        setSuccessMsg(`✓ Survey No. ${selectedParcel.survey_number} field verification and physical possession handover successfully saved!`);
        loadParcels();
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="bg-emerald-800 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Mobile Field Surveyor & Revenue Inspector Mode
            </div>
            <h1 className="text-xl font-black">On-Site Ground Demarcation & Possession App</h1>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-1.5 border border-white/20 text-xs font-mono flex items-center gap-2">
          <Navigation className="w-4 h-4 text-emerald-300 animate-pulse" />
          <span>GPS Fix: {gpsLocation.lat}, {gpsLocation.lng} ({gpsLocation.accuracy})</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-medium text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Field Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Parcel Quick Selector (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 uppercase text-[10px]">Select Target Parcel for Inspection</span>
            <span className="text-[10px] text-slate-400 font-mono">{parcels.length} AVAILABLE</span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {parcels.map((p) => {
              const isSelected = selectedParcel && selectedParcel.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectParcel(p)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900">Survey No. {p.survey_number}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      p.possession_status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.possession_status}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] truncate">
                    {p.village}, {p.taluk} • {p.area_ha} Ha
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5 truncate">
                    Owner: {p.owner_name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Field Verification & Panchnama Submission (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 text-xs">
          {selectedParcel ? (
            <form onSubmit={handleSubmitVerification} className="space-y-3.5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Active Field Verification Dossier</span>
                  <h3 className="text-base font-bold text-slate-900">
                    Survey No. {selectedParcel.survey_number} ({selectedParcel.parcel_code})
                  </h3>
                </div>
                <StatusBadge status={selectedParcel.acquisition_status} />
              </div>

              {/* Readonly Parcel Cadastral Telemetry */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                <div><strong>Village:</strong> {selectedParcel.village}</div>
                <div><strong>Taluk:</strong> {selectedParcel.taluk}</div>
                <div><strong>Acquisition Area:</strong> {selectedParcel.area_ha} Hectares</div>
                <div><strong>Land Type:</strong> {selectedParcel.land_type}</div>
                <div><strong>Owner:</strong> {selectedParcel.owner_name}</div>
                <div><strong>Compensation:</strong> ₹{(selectedParcel.assessed_compensation / 100000).toFixed(2)} Lakhs</div>
              </div>

              {/* On-Site Inspector Inputs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Revenue Officer / Surveyor Name</label>
                <input
                  type="text"
                  required
                  value={fieldOfficerName}
                  onChange={(e) => setFieldOfficerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Possession Execution Status</label>
                <select
                  value={possessionType}
                  onChange={(e) => setPossessionType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800"
                >
                  <option value="COMPLETED">Physical Possession Handed Over (Encumbrance-Free)</option>
                  <option value="DEMARCATED">Boundary Demarcated Only (Structures Pending Relocation)</option>
                  <option value="DISPUTED">Contested on Site / Court Stay Claim</option>
                </select>
              </div>

              {/* Checkbox Demarcation */}
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    checked={demarcationConfirmed}
                    onChange={(e) => setDemarcationConfirmed(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Physical boundary demarcation stones erected on all 4 corners</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer font-semibold text-emerald-900">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Zero unauthorized encroachments or agricultural crops standing</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panchnama Witnesses Attestation</label>
                <input
                  type="text"
                  required
                  value={panchnamaWitnesses}
                  onChange={(e) => setPanchnamaWitnesses(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  placeholder="Names of 2 independent local village witnesses"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Inspection & Panchnama Remarks</label>
                <textarea
                  rows="2"
                  required
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              {/* Photo Upload Simulation Button */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span>Geotagged Boundary Photo Attached</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  IMG_{selectedParcel.survey_number?.replace('/', '_')}_WGS84.JPG (Attached)
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{saving ? 'Transmitting Field Telemetry...' : 'Submit Official Field Verification & Handover'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a land parcel on the left to inspect and record on-site demarcation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
