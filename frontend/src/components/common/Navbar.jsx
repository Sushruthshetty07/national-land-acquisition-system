import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield, User, Bell, ChevronDown, CheckCircle2,
  ExternalLink, Layers, Sparkles, RefreshCw, Award, Menu, X
} from 'lucide-react';

export default function Navbar({ activeAlertsCount = 5, mobileMenuOpen, setMobileMenuOpen }) {
  const { user, role, switchRole, personas, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const navigate = useNavigate();

  const roleLabels = {
    SUPER_ADMIN: { name: 'Super Admin', color: 'bg-red-900 text-red-100 border-red-700', icon: '👑' },
    CENTRAL_MINISTRY: { name: 'Central Ministry', color: 'bg-blue-900 text-blue-100 border-blue-700', icon: '🏛️' },
    STATE_ADMIN: { name: 'State Revenue Admin', color: 'bg-purple-900 text-purple-100 border-purple-700', icon: '🏢' },
    DISTRICT_ADMIN: { name: 'District Collector / DM', color: 'bg-emerald-900 text-emerald-100 border-emerald-700', icon: '⚖️' },
    LAND_AUTHORITY: { name: 'Competent Authority (SLAO)', color: 'bg-amber-900 text-amber-100 border-amber-700', icon: '📜' },
    PROJECT_AGENCY: { name: 'Implementing Agency', color: 'bg-cyan-900 text-cyan-100 border-cyan-700', icon: '🏗️' },
    POLICY_MAKER: { name: 'Policy Maker (NITI Aayog)', color: 'bg-indigo-900 text-indigo-100 border-indigo-700', icon: '📈' }
  };

  const currentRoleInfo = roleLabels[role] || { name: role, color: 'bg-slate-800 text-slate-100', icon: '👤' };

  return (
    <header className="sticky top-0 z-40 bg-gov-navy text-white shadow-md w-full max-w-full overflow-x-clip">
      {/* Indian National Tricolor Top Stripe */}
      <div className="h-1.5 w-full flex max-w-full overflow-hidden">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Hamburger Button + Brand Logo */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 truncate min-w-0">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 focus:outline-none shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-3 group truncate min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-sm sm:text-lg shadow-inner shrink-0">
                🏛️
              </div>
              <div className="truncate min-w-0">
                <div className="text-[9px] sm:text-xs font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-1.5 truncate">
                  <span className="truncate">Govt of India Portal</span>
                </div>
                <div className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                  <span className="truncate">National Land System</span>
                  <span className="hidden lg:inline text-[10px] bg-blue-700/60 px-1.5 py-0.5 rounded border border-blue-400/30 text-blue-200 font-mono font-normal">RFCTLARR 2013</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right Header Utilities: Persona Switcher, Alerts */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                className="flex items-center space-x-1.5 sm:space-x-2 text-xs bg-slate-800/80 hover:bg-slate-700/90 text-amber-300 px-2.5 sm:px-3 py-1.5 rounded-lg border border-amber-500/30 transition shadow-sm"
                title="Switch official persona to test role-based access control"
              >
                <span className="text-sm">{currentRoleInfo.icon}</span>
                <div className="text-left hidden md:block">
                  <span className="block text-[10px] text-slate-400 leading-none">Active Persona:</span>
                  <span className="font-semibold text-white truncate max-w-[120px] block">{currentRoleInfo.name}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 sm:ml-1 text-slate-400" />
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-slate-200">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" /> Official Role Switcher
                    </p>
                    <p className="text-[11px] text-slate-400">Switch role-specific dashboards & access controls</p>
                  </div>
                  <div className="py-1 max-h-72 overflow-y-auto">
                    {Object.entries(roleLabels).map(([key, info]) => (
                      <button
                        key={key}
                        onClick={() => {
                          switchRole(key);
                          setPersonaMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800 transition ${
                          role === key ? 'bg-slate-800 text-amber-300 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{info.icon}</span>
                          <div>
                            <div>{info.name}</div>
                            <div className="text-[10px] text-slate-400">{key}</div>
                          </div>
                        </div>
                        {role === key && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SLA Alerts Button */}
            <Link
              to="/alerts"
              className="relative p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Statutory Alerts & SLA Violations"
            >
              <Bell className="w-5 h-5" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-gov-navy animate-pulse">
                  {activeAlertsCount}
                </span>
              )}
            </Link>

            {/* Field Officer Mode Quick Button */}
            <Link
              to="/field-verify"
              className="hidden lg:flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-600 transition"
              title="Field Verification Mobile Mode"
            >
              <span>📱</span>
              <span>Field Officer</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
