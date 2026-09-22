import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

import NationalDashboard from './pages/NationalDashboard';
import GISMapPage from './pages/GISMapPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import WorkflowPage from './pages/WorkflowPage';
import CompensationPage from './pages/CompensationPage';
import RRPage from './pages/RRPage';
import DocumentsPage from './pages/DocumentsPage';
import AlertsCenterPage from './pages/AlertsCenterPage';
import AIRiskWorkbenchPage from './pages/AIRiskWorkbenchPage';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import FieldOfficerPage from './pages/FieldOfficerPage';
import LoginPage from './pages/LoginPage';

function Layout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Inter',sans-serif]">
      <Navbar activeAlertsCount={5} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/70">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Standalone Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Main App Routes within Common Layout */}
          <Route path="/" element={<Layout><NationalDashboard /></Layout>} />
          <Route path="/gis-map" element={<Layout><GISMapPage /></Layout>} />
          <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
          <Route path="/projects/:id" element={<Layout><ProjectDetailPage /></Layout>} />
          <Route path="/workflow" element={<Layout><WorkflowPage /></Layout>} />
          <Route path="/compensation" element={<Layout><CompensationPage /></Layout>} />
          <Route path="/rehabilitation" element={<Layout><RRPage /></Layout>} />
          <Route path="/documents" element={<Layout><DocumentsPage /></Layout>} />
          <Route path="/alerts" element={<Layout><AlertsCenterPage /></Layout>} />
          <Route path="/ai-workbench" element={<Layout><AIRiskWorkbenchPage /></Layout>} />
          <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
          <Route path="/audit-logs" element={<Layout><AuditLogsPage /></Layout>} />
          <Route path="/field-verify" element={<Layout><FieldOfficerPage /></Layout>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
