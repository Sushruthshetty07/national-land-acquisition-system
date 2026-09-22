import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@nic.in');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const personas = [
    { label: 'Super Admin (National)', email: 'admin@nic.in', role: 'SUPER_ADMIN', icon: '👑', desc: 'Joint Secretary & DG, Land Resources' },
    { label: 'Central Ministry', email: 'ministry.morth@gov.in', role: 'CENTRAL_MINISTRY', icon: '🏛️', desc: 'Director (MoRTH / Railways)' },
    { label: 'State Revenue Admin', email: 'state.revenue@maharashtra.gov.in', role: 'STATE_ADMIN', icon: '🏢', desc: 'Principal Secretary (Revenue & Forest)' },
    { label: 'District Collector', email: 'collector.thane@nic.in', role: 'DISTRICT_ADMIN', icon: '⚖️', desc: 'District Magistrate & Collector, Thane' },
    { label: 'Land Authority (SLAO)', email: 'slao.nhai@gov.in', role: 'LAND_AUTHORITY', icon: '📜', desc: 'Special Land Acquisition Officer' },
    { label: 'Project Agency', email: 'project.manager@nhsrcl.in', role: 'PROJECT_AGENCY', icon: '🏗️', desc: 'Chief Project Manager, NHSRCL Bullet Train' },
    { label: 'Policy Maker', email: 'advisor.niti@gov.in', role: 'POLICY_MAKER', icon: '📈', desc: 'Senior Advisor (Infrastructure), NITI Aayog' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersona = async (p) => {
    setEmail(p.email);
    setPassword('Password@123');
    setLoading(true);
    setError('');
    try {
      await login(p.email, 'Password@123');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Persona switch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-900">
      {/* Tricolor top border */}
      <div className="fixed top-0 left-0 right-0 h-1.5 flex">
        <div className="h-full w-1/3 bg-[#FF9933]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#138808]"></div>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-6 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Left Column: Official Branding & Quick Personas (7 cols) */}
        <div className="md:col-span-7 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 font-bold text-2xl">
                🏛️
              </div>
              <div>
                <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                  Government of India
                </span>
                <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                  National Land Acquisition & Management System
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Unified digital platform digitizing and monitoring the 12-stage land acquisition lifecycle under the <strong>RFCTLARR Act 2013</strong>.
            </p>
          </div>

          {/* Quick 1-Click Evaluation Personas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
              <span>Select Evaluation Persona (1-Click Login):</span>
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {personas.map((p) => (
                <button
                  key={p.email}
                  type="button"
                  onClick={() => handleQuickPersona(p)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-amber-500/50 transition flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-base">{p.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {p.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[240px]">
                        {p.desc}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
            Ministry of Rural Development • Ministry of Road Transport and Highways (MoRTH)
          </div>
        </div>

        {/* Right Column: Standard Credentials Form (5 cols) */}
        <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-center space-y-4 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Secure SSO Login</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Enter authorized official credentials</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email ID</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 pl-8 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="name@nic.in"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Passphrase</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 pl-8 text-xs text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Default Demo Password: <code>Password@123</code></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gov-navy hover:bg-slate-800 text-white font-bold rounded-lg shadow transition flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </button>
          </form>

          <div className="pt-2 text-[10px] text-slate-400 text-center">
            NIC Secure Gateway • 256-Bit TLS Encryption
          </div>
        </div>
      </div>
    </div>
  );
}
