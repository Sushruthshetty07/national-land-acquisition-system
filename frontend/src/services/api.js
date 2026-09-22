const API_BASE = '/api';
const AI_BASE = '/ai';

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...(options.headers || {})
      }
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API request to ${url} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  getProfile: () => request(`${API_BASE}/auth/profile`),
  getPersonas: () => request(`${API_BASE}/auth/personas`),
  switchPersona: (role, userId) => request(`${API_BASE}/auth/switch`, {
    method: 'POST',
    body: JSON.stringify({ role, userId })
  }),

  // Lookups
  getStates: () => request(`${API_BASE}/states`),
  getDistricts: (stateId) => request(`${API_BASE}/districts${stateId ? `?state_id=${stateId}` : ''}`),

  // Analytics
  getNationalAnalytics: () => request(`${API_BASE}/analytics/national`),
  getStateSummary: (stateId) => request(`${API_BASE}/analytics/state/${stateId}`),

  // Projects
  getProjects: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/projects?${params.toString()}`);
  },
  getProject: (id) => request(`${API_BASE}/projects/${id}`),
  createProject: (data) => request(`${API_BASE}/projects`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProjectStage: (id, data) => request(`${API_BASE}/projects/${id}/stage`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Land Parcels & GIS
  getParcels: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/parcels?${params.toString()}`);
  },
  getParcel: (id) => request(`${API_BASE}/parcels/${id}`),
  createParcel: (data) => request(`${API_BASE}/parcels`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  fieldVerifyParcel: (id, data) => request(`${API_BASE}/parcels/${id}/verify`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // 12-Stage Workflow
  getWorkflowStages: () => request(`${API_BASE}/workflow/stages`),
  processWorkflowAction: (data) => request(`${API_BASE}/workflow/action`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  publishGazetteNotification: (data) => request(`${API_BASE}/workflow/notify`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Compensation & DBT
  getCompensationList: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/compensation?${params.toString()}`);
  },
  getCompensationSummary: () => request(`${API_BASE}/compensation/summary`),
  calculateCompensation: (data) => request(`${API_BASE}/compensation/calculate`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  disburseBatch: (data) => request(`${API_BASE}/compensation/disburse`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Rehabilitation & Resettlement (R&R)
  getRRCases: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/rr/cases?${params.toString()}`);
  },
  getAffectedFamilies: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/rr/families?${params.toString()}`);
  },
  getRRSummary: () => request(`${API_BASE}/rr/summary`),
  updateRREntitlement: (id, data) => request(`${API_BASE}/rr/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  // Document Repository
  getDocuments: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/documents?${params.toString()}`);
  },
  uploadDocument: (data) => request(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  verifyDocument: (id) => request(`${API_BASE}/documents/${id}/verify`, {
    method: 'POST'
  }),

  // Alerts & SLA
  getAlerts: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/alerts?${params.toString()}`);
  },
  resolveAlert: (id, data) => request(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Reports & Audits
  getReportData: (reportType) => request(`${API_BASE}/reports/${reportType}`),
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    return request(`${API_BASE}/audit-logs?${params.toString()}`);
  },

  // AI Microservice Endpoints
  predictDelay: (data) => request(`${AI_BASE}/predict-delay`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  calculateRisk: (data) => request(`${AI_BASE}/risk-score`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  detectDuplicates: (data) => request(`${AI_BASE}/detect-duplicates`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAdministrativeInsights: (kpis) => request(`${AI_BASE}/insights/administrative`, {
    method: 'POST',
    body: JSON.stringify({ kpis })
  }),
  analyzeProjectAI: (data) => request(`${AI_BASE}/analyze-project`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export default api;
