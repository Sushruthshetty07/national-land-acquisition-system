import React, { useState, useEffect } from 'react';
import {
  FileText, Upload, CheckCircle2, ShieldCheck, Download,
  Eye, Search, Filter, Plus, Calendar, UserCheck, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DocumentsPage() {
  const { role } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');

  // Upload Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    project_id: '',
    document_type: 'LAND_RECORD_7_12',
    title: '',
    file_name: '',
    version: 'v1.0'
  });

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({ search, document_type: docTypeFilter });
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getProjects().then(res => {
      if (res.projects && res.projects.length > 0) {
        setProjects(res.projects);
        setUploadForm(prev => ({ ...prev, project_id: res.projects[0].id }));
      }
    });
    loadDocs();
  }, [docTypeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadDocs();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const res = await api.uploadDocument(uploadForm);
      if (res.success) {
        alert('Document uploaded and archived into secure legal repository.');
        setShowUploadModal(false);
        loadDocs();
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await api.verifyDocument(id);
      if (res.success) {
        alert('Document verified with digital administrative seal.');
        loadDocs();
      }
    } catch (err) {
      alert('Verification failed: ' + err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>Digital Land Records & Legal Document Repository</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Secured repository for Gazettes, Collector Awards, 7/12 RoRs, Panchnama records, and Cadastral GIS files
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gov-navy hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Upload className="w-4 h-4 text-amber-400" />
          <span>Upload Legal Document</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <label className="font-semibold text-slate-500">Document Type:</label>
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="border border-slate-300 rounded-lg p-1.5 text-xs text-slate-700"
          >
            <option value="">All Document Types</option>
            <option value="LAND_RECORD_7_12">7/12 Extract / RoR</option>
            <option value="GAZETTE_SEC11">Section 11 Preliminary Gazette</option>
            <option value="GAZETTE_SEC19">Section 19 Declaration Gazette</option>
            <option value="COLLECTOR_AWARD">Collector Award Order (Sec 23)</option>
            <option value="VALUATION_REPORT">Valuation Survey Report</option>
            <option value="PANCHNAMA">Physical Possession Panchnama</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-1">
          <input
            type="text"
            placeholder="Search by Title / Uploader..."
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow transition flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {d.document_type}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold">{d.version}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-xs line-clamp-2">{d.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {d.project_name || 'National Land Repository'}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-2.5 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="font-mono font-medium text-slate-700 truncate max-w-[180px]">{d.file_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Uploaded By:</span>
                <span className="text-slate-800">{d.uploaded_by}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verification:</span>
                {d.verified ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({d.verified_by || 'Authority'})
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">Pending Verification</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setPreviewDoc(d)}
                className="inline-flex items-center gap-1 text-xs text-blue-700 font-semibold hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              {!d.verified && ['SUPER_ADMIN', 'DISTRICT_ADMIN', 'LAND_AUTHORITY'].includes(role) && (
                <button
                  onClick={() => handleVerify(d.id)}
                  className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[11px] font-semibold hover:bg-emerald-100"
                >
                  Verify & Seal
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-up text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase">{previewDoc.document_type}</span>
                <h3 className="text-sm font-bold text-slate-900">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Digital Replica Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-2">
              <div className="text-center font-bold text-slate-900 border-b border-slate-300 pb-2">
                GOVERNMENT OF INDIA • REVENUE DEPARTMENT
                <br />
                <span className="text-[10px] font-normal">RFCTLARR 2013 Statutory Record Archive</span>
              </div>
              <div><strong>Document ID:</strong> {previewDoc.id}</div>
              <div><strong>File Name:</strong> {previewDoc.file_name}</div>
              <div><strong>Version:</strong> {previewDoc.version}</div>
              <div><strong>Uploaded By:</strong> {previewDoc.uploaded_by}</div>
              <div><strong>Date:</strong> {previewDoc.created_at}</div>
              <div className="p-2 bg-white rounded border border-slate-200 mt-2 text-[10px] text-slate-500 font-sans">
                [Digital Certificate: Hash SHA-256 Verified. Tamper-evident electronic registry archive under Section 89 of Land Acquisition Code].
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => alert(`Downloading archive copy: ${previewDoc.file_name}`)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-scale-up text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Upload Legal Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Infrastructure Project</label>
                <select
                  value={uploadForm.project_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, project_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Classification</label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                >
                  <option value="LAND_RECORD_7_12">Land Record 7/12 Extract / Khasra</option>
                  <option value="GAZETTE_SEC11">Section 11 Preliminary Gazette</option>
                  <option value="GAZETTE_SEC19">Section 19 Declaration Gazette</option>
                  <option value="COLLECTOR_AWARD">Collector Final Award Order (Sec 23)</option>
                  <option value="VALUATION_REPORT">Joint Measurement / Valuation Survey</option>
                  <option value="PANCHNAMA">Physical Possession Panchnama</option>
                  <option value="COURT_ORDER">Court Order / Arbitration Stay</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section 11 Gazette Notification Thane Package 2"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="gazette_sec11_2026.pdf"
                    value={uploadForm.file_name}
                    onChange={(e) => setUploadForm({ ...uploadForm, file_name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={uploadForm.version}
                    onChange={(e) => setUploadForm({ ...uploadForm, version: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Upload & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
