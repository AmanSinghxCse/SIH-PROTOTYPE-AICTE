import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { getCaseAgeInDays } from '../../utils/dateUtils';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  Shield,
  Building2,
  PieChart as PieIcon,
  AlertTriangle,
  Lightbulb,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ManagementDashboardPage: React.FC = () => {
  const { currentUser, complaints, bureaus, institutions, relatedSuggestions } = useCaseTrack();
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 1. Calculate Average Resolution Turnaround strictly from genuinely resolved cases
  const resolvedCases = useMemo(() => {
    return complaints.filter(
      c => (c.status === 'Resolved' || c.status === 'Closed') && c.resolvedDate
    );
  }, [complaints]);

  const avgResolutionDays = useMemo(() => {
    if (resolvedCases.length === 0) return 0;
    const totalDays = resolvedCases.reduce((acc, c) => {
      return acc + getCaseAgeInDays(c.submissionDate, c.resolvedDate);
    }, 0);
    return Math.round(totalDays / resolvedCases.length);
  }, [resolvedCases]);

  // Overall Clearance Rate
  const clearanceRate = useMemo(() => {
    if (complaints.length === 0) return 0;
    return Math.round((resolvedCases.length / complaints.length) * 100);
  }, [resolvedCases, complaints]);

  // Overdue count
  const overdueCount = useMemo(() => {
    const today = '2026-10-23';
    return complaints.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;
  }, [complaints]);

  // Chronic institutions (>= 3 complaints)
  const chronicInstitutions = useMemo(() => {
    const map: Record<string, { name: string; count: number; code?: string }> = {};
    complaints.forEach(c => {
      const id = c.institutionId || c.institutionName;
      if (!map[id]) {
        map[id] = { name: c.institutionName, count: 0, code: c.institutionCode };
      }
      map[id].count++;
    });

    return Object.values(map)
      .filter(i => i.count >= 3)
      .sort((a, b) => b.count - a.count);
  }, [complaints]);

  // Bureau Performance Data
  const bureauData = useMemo(() => {
    return bureaus.map(b => {
      const bCases = complaints.filter(c => c.bureauId === b.id);
      const active = bCases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const resolved = bCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
      return {
        name: b.shortName || b.name,
        Active: active,
        Resolved: resolved
      };
    });
  }, [bureaus, complaints]);

  // Category Distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const colors = ['#0B477F', '#155A91', '#237A50', '#D97706', '#C43D3D', '#6366F1'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [complaints]);

  // Ageing Buckets
  const ageingData = useMemo(() => {
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;
    complaints.forEach(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return;
      const age = getCaseAgeInDays(c.submissionDate, '2026-10-23');
      if (age <= 7) b1++;
      else if (age <= 15) b2++;
      else if (age <= 30) b3++;
      else b4++;
    });

    return [
      { bucket: '<= 7 Days', count: b1, fill: '#237A50' },
      { bucket: '8-15 Days', count: b2, fill: '#155A91' },
      { bucket: '16-30 Days', count: b3, fill: '#D97706' },
      { bucket: '> 30 Days', count: b4, fill: '#C43D3D' }
    ];
  }, [complaints]);

  // Export Privacy-Safe CSV
  const handleExportCSV = () => {
    const headers = ['Case ID', 'Institution Name', 'Institution Code', 'Bureau', 'Category', 'Status', 'Filing Date', 'Resolution Date'];
    const rows = complaints.map(c => [
      c.id,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      c.institutionCode || 'N/A',
      c.bureauName,
      `"${c.category}"`,
      c.status,
      c.submissionDate,
      c.resolvedDate || 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Management_Macro_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Management Header Banner */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Executive Management & Policy Insights • SIH26264</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            Strategic Complaint Analytics & Institutional Oversight
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Observer: <strong className="text-[#17324D]">{currentUser.name}</strong> &bull; {currentUser.designation}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-sm"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Report Downloaded</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export Management Macro CSV</span>
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-xl p-4 flex items-center justify-between gap-4 text-xs text-[#53677D]">
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#0B477F] shrink-0" />
          <span>
            <strong className="text-[#17324D]">Privacy & Governance Compliance:</strong> Personal identifying information (PII) of complainants and privileged officer investigation deliberations are redacted from this executive interface.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#0B477F] font-bold px-2 py-0.5 bg-white rounded border border-[#D6E4F0]">
          DPDP Act / Anonymized View
        </span>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#53677D] uppercase">
            <span>System Intake</span>
            <Building2 className="w-4 h-4 text-[#0B477F]" />
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-2">{complaints.length}</p>
          <p className="text-xs text-[#53677D] mt-1">Total petitions across 8 institutions</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
            <span>Overall Clearance Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{clearanceRate}%</p>
          <p className="text-xs text-[#53677D] mt-1">{resolvedCases.length} resolved files</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 uppercase">
            <span>Avg Turnaround Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{avgResolutionDays} Days</p>
          <p className="text-xs text-[#53677D] mt-1">Calculated strictly from resolved files</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-red-800 uppercase">
            <span>Critical Overdue</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{overdueCount}</p>
          <p className="text-xs text-[#53677D] mt-1">Breached statutory bureau SLA</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bureau Workload Chart */}
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#17324D] mb-1">
            Bureau Active vs. Resolved Distribution
          </h2>
          <p className="text-xs text-[#53677D] mb-4">
            Comparison of case clearance efficiency across cells.
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F1FC" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#53677D' }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: '#53677D' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#D6E4F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Active" fill="#155A91" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#237A50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#17324D] mb-1">
            Complaint Category Distribution
          </h2>
          <p className="text-xs text-[#53677D] mb-4">
            Subject matter breakdown across technical institutes.
          </p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#D6E4F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Case Ageing Buckets + Chronic Colleges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Ageing Distribution */}
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <h2 className="text-sm font-bold text-[#17324D] mb-1">
            Active Docket Ageing Histogram
          </h2>
          <p className="text-xs text-[#53677D] mb-4">
            Calendar days elapsed since registration for open cases.
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F1FC" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#53677D' }} />
                <YAxis tick={{ fontSize: 11, fill: '#53677D' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#D6E4F0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Active Cases" radius={[4, 4, 0, 0]}>
                  {ageingData.map((entry, index) => (
                    <Cell key={`cell-age-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chronic Institutions Callout */}
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#17324D] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Chronic Institution Clusters (&ge; 3 Grievances)</span>
            </h2>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Policy Review Trigger
            </span>
          </div>
          <p className="text-xs text-[#53677D] mb-4">
            Institutions exhibiting repeat grievances indicating systemic compliance lapses.
          </p>

          <div className="space-y-3">
            {chronicInstitutions.map((inst, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-[#D6E4F0] bg-[#F1F7FC] flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-[#17324D]">{inst.name}</h4>
                  <p className="text-[11px] text-[#53677D] font-mono">AICTE Code: {inst.code || 'Registered'}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200">
                    {inst.count} Cases
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Policy Directives */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#17324D] mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <span>Executive Policy Recommendations (Generated from Heuristic Trends)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-1">Fee Refund Circular Enforcement</h4>
            <p className="text-blue-800">
              Correlated complaints show repeated caution money withholding for 2025 graduates. Issue centralized circular mandating automated refund portals.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
            <h4 className="font-bold text-indigo-900 mb-1">Annual Technical Approval Audits</h4>
            <p className="text-indigo-800">
              Laboratories with expired software licenses flagged across two engineering institutions suggest linking approval extension to active software audit certificates.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <h4 className="font-bold text-emerald-900 mb-1">Turnaround SLA Benchmark</h4>
            <p className="text-emerald-800">
              Average resolution turnaround currently stands at {avgResolutionDays} days. Recommend establishing a 21-day statutory threshold for student grievance cells.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
