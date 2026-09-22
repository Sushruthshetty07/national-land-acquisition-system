import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban, MapPin, Coins, Home, AlertTriangle,
  TrendingUp, CheckCircle2, Clock, ShieldAlert, ArrowRight,
  BrainCircuit, Download, RefreshCw, BarChart2, Layers
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

import StatCard from '../components/common/StatCard';
import RoleWorkspaceBanner from '../components/common/RoleWorkspaceBanner';
import { StatusBadge, RiskBadge, SeverityBadge } from '../components/common/Badge';
import GISMap from '../components/gis/GISMap';
import api from '../services/api';

export default function NationalDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [stateBreakdown, setStateBreakdown] = useState([]);
  const [stageDist, setStageDist] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. National Analytics
      const analyticsRes = await api.getNationalAnalytics().catch(() => null);
      if (analyticsRes && analyticsRes.success) {
        setKpis(analyticsRes.kpis);
        setStateBreakdown(analyticsRes.stateBreakdown || []);
        setStageDist(analyticsRes.stageDistribution || []);

        // 2. Fetch AI Insights
        api.getAdministrativeInsights(analyticsRes.kpis).then(aiRes => {
          if (aiRes && aiRes.success) {
            setInsights(aiRes.insights || []);
          }
        }).catch(err => console.warn('AI insights error:', err));
      }

      // 3. Land Parcels for GIS preview
      const parcelsRes = await api.getParcels({ limit: 40 }).catch(() => null);
      if (parcelsRes && parcelsRes.success) {
        setParcels(parcelsRes.parcels || []);
      }

      // 4. Alerts
      const alertsRes = await api.getAlerts({ is_resolved: 0 }).catch(() => null);
      if (alertsRes && alertsRes.success) {
        setAlerts(alertsRes.alerts || []);
      }
    } catch (e) {
      console.error('Failed to load national dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dynamic Role Persona Workspace Banner */}
      <RoleWorkspaceBanner />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span>🇮🇳 National Land Acquisition & Management Platform</span>
            <span>•</span>
            <span className="text-slate-500 font-normal">Real-Time Centralized Infrastructure Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Executive Oversight Telemetry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central Ministries, State Governments, District Collectors, and Implementing Agencies
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Reports</span>
          </Link>
        </div>
      </div>

      {/* 12 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Projects"
          value={kpis?.totalProjects || 8}
          subtitle="National corridors"
          icon={FolderKanban}
          color="blue"
        />
        <StatCard
          title="Land Proposed"
          value={`${kpis?.landProposedHa?.toLocaleString() || '10,962'} Ha`}
          subtitle="Acquisition requisition"
          icon={Layers}
          color="slate"
        />
        <StatCard
          title="Land Acquired"
          value={`${kpis?.landAcquiredHa?.toLocaleString() || '9,273'} Ha`}
          subtitle={`${kpis?.acquisitionRatePercent || 85}% completed`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Notifications"
          value={kpis?.notificationsIssued || 4}
          subtitle="Sec 11/19 Gazette"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Awards Declared"
          value={kpis?.awardsDeclared || 2}
          subtitle="Sec 23/30 orders"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Delayed Projects"
          value={kpis?.delayedProjects || 2}
          subtitle="SLA clock triggered"
          icon={AlertTriangle}
          color="amber"
          badge="ALERT"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Comp. Assessed"
          value={`₹${kpis?.compensationAssessedCr || 315.6} Cr`}
          subtitle="RFCTLARR formula"
          icon={Coins}
          color="amber"
        />
        <StatCard
          title="Comp. Disbursed"
          value={`₹${kpis?.compensationDisbursedCr || 238.4} Cr`}
          subtitle={`${kpis?.disbursementRatePercent || 76}% via DBT`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Possession Taken"
          value={kpis?.possessionCompletedParcels || 86}
          subtitle="Panchnama executed"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Affected Families"
          value={kpis?.affectedFamilies || 12}
          subtitle="Census surveyed"
          icon={Home}
          color="purple"
        />
        <StatCard
          title="Displaced Families"
          value={kpis?.displacedFamilies || 8}
          subtitle="Resettlement eligible"
          icon={Home}
          color="amber"
        />
        <StatCard
          title="Rehabilitated"
          value={kpis?.rehabilitatedFamilies || 2}
          subtitle="Permanent housing"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* AI Administrative Insights & Decision-Support Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 sm:p-5 text-white border border-indigo-500/30 shadow-md">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-amber-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI-Generated Administrative Insights & Recommendations</span>
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded">FASTAPI ML ENGINE</span>
              </h3>
              <p className="text-[11px] text-indigo-200">Real-time statutory bottleneck analysis and priority recommendations</p>
            </div>
          </div>
          <Link
            to="/ai-workbench"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
          >
            <span>Open AI Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {insights.length > 0 ? (
            insights.slice(0, 2).map((ins, i) => (
              <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-3 border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 text-xs">{ins.title}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-red-900/60 text-red-200 font-bold uppercase">{ins.priority}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{ins.observation}</p>
                <div className="pt-1 text-[11px] text-indigo-200 border-t border-white/10">
                  <strong className="text-white">Recommendation:</strong> {ins.recommendation}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-xs py-2">Loading ML administrative insights...</div>
          )}
        </div>
      </div>

      {/* Main Grid: GIS Map & State-Wise Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive GIS Map Overview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-700" />
                <span>National GIS Land Acquisition Corridor Map</span>
              </h2>
              <p className="text-[11px] text-slate-500">Live parcel boundaries and linear infrastructure status</p>
            </div>
            <Link
              to="/gis-map"
              className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Explore Full GIS Suite</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <GISMap
            parcels={parcels}
            height="420px"
            center={[21.5, 78.0]}
            zoom={5}
          />
        </div>

        {/* Right Column: State-Wise Progress Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gov-navy" />
                  <span>State-Wise Progress</span>
                </h2>
                <p className="text-[11px] text-slate-500">Land acquisition rate across key states</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">8 STATES</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2">State</th>
                    <th className="py-2 text-right">Projects</th>
                    <th className="py-2 text-right">Req. Ha</th>
                    <th className="py-2 text-right">Acq. Ha</th>
                    <th className="py-2 text-right">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stateBreakdown.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2 font-medium text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>{s.name}</span>
                      </td>
                      <td className="py-2 text-right text-slate-600">{s.projects_count}</td>
                      <td className="py-2 text-right text-slate-600">{Math.round(s.required_ha)}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{Math.round(s.acquired_ha)}</td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <span className="text-[11px] font-bold text-slate-800">{s.completion_percentage}%</span>
                          <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${Math.min(s.completion_percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <Link
              to="/reports"
              className="text-xs text-gov-blue font-semibold hover:underline"
            >
              View detailed state & district breakdown audit →
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Real-Time Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Funnel Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">RFCTLARR 12-Stage Lifecycle Project Distribution</h3>
              <p className="text-[11px] text-slate-500">Current volume of infrastructure projects active per lifecycle stage</p>
            </div>
            <Link to="/projects" className="text-xs text-blue-700 font-semibold hover:underline">
              View All Projects →
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stageDist.map(d => ({ stage: d.stage.replace(/_/g, ' '), count: d.count }))}
                margin={{ top: 10, right: 20, left: -20, bottom: 20 }}
              >
                <XAxis dataKey="stage" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time SLA Alert Center Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">Active SLA & Statutory Alerts</h3>
              </div>
              <Link to="/alerts" className="text-xs font-semibold text-red-700 hover:underline">
                View All ({alerts.length}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {alerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition bg-slate-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{a.title}</span>
                    <SeverityBadge severity={a.severity} />
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{a.message}</p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{a.project_name || 'National Priority Corridor'}</span>
                    <span className="text-blue-700 font-semibold hover:underline cursor-pointer">
                      <Link to="/alerts">Take Action →</Link>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 text-center">
            <span className="text-[11px] text-slate-400">
              Automatic alert engine scans database hourly for RFCTLARR Section 19 & Award SLA deadlines
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
