export const ROLE_CONFIGS = {
  SUPER_ADMIN: {
    title: 'National System Control & Full Audit Oversight',
    scopeBadge: 'NATIONAL SUPER ADMIN',
    bannerBg: 'from-slate-900 via-gov-navy to-slate-900',
    accentColor: 'text-amber-400',
    allowedNav: ['/', '/gis-map', '/projects', '/workflow', '/compensation', '/rehabilitation', '/documents', '/alerts', '/ai-workbench', '/reports', '/audit-logs', '/field-verify'],
    description: 'Unrestricted national administrative access, database audit management, and system-wide approvals.',
    actions: ['CREATE_PROJECT', 'APPROVE_WORKFLOW', 'DISBURSE_DBT', 'PUBLISH_GAZETTE', 'RESOLVE_ALERT', 'GEO_VERIFY', 'VIEW_AUDIT']
  },
  CENTRAL_MINISTRY: {
    title: 'Central Nodal Ministry Inter-State Corridor Portal',
    scopeBadge: 'CENTRAL MINISTRY (MoRTH / RAILWAYS)',
    bannerBg: 'from-blue-950 via-slate-900 to-blue-950',
    accentColor: 'text-blue-300',
    allowedNav: ['/', '/gis-map', '/projects', '/workflow', '/compensation', '/documents', '/alerts', '/ai-workbench', '/reports'],
    description: 'Inter-state linear infrastructure monitoring, national corridor clearances, and budget allocations.',
    actions: ['CREATE_PROJECT', 'APPROVE_WORKFLOW', 'PUBLISH_GAZETTE', 'VIEW_REPORTS']
  },
  STATE_ADMIN: {
    title: 'State Revenue Department Land Reforms Workspace',
    scopeBadge: 'STATE REVENUE ADMIN (MAHARASHTRA)',
    bannerBg: 'from-purple-950 via-slate-900 to-purple-950',
    accentColor: 'text-purple-300',
    allowedNav: ['/', '/gis-map', '/projects', '/workflow', '/compensation', '/rehabilitation', '/documents', '/alerts', '/reports'],
    description: 'State-level land ceiling compliance, Section 11/19 gazette oversight, and revenue department clearances.',
    actions: ['APPROVE_WORKFLOW', 'RESOLVE_ALERT', 'VIEW_REPORTS']
  },
  DISTRICT_ADMIN: {
    title: 'District Collectorate & CALA Statutory Workspace',
    scopeBadge: 'DISTRICT MAGISTRATE & COLLECTOR (THANE)',
    bannerBg: 'from-emerald-950 via-slate-900 to-emerald-950',
    accentColor: 'text-emerald-300',
    allowedNav: ['/', '/gis-map', '/projects', '/workflow', '/compensation', '/rehabilitation', '/documents', '/alerts', '/reports', '/field-verify'],
    description: 'Competent Authority Land Acquisition (CALA), gazette publication, Section 23/30 awards, and SLA alert resolution.',
    actions: ['APPROVE_WORKFLOW', 'PUBLISH_GAZETTE', 'DECLARE_AWARD', 'RESOLVE_ALERT', 'GEO_VERIFY']
  },
  LAND_AUTHORITY: {
    title: 'SLAO Valuation & Direct Benefit Transfer (DBT) Workbench',
    scopeBadge: 'SPECIAL LAND ACQUISITION OFFICER (SLAO)',
    bannerBg: 'from-amber-950 via-slate-900 to-amber-950',
    accentColor: 'text-amber-300',
    allowedNav: ['/compensation', '/workflow', '/gis-map', '/projects', '/rehabilitation', '/documents', '/field-verify', '/reports'],
    description: 'RFCTLARR fair valuation calculations, direct bank transfers (DBT) to khatedars, and ground demarcation.',
    actions: ['DISBURSE_DBT', 'CALCULATE_VALUATION', 'APPROVE_WORKFLOW', 'PUBLISH_GAZETTE', 'GEO_VERIFY', 'UPDATE_RR']
  },
  PROJECT_AGENCY: {
    title: 'Project Implementing Agency Portal (NHSRCL / NHAI)',
    scopeBadge: 'IMPLEMENTING AGENCY MANAGER',
    bannerBg: 'from-cyan-950 via-slate-900 to-cyan-950',
    accentColor: 'text-cyan-300',
    allowedNav: ['/projects', '/workflow', '/gis-map', '/documents', '/compensation', '/field-verify'],
    description: 'Requisition proposal submission, compensation fund deposits, and physical possession takeover tracking.',
    actions: ['CREATE_PROJECT', 'UPLOAD_DOC', 'GEO_VERIFY']
  },
  POLICY_MAKER: {
    title: 'NITI Aayog Macro Policy & Economic Impact Dashboard',
    scopeBadge: 'NITI AAYOG POLICY ADVISOR',
    bannerBg: 'from-indigo-950 via-slate-900 to-indigo-950',
    accentColor: 'text-indigo-300',
    allowedNav: ['/', '/gis-map', '/ai-workbench', '/reports'],
    description: 'Read-Only policy review, state performance comparison indices, and AI administrative recommendations.',
    actions: ['VIEW_REPORTS', 'VIEW_AI']
  }
};
