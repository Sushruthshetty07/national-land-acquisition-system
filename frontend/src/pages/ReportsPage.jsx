import React, { useState, useEffect } from 'react';
import {
  BarChart3, Download, FileSpreadsheet, FileText,
  Printer, Search, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../services/api';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('project-progress');
  const [reportData, setReportData] = useState([]);
  const [reportTitle, setReportTitle] = useState('National Project Progress Report');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const reportOptions = [
    { id: 'project-progress', label: 'Project Progress Report', desc: '12-Stage status, land acquired, budget & risk scores' },
    { id: 'state-wise', label: 'State-Wise Performance Report', desc: 'Land acquisition velocity & completion % across states' },
    { id: 'district-wise', label: 'District-Wise Audit Report', desc: 'Surveyed vs demarcated parcels by district collectorate' },
    { id: 'compensation', label: 'Compensation & DBT Audit', desc: 'Assessed awards, 100% solatium, and UTR payment scrolls' },
    { id: 'rr-status', label: 'R&R Family Dossier Report', desc: 'Displaced families, resettlement colony housing, and grants' },
    { id: 'delayed-projects', label: 'Delayed Projects SLA Report', desc: 'High-risk infrastructure projects with statutory deadline flags' }
  ];

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await api.getReportData(reportType);
      if (res.success) {
        setReportData(res.data);
        setReportTitle(res.title);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  // Download CSV
  const handleDownloadCSV = () => {
    if (!reportData || reportData.length === 0) return alert('No data to export.');
    const headers = Object.keys(reportData[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of reportData) {
      const values = headers.map(header => {
        const val = row[header] !== null && row[header] !== undefined ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate & Download PDF with jsPDF & autoTable
  const handleDownloadPDF = () => {
    if (!reportData || reportData.length === 0) return alert('No data to export.');

    const doc = new jsPDF('landscape');

    // Header styling
    doc.setFillColor(11, 37, 69); // gov-navy
    doc.rect(0, 0, 297, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('GOVERNMENT OF INDIA • NATIONAL LAND ACQUISITION SYSTEM', 14, 12);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`RFCTLARR 2013 Statutory Compliance Audit | ${reportTitle}`, 14, 18);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Official Administrative Record`, 14, 28);

    const headers = Object.keys(reportData[0]);
    const rows = reportData.map(r => headers.map(h => r[h] !== null && r[h] !== undefined ? String(r[h]) : '—'));

    autoTable(doc, {
      head: [headers.map(h => h.replace(/_/g, ' ').toUpperCase())],
      body: rows,
      startY: 32,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [19, 64, 116], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            <span>Statutory Audit & Administrative Reporting Gateway</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official government compliance reports in PDF and CSV format
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gov-navy hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Generate Official PDF</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {reportOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setReportType(opt.id)}
            className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
              reportType === opt.id
                ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="font-bold text-xs text-slate-900 mb-1">{opt.label}</div>
            <p className="text-[11px] text-slate-500">{opt.desc}</p>
          </button>
        ))}
      </div>

      {/* Report Table Canvas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">{reportTitle}</h3>
            <span className="text-[10px] text-slate-500">Showing {reportData.length} records in active telemetry</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search table rows..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700 w-52"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          {reportData && reportData.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider sticky top-0">
                <tr>
                  {Object.keys(reportData[0]).map((h) => (
                    <th key={h} className="py-2.5 px-3 whitespace-nowrap">
                      {h.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData
                  .filter(r => {
                    if (!search) return true;
                    return Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase()));
                  })
                  .map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      {Object.keys(reportData[0]).map((h) => (
                        <td key={h} className="py-2 px-3 whitespace-nowrap text-slate-700 font-medium">
                          {row[h] !== null && row[h] !== undefined ? String(row[h]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-slate-400">Loading audit report records...</div>
          )}
        </div>
      </div>
    </div>
  );
}
