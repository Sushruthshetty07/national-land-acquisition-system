import React, { useState, useEffect } from 'react';
import {
  Coins, CheckCircle2, Clock, AlertTriangle, ArrowRight,
  Calculator, Download, Send, Search, Filter, ShieldCheck
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CompensationPage() {
  const { role } = useAuth();
  const [compensationList, setCompensationList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected items for batch disbursement
  const [selectedIds, setSelectedIds] = useState([]);
  const [disbursing, setDisbursing] = useState(false);

  // Calculator State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcInputs, setCalcInputs] = useState({
    areaHa: 2.5,
    circleRatePerHa: 4500000,
    locationType: 'RURAL',
    multiplier: 1.5,
    structuresValue: 350000,
    treesValue: 120000,
    monthsSinceSec11: 14
  });
  const [calcResult, setCalcResult] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        api.getCompensationList({ search, status: statusFilter }),
        api.getCompensationSummary()
      ]);
      if (listRes.success) setCompensationList(listRes.compensation);
      if (sumRes.success) setSummary(sumRes.summary);
    } catch (e) {
      console.error('Failed to load compensation data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pendingIds = compensationList
        .filter(c => c.payment_status !== 'DISBURSED')
        .map(c => c.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDisburse = async () => {
    if (selectedIds.length === 0) {
      return alert('Please select at least one pending beneficiary record.');
    }
    setDisbursing(true);
    try {
      const res = await api.disburseBatch({
        compensationIds: selectedIds,
        paymentMode: 'DBT_PFMS_RTGS',
        remarks: 'Batch compensation cleared under Competent Authority treasury sanction.'
      });
      alert(res.message);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      alert('Disbursement failed: ' + err.message);
    } finally {
      setDisbursing(false);
    }
  };

  const runCalculator = async (e) => {
    e.preventDefault();
    try {
      const res = await api.calculateCompensation(calcInputs);
      if (res.success) {
        setCalcResult(res.calculation);
      }
    } catch (err) {
      alert('Calculation failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600" />
            <span>Direct Benefit Transfer (DBT) & Compensation Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            RFCTLARR 2013 Fair Valuation, 100% Solatium, 12% Interest, and PFMS Treasury Disbursements
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>{showCalculator ? 'Hide Calculator' : 'RFCTLARR Valuation Calculator'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          title="Assessed Compensation"
          value={`₹${summary?.totalAssessedCr || '0.00'} Cr`}
          subtitle="Collector award formula"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="Disbursed via DBT"
          value={`₹${summary?.totalDisbursedCr || '0.00'} Cr`}
          subtitle={`${summary?.disbursementRate || 0}% transfer rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Pending Escrow"
          value={`₹${summary?.pendingDisbursementCr || '0.00'} Cr`}
          subtitle={`${summary?.escrowCount || 0} title verifications`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="100% Solatium Outlay"
          value={`₹${summary?.totalSolatiumCr || '0.00'} Cr`}
          subtitle="Section 30 statutory grant"
          icon={Coins}
          color="purple"
        />
      </div>

      {/* Interactive RFCTLARR Fair Compensation Calculator Modal/Panel */}
      {showCalculator && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-700 space-y-4 animate-scale-up text-xs">
          <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Statutory RFCTLARR 2013 Compensation Calculator</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Formula: Base Value (Area × Circle Rate × Rural Factor) + Structures + Trees + 100% Solatium + 12% Interest
              </p>
            </div>
            <button
              onClick={() => setShowCalculator(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form onSubmit={runCalculator} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Acquired Area (Ha)</label>
              <input
                type="number"
                step="0.01"
                required
                value={calcInputs.areaHa}
                onChange={(e) => setCalcInputs({ ...calcInputs, areaHa: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Circle Rate per Ha (₹)</label>
              <input
                type="number"
                required
                value={calcInputs.circleRatePerHa}
                onChange={(e) => setCalcInputs({ ...calcInputs, circleRatePerHa: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rural Factor Multiplier</label>
              <select
                value={calcInputs.multiplier}
                onChange={(e) => setCalcInputs({ ...calcInputs, multiplier: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value={1.0}>1.0 (Urban Territory)</option>
                <option value={1.25}>1.25 (Semi-Urban Peripheral)</option>
                <option value={1.5}>1.5 (Rural Standard)</option>
                <option value={2.0}>2.0 (Remote Rural Tribal)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Months Since Sec 11 Notice</label>
              <input
                type="number"
                value={calcInputs.monthsSinceSec11}
                onChange={(e) => setCalcInputs({ ...calcInputs, monthsSinceSec11: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Structures Valuation (₹)</label>
              <input
                type="number"
                value={calcInputs.structuresValue}
                onChange={(e) => setCalcInputs({ ...calcInputs, structuresValue: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Horticulture / Trees (₹)</label>
              <input
                type="number"
                value={calcInputs.treesValue}
                onChange={(e) => setCalcInputs({ ...calcInputs, treesValue: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition"
              >
                Compute Statutory Fair Award Breakdown
              </button>
            </div>
          </form>

          {calcResult && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Computation Statement:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 text-[10px]">Base Land Value:</span>
                  <div className="text-base font-bold text-white">₹{(calcResult.baseLandValue / 100000).toFixed(2)} Lakhs</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">100% Solatium (Sec 30):</span>
                  <div className="text-base font-bold text-emerald-400">₹{(calcResult.solatiumAmount / 100000).toFixed(2)} Lakhs</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">12% Interest (Sec 30(3)):</span>
                  <div className="text-base font-bold text-amber-300">₹{(calcResult.interestAmount / 100000).toFixed(2)} Lakhs</div>
                </div>
                <div className="bg-amber-950/60 p-2 rounded-lg border border-amber-500/40">
                  <span className="text-amber-300 text-[10px] font-bold">Total Award Payable:</span>
                  <div className="text-lg font-black text-amber-400">₹{(calcResult.totalAwardAmount / 100000).toFixed(2)} Lakhs</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Batch Actions & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          {['SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'].includes(role) && (
            <button
              onClick={handleBatchDisburse}
              disabled={selectedIds.length === 0 || disbursing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Disburse DBT to Selected ({selectedIds.length})</span>
            </button>
          )}
          <span className="text-slate-400 text-[11px]">
            {selectedIds.length > 0 ? `${selectedIds.length} beneficiaries chosen` : 'Select beneficiaries below to dispatch payments'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
          >
            <option value="">All Payment Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="TREASURY_ESCROW">Treasury Escrow</option>
            <option value="PROCESSING">Bank Processing</option>
            <option value="DISBURSED">Disbursed (DBT)</option>
            <option value="ON_HOLD">Disputed / On Hold</option>
          </select>

          <form onSubmit={handleSearch} className="flex space-x-1">
            <input
              type="text"
              placeholder="Beneficiary / Survey..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-gov-navy text-white rounded-lg hover:bg-slate-800"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Compensation Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-3">Beneficiary Name</th>
                <th className="py-3 px-3">Survey & Village</th>
                <th className="py-3 px-3">Bank Details</th>
                <th className="py-3 px-3 text-right">Assessed Award (₹)</th>
                <th className="py-3 px-3 text-right">Disbursed (₹)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">UTR / Payment Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compensationList.map((c) => {
                const isSelected = selectedIds.includes(c.id);
                const isDisbursed = c.payment_status === 'DISBURSED';

                return (
                  <tr key={c.id} className={`hover:bg-slate-50/80 transition ${isSelected ? 'bg-blue-50/60' : ''}`}>
                    <td className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisbursed}
                        onChange={() => handleToggleSelect(c.id)}
                        className="rounded text-blue-600 focus:ring-blue-500 disabled:opacity-30"
                      />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{c.beneficiary_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.parcel_code}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div className="font-bold text-slate-800">{c.survey_number}</div>
                      <div className="text-[10px] text-slate-400">{c.village}, {c.taluk}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{c.bank_name || 'State Bank of India'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.bank_account_masked} ({c.ifsc_code})</div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      ₹{(c.total_assessed / 100000).toFixed(2)} L
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      <span className={c.total_disbursed >= c.total_assessed ? 'text-emerald-700' : 'text-amber-700'}>
                        ₹{(c.total_disbursed / 100000).toFixed(2)} L
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.payment_status === 'DISBURSED' ? 'bg-emerald-100 text-emerald-800' :
                        c.payment_status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                        c.payment_status === 'ON_HOLD' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {c.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-500">
                      {c.utr_number ? (
                        <span className="text-emerald-700 font-bold">{c.utr_number}</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
