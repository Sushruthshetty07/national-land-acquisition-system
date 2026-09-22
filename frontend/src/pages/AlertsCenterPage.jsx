import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, CheckCircle2, ShieldAlert, Clock,
  Filter, Search, ArrowRight, ShieldCheck, X
} from 'lucide-react';
import { SeverityBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AlertsCenterPage() {
  const { role } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('0'); // 0: unresolved, 1: resolved, '': all

  // Resolve Modal
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [resolveRemarks, setResolveRemarks] = useState('');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts({
        severity: severityFilter,
        is_resolved: statusFilter !== '' ? statusFilter : undefined
      });
      if (res.success) {
        setAlerts(res.alerts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const handleResolveAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.resolveAlert(resolvingAlert.id, {
        remarks: resolveRemarks || 'Statutory review executed by Competent Authority'
      });
      if (res.success) {
        alert('Alert marked resolved in compliance registry.');
        setResolvingAlert(null);
        setResolveRemarks('');
        loadAlerts();
      }
    } catch (err) {
      alert('Failed to resolve alert: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Statutory Compliance & SLA Alert Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automatic alerts for Section 19 12-month statutory expiry, overdue awards, and compensation disbursement bottlenecks
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <label className="font-semibold text-slate-500">Severity:</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <label className="font-semibold text-slate-500">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
            >
              <option value="0">Active & Unresolved</option>
              <option value="1">Resolved Compliance</option>
              <option value="">All Records</option>
            </select>
          </div>
        </div>

        <div className="text-slate-500 text-xs">
          Showing <strong>{alerts.length}</strong> statutory compliance alert{alerts.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-xl border transition shadow-sm bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
              a.severity === 'CRITICAL' ? 'border-red-300 ring-1 ring-red-200' :
              a.severity === 'HIGH' ? 'border-amber-300' : 'border-slate-200'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center space-x-2">
                <SeverityBadge severity={a.severity} />
                <span className="font-mono text-[10px] text-slate-400 font-semibold">{a.alert_type}</span>
                {a.is_resolved === 1 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ RESOLVED
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{a.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{a.message}</p>

              <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span><strong>Project:</strong> {a.project_name || 'National Priority Infrastructure'}</span>
                <span><strong>State / District:</strong> {a.state_name || 'MH'}, {a.district_name || 'Thane'}</span>
                <span><strong>Triggered At:</strong> {a.created_at}</span>
              </div>
            </div>

            {a.is_resolved === 0 && ['SUPER_ADMIN', 'DISTRICT_ADMIN', 'STATE_ADMIN'].includes(role) && (
              <div className="shrink-0 pt-1">
                <button
                  onClick={() => setResolvingAlert(a)}
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  Resolve & Record Action
                </button>
              </div>
            )}
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No active statutory SLA alerts matching criteria</p>
            <p className="text-slate-400 mt-1">All land acquisition statutory clocks and DBT schedules are within tolerance.</p>
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolvingAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Resolve Statutory Alert</h3>
              <button onClick={() => setResolvingAlert(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900">{resolvingAlert.title}</span>
              <p className="text-slate-600 text-[11px]">{resolvingAlert.message}</p>
            </div>

            <form onSubmit={handleResolveAlert} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Remediation Action Remarks</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Record order reference, Collectorate review outcome, or treasury dispatch proof..."
                  value={resolveRemarks}
                  onChange={(e) => setResolveRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingAlert(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirm Compliance Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
