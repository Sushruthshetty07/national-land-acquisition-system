import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, RefreshCw, Calendar, Clock } from 'lucide-react';
import api from '../services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs({
        entity: entityFilter,
        action: actionFilter,
        search
      });
      if (res.success) {
        setLogs(res.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-gov-navy" />
          <span>Statutory Electronic Audit Trail & Immutable Action Ledger</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident record of administrative approvals, DBT disbursements, field verifications, and lifecycle modifications
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-3">
          <div>
            <label className="font-semibold text-slate-500 mr-1.5">Entity:</label>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
            >
              <option value="">All Entities</option>
              <option value="PROJECT">Project</option>
              <option value="PARCEL">Parcel</option>
              <option value="COMPENSATION">Compensation</option>
              <option value="WORKFLOW">Workflow</option>
              <option value="ALERT">Alert</option>
              <option value="DOCUMENT">Document</option>
              <option value="RR">R&R</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-500 mr-1.5">Action:</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="APPROVE">Approve</option>
              <option value="REJECT">Reject</option>
              <option value="DISBURSE">Disburse DBT</option>
              <option value="GEO_VERIFY">Field Geo-Verify</option>
              <option value="RESOLVE_ALERT">Resolve Alert</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-1">
          <input
            type="text"
            placeholder="Search User / Value / Entity ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700 w-64"
          />
          <button
            type="submit"
            className="px-2.5 py-1.5 bg-gov-navy text-white rounded-lg hover:bg-slate-800"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3">Audit ID & Timestamp</th>
                <th className="py-3 px-3">Official User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity & Target</th>
                <th className="py-3 px-3">Previous Value</th>
                <th className="py-3 px-3">New Value / Description</th>
                <th className="py-3 px-3 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3">
                    <div className="font-mono font-bold text-slate-800">{l.id}</div>
                    <div className="text-[10px] text-slate-400">{l.timestamp}</div>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{l.user_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {l.user_role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      l.action === 'APPROVE' || l.action === 'DISBURSE' ? 'bg-emerald-100 text-emerald-800' :
                      l.action === 'REJECT' ? 'bg-red-100 text-red-800' :
                      l.action === 'CREATE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-semibold">{l.entity}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{l.entity_id}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] truncate max-w-[140px]">
                    {l.previous_value || '—'}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 text-[11px]">
                    {l.new_value}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[10px]">
                    {l.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
