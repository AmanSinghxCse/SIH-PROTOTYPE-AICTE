import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { getCaseAgeInDays, isOverdue } from '../utils/dateUtils';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Download,
  Info,
  ShieldCheck,
  Building2,
  PieChart as PieIcon
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
  Cell,
  LineChart,
  Line
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, bureaus, institutions, relatedSuggestions } = useCaseTrack();

  // 1. Calculate Average Resolution Turnaround for resolved cases
  const resolvedCases = complaints.filter(
    c => (c.status === 'Resolved' || c.status === 'Closed') && c.resolvedDate
  );

  const totalResolutionDays = resolvedCases.reduce((acc, c) => {
    return acc + getCaseAgeInDays(c.submissionDate, c.resolvedDate);
  }, 0);

  const avgResolutionDays = resolvedCases.length > 0
    ? (totalResolutionDays / resolvedCases.length).toFixed(1)
    : 'N/A';

  // 2. Category Distribution
  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    name: cat.split(' & ')[0], // short name
    fullName: cat,
    count
  }));

  // 3. Bureau Overdue & Active Breakdown
  const bureauBreakdown = bureaus.map(b => {
    const bCases = complaints.filter(c => c.bureauId === b.id);
    const overdue = bCases.filter(c => isOverdue(c.deadlineDate, c.status)).length;
    const resolved = bCases.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const onTrack = bCases.length - overdue - resolved;

    return {
      name: b.shortName,
      onTrack,
      overdue,
      resolved,
      total: bCases.length
    };
  });

  // 4. Institution Grievance Distribution
  const institutionDistribution = institutions.map(i => {
    const count = complaints.filter(c => c.institutionId === i.id).length;
    return {
      name: i.name.split(' ')[0] + ' ' + (i.name.split(' ')[1] || ''),
      fullName: i.name,
      complaints: count
    };
  });

  // 5. Related-Case Review Outcomes
  const confirmedCount = relatedSuggestions.filter(s => s.status === 'Confirmed Related').length;
  const pendingCount = relatedSuggestions.filter(s => s.status === 'Pending Review').length;
  const rejectedCount = relatedSuggestions.filter(s => s.status === 'Marked Unrelated').length;

  const relationshipOutcomeData = [
    { name: 'Confirmed Related', value: confirmedCount, color: '#237A50' },
    { name: 'Pending Review', value: pendingCount, color: '#D97706' },
    { name: 'Marked Unrelated', value: rejectedCount, color: '#53677D' }
  ].filter(d => d.value > 0);

  // CSV Export for Analytics
  const handleExportAnalytics = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Stored Complaints', complaints.length],
      ['Resolved Complaints', resolvedCases.length],
      ['Average Resolution Time (Days)', avgResolutionDays],
      ['Total Educational Institutions', institutions.length],
      ['Pending Related Suggestions', pendingCount],
      ['Confirmed Related Relationships', confirmedCount],
      ['', ''],
      ['Bureau', 'Total Cases', 'On Track', 'Overdue', 'Resolved'],
      ...bureauBreakdown.map(b => [b.name, b.total, b.onTrack, b.overdue, b.resolved])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_management_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Management Analytics & Insights
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
              AICTE Oversight
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Empirical turnaround evaluation and operational workload metrics derived from recorded case data.
          </p>
        </div>

        <button
          onClick={handleExportAnalytics}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/registry?status=Resolved')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-sm transition cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block group-hover:text-blue-700">
            Avg Turnaround Time
          </span>
          <div className="text-3xl font-black text-blue-700 mt-1">{avgResolutionDays} Days</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Calculated across resolved files • Click to view</p>
        </div>

        <div
          onClick={() => navigate('/registry?status=Resolved')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block group-hover:text-emerald-700">
            Resolution Efficiency
          </span>
          <div className="text-3xl font-black text-emerald-700 mt-1">
            {((resolvedCases.length / complaints.length) * 100).toFixed(0)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{resolvedCases.length} of {complaints.length} concluded • View files</p>
        </div>

        <div
          onClick={() => navigate('/institutions')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block group-hover:text-indigo-700">
            Institutional Coverage
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1">{institutions.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Monitored colleges & institutes • View profiles</p>
        </div>

        <div
          onClick={() => navigate('/registry?filter=all')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-sm transition cursor-pointer group"
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block group-hover:text-[#0B477F]">
            Cross-Case Correlation
          </span>
          <div className="text-3xl font-black text-[#0B477F] mt-1">
            {relatedSuggestions.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">{confirmedCount} confirmed by officers • View cases</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bureau Status Breakdown */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Cases & Deadlines by AICTE Bureau</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison of on-track vs overdue vs resolved cases across cells.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="onTrack" name="On Track" fill="#0B477F" stackId="a" />
                <Bar dataKey="overdue" name="Overdue" fill="#C43D3D" stackId="a" />
                <Bar dataKey="resolved" name="Resolved" fill="#237A50" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints Volume by Category</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Distribution across fees, labs, faculty, examinations, ragging, and approvals.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val, name, item) => [val, (item.payload as any).fullName]} />
                <Bar dataKey="count" fill="#155A91" radius={[0, 4, 4, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Institution Concentration */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Complaints Volume by Institution</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Identify repeat grievances concentrated in specific colleges.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={institutionDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 9 }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val, name, item) => [val, (item.payload as any).fullName]} />
                <Bar dataKey="complaints" name="Complaints Logged" fill="#0B477F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Related Case Review Decisions */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Related-Case Review Outcomes</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Officer confirmations vs discretionary rejections vs unreviewed proposals.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={relationshipOutcomeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {relationshipOutcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Methodology & Calculation Transparency Panel */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Analytics Methodology & Statistical Integrity Disclosure</span>
        </div>
        <p className="leading-relaxed">
          • <strong>Average Turnaround Time:</strong> Computed as <code>(Resolved Date - Submission Date)</code> strictly for resolved/closed complaints with valid dates. Unresolved cases are excluded to prevent survivorship distortion.<br />
          • <strong>Overdue Metric:</strong> Evaluated against recorded statutory deadlines. Missing deadline fields default to the bureau SLA (typically 30 days).<br />
          • <strong>SIH26264 Prototype Compliance:</strong> All charts render from underlying demonstration state. No randomized numbers or speculative percentage efficiency claims are presented without verified empirical benchmarks.
        </p>
      </div>
    </div>
  );
};
