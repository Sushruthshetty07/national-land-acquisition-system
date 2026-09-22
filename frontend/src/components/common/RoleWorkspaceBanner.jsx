import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIGS } from '../../config/rolesConfig';
import { ShieldCheck, UserCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function RoleWorkspaceBanner() {
  const { role, user } = useAuth();
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.SUPER_ADMIN;

  return (
    <div className={`bg-gradient-to-r ${config.bannerBg} text-white rounded-xl p-4 shadow-md border border-slate-700/80 mb-6 transition-all duration-300`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-white/10 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase border border-amber-400/30">
              {config.scopeBadge}
            </span>
            <span className="text-[11px] text-slate-300">
              Active Official Persona: <strong className="text-white">{user?.name}</strong>
            </span>
          </div>

          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>{config.title}</span>
          </h2>

          <p className="text-xs text-slate-300 leading-snug">
            {config.description}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <div className="bg-slate-900/60 backdrop-blur rounded-lg p-2 border border-slate-700 text-right">
            <div className="text-[10px] text-slate-400 font-mono">Department Scoping:</div>
            <div className={`text-xs font-bold ${config.accentColor}`}>
              {user?.department || 'Government of India'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
