import React, { useState } from 'react';
import {
  X, CheckCircle2, AlertTriangle, ShieldCheck, MapPin,
  Coins, FileText, UserCheck, Calendar, Hash, ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../common/Badge';
import api from '../../services/api';

export default function ParcelDrawer({ parcel, onClose, onRefresh }) {
  const [verifying, setVerifying] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!parcel) return null;

  const handleFieldVerify = async () => {
    setVerifying(true);
    try {
      await api.fieldVerifyParcel(parcel.id, {
        possession_status: 'COMPLETED',
        remarks: 'Physical boundary stones and panchnama verified on site by revenue officer.'
      });
      setSuccessMsg('Field verification and physical possession successfully recorded!');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Verification failed: ' + err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-slide-left">
      {/* Drawer Header */}
      <div className="p-4 bg-gov-navy text-white flex items-center justify-between">
        <div>
          <div className="text-xs text-amber-400 font-mono font-semibold">{parcel.parcel_code || parcel.id}</div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Survey No. {parcel.survey_number}</span>
          </h3>
          <p className="text-xs text-slate-300">{parcel.village}, {parcel.taluk}, {parcel.district_name || 'District'}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Acquisition Status</div>
            <StatusBadge status={parcel.acquisition_status} />
          </div>
          <div className="border-l border-slate-200 pl-3">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Possession Status</div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              parcel.possession_status === 'COMPLETED'
                ? 'bg-emerald-100 text-emerald-800'
                : parcel.possession_status === 'DEMARCATED'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {parcel.possession_status}
            </span>
          </div>
        </div>

        {/* Cadastral & Ownership Details */}
        <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-blue-800 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5" /> Cadastral & Titling Details
          </h4>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div><strong>Khata No:</strong> {parcel.khata_number || 'KH-718'}</div>
            <div><strong>Sub-Division:</strong> {parcel.sub_division || 'SD-1'}</div>
            <div><strong>Land Type:</strong> {parcel.land_type}</div>
            <div><strong>Acquired Area:</strong> <span className="font-bold text-slate-900">{parcel.area_ha} Ha</span></div>
            <div><strong>Owner Name:</strong> {parcel.owner_name}</div>
            <div><strong>Aadhaar Token:</strong> {parcel.owner_aadhaar_token}</div>
            <div><strong>Co-Owners:</strong> {parcel.co_owners_count || 1}</div>
            <div><strong>Village / Taluk:</strong> {parcel.village}, {parcel.taluk}</div>
          </div>
        </div>

        {/* Compensation & Valuation */}
        <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-amber-50/30">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-800 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5" /> RFCTLARR Fair Compensation
          </h4>
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>Circle Rate per Ha:</span>
              <span className="font-medium">₹{(parcel.market_rate_per_ha / 100000).toFixed(2)} Lakhs</span>
            </div>
            <div className="flex justify-between">
              <span>Total Assessed Compensation:</span>
              <span className="font-bold text-slate-900">₹{(parcel.assessed_compensation / 100000).toFixed(2)} Lakhs</span>
            </div>
            <div className="flex justify-between">
              <span>Total Disbursed (DBT):</span>
              <span className={`font-bold ${parcel.disbursed_compensation >= parcel.assessed_compensation ? 'text-emerald-700' : 'text-amber-700'}`}>
                ₹{(parcel.disbursed_compensation / 100000).toFixed(2)} Lakhs
              </span>
            </div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/60">
              *Includes 100% Solatium and 12% statutory additional interest
            </div>
          </div>
        </div>

        {/* Field Verification & Demarcation */}
        <div className="border border-slate-200 rounded-xl p-3.5 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Physical Ground Verification
          </h4>
          {parcel.field_verified ? (
            <div className="space-y-1 text-slate-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Field Verified on Site</span>
              </div>
              <div><strong>Verified By:</strong> {parcel.field_verified_by || 'Special Land Acquisition Officer'}</div>
              <div><strong>Demarcation:</strong> Physical GPS boundary stones validated</div>
            </div>
          ) : (
            <div className="space-y-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <div className="text-amber-800 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Pending On-Site Demarcation Verification</span>
              </div>
              <button
                onClick={handleFieldVerify}
                disabled={verifying}
                className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-sm transition"
              >
                {verifying ? 'Recording Verification...' : '✓ Record Field Verification & Possession'}
              </button>
            </div>
          )}
        </div>

        {/* GPS Coordinates */}
        <div className="border border-slate-200 rounded-xl p-3 text-slate-500 font-mono text-[11px] flex justify-between items-center">
          <span>Lat: {parcel.latitude?.toFixed(5)}, Lng: {parcel.longitude?.toFixed(5)}</span>
          <span className="text-blue-600 font-sans font-semibold">WGS-84</span>
        </div>
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
