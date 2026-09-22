import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS } from '../../config/rolesConfig';
import {
  LayoutDashboard, MapPin, FolderKanban, FileCheck,
  Coins, Home, FileText, AlertTriangle, BrainCircuit,
  BarChart3, ShieldCheck, Smartphone, Award
} from 'lucide-react';

export default function Sidebar() {
  const { role, user } = useAuth();
  const roleConfig = ROLE_CONFIGS[role] || ROLE_CONFIGS.SUPER_ADMIN;

  const allNavItems = [
    {
      to: '/',
      label: 'National Dashboard',
      subtext: 'Macro KPIs & India Map',
      icon: LayoutDashboard
    },
    {
      to: '/gis-map',
      label: 'Interactive GIS Map',
      subtext: 'Land Parcels & Corridors',
      icon: MapPin
    },
    {
      to: '/projects',
      label: 'Projects & Lifecycle',
      subtext: '12-Stage Monitoring',
      icon: FolderKanban
    },
    {
      to: '/workflow',
      label: 'Workflow & Approvals',
      subtext: 'Proposals & Scrutiny',
      icon: FileCheck
    },
    {
      to: '/compensation',
      label: 'Compensation & DBT',
      subtext: 'Awards & Disbursements',
      icon: Coins
    },
    {
      to: '/rehabilitation',
      label: 'R&R Management',
      subtext: 'Displacement & Housing',
      icon: Home
    },
    {
      to: '/documents',
      label: 'Document Repository',
      subtext: 'Gazettes, Awards & 7/12',
      icon: FileText
    },
    {
      to: '/alerts',
      label: 'SLA Alerts Center',
      subtext: 'Statutory Deadlines',
      icon: AlertTriangle
    },
    {
      to: '/ai-workbench',
      label: 'AI Risk & Insights',
      subtext: 'ML Delays & Duplicates',
      icon: BrainCircuit,
      badge: 'ML'
    },
    {
      to: '/reports',
      label: 'Reports & Audits',
      subtext: 'PDF & CSV Export',
      icon: BarChart3
    },
    {
      to: '/audit-logs',
      label: 'Statutory Audit Trail',
      subtext: 'Digital Record History',
      icon: ShieldCheck
    },
    {
      to: '/field-verify',
      label: 'Field Officer Mode',
      subtext: 'Mobile Demarcation',
      icon: Smartphone,
      highlight: true
    }
  ];

  // Filter nav items by role permissions
  const filteredNavItems = allNavItems.filter(item =>
    roleConfig.allowedNav.includes(item.to)
  );

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4.25rem)] shadow-sm">
      {/* Role Banner Badge */}
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Role Scope
        </div>
        <div className="text-xs font-bold text-slate-900 truncate">
          {user?.name || 'Authorized Official'}
        </div>
        <div className="mt-1">
          <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase">
            {roleConfig.scopeBadge}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-gov-navy text-white shadow-sm font-semibold'
                    : item.highlight
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-gov-navy'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-gov-navy'}`} />
                    <div className="truncate">
                      <div className="truncate">{item.label}</div>
                      <div className={`text-[10px] truncate font-normal ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.subtext}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 leading-snug">
        <div className="font-semibold text-slate-700">National Portal Compliance</div>
        <div>RFCTLARR 2013 Statutory Framework</div>
      </div>
    </aside>
  );
}
