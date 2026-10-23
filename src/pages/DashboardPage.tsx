import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { getCaseAgeInDays, isApproachingDeadline, isOverdue } from '../utils/dateUtils';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Filter,
  Info,
  ChevronDown,
  Building2,
  ArrowRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, bureaus, institutions, settings } = useCaseTrack();

  // Global filters
  const [selectedBureau, setSelectedBureau] = useState('ALL');
  const [selectedInstitution, setSelectedInstitution] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showHelp, setShowHelp] = useState(false);

  // Filter complaints based on selections
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      if (selectedBureau !== 'ALL' && c.bureauId !== selectedBureau) return false;
      if (selectedInstitution !== 'ALL' && c.institutionId !== selectedInstitution) return false;
      if (selectedPriority !== 'ALL' && c.priority !== selectedPriority) return false;
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
      return true;
    });
  }, [complaints, selectedBureau, selectedInstitution, selectedPriority, selectedStatus]);

  // Dynamic KPI Metrics
  const totalCases = filteredComplaints.length;
  const openCases = filteredComplaints.filter(c => c.status === 'Open').length;
  const underReviewCases = filteredComplaints.filter(c => c.status === 'Under Review' || c.status === 'Awaiting Information').length;
  const resolvedCases = filteredComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const overdueCases = filteredComplaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;
  const approachingCases = filteredComplaints.filter(c =>
    isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)
  ).length;

  // Visualizations Data

  // 1. Status Distribution
  const statusCounts: Record<string, number> = {};
  filteredComplaints.forEach(c => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });
  const statusChartData = [
    { name: 'Open', value: statusCounts['Open'] || 0, color: '#0B477F' },
    { name: 'Under Review', value: statusCounts['Under Review'] || 0, color: '#155A91' },
    { name: 'Awaiting Info', value: statusCounts['Awaiting Information'] || 0, color: '#D97706' },
    { name: 'Escalated', value: statusCounts['Escalated'] || 0, color: '#C43D3D' },
    { name: 'Resolved', value: (statusCounts['Resolved'] || 0) + (statusCounts['Closed'] || 0), color: '#237A50' }
  ].filter(d => d.value > 0);

  // 2. Complaints by Bureau
  const bureauData = bureaus.map(b => {
    const bComplaints = filteredComplaints.filter(c => c.bureauId === b.id);
    const resolved = bComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const pending = bComplaints.length - resolved;
    return {
      name: b.shortName,
      fullName: b.name,
      pending,
      resolved,
      total: bComplaints.length
    };
  });

  // 3. Case Ageing Buckets (Pending cases only)
  const pendingCases = filteredComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');
  const ageingBuckets = [
    { range: '0-15 Days', count: 0 },
    { range: '16-30 Days', count: 0 },
    { range: '31-45 Days', count: 0 },
    { range: '46+ Days', count: 0 }
  ];
  pendingCases.forEach(c => {
    const age = getCaseAgeInDays(c.submissionDate);
    if (age <= 15) ageingBuckets[0].count++;
    else if (age <= 30) ageingBuckets[1].count++;
    else if (age <= 45) ageingBuckets[2].count++;
    else ageingBuckets[3].count++;
  });

  // 4. Monthly Complaints Over Time
  const monthlyMap: Record<string, number> = {
    'Aug 2026': 0,
    'Sep 2026': 0,
    'Oct 2026': 0
  };
  filteredComplaints.forEach(c => {
    if (c.submissionDate.startsWith('2026-08')) monthlyMap['Aug 2026']++;
    else if (c.submissionDate.startsWith('2026-09')) monthlyMap['Sep 2026']++;
    else if (c.submissionDate.startsWith('2026-10')) monthlyMap['Oct 2026']++;
  });
  const trendData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));

  // 5. Workload By Officer
  const officerWorkload = [
    {
      name: 'Smt. Sunita Verma',
      bureau: 'Grievance Cell',
      assigned: filteredComplaints.filter(c => c.assignedOfficerName.includes('Verma')).length,
      overdue: filteredComplaints.filter(c => c.assignedOfficerName.includes('Verma') && isOverdue(c.deadlineDate, c.status)).length
    },
    {
      name: 'Dr. Meenakshi Sundaram',
      bureau: 'QA Bureau',
      assigned: filteredComplaints.filter(c => c.assignedOfficerName.includes('Meenakshi')).length,
      overdue: filteredComplaints.filter(c => c.assignedOfficerName.includes('Meenakshi') && isOverdue(c.deadlineDate, c.status)).length
    },
    {
      name: 'Shri Anand Kulkarni',
      bureau: 'Faculty Cell',
      assigned: filteredComplaints.filter(c => c.assignedOfficerName.includes('Kulkarni')).length,
      overdue: filteredComplaints.filter(c => c.assignedOfficerName.includes('Kulkarni') && isOverdue(c.deadlineDate, c.status)).length
    },
    {
      name: 'Dr. Rajesh Sharma',
      bureau: 'Approval Bureau',
      assigned: filteredComplaints.filter(c => c.assignedOfficerName.includes('Sharma')).length,
      overdue: filteredComplaints.filter(c => c.assignedOfficerName.includes('Sharma') && isOverdue(c.deadlineDate, c.status)).length
    },
    {
      name: 'Shri Vikramaditya Rathore',
      bureau: 'Anti-Ragging Cell',
      assigned: filteredComplaints.filter(c => c.assignedOfficerName.includes('Rathore')).length,
      overdue: filteredComplaints.filter(c => c.assignedOfficerName.includes('Rathore') && isOverdue(c.deadlineDate, c.status)).length
    }
  ];

  const handleCardClick = (filterType: string, filterVal: string) => {
    navigate(`/registry?${filterType}=${encodeURIComponent(filterVal)}`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              AICTE CaseTrack Dashboard
            </h1>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">
              SIH26264
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Centralized monitoring and tracking of institution-related complaint cases across AICTE Bureaus/Cells.
          </p>
        </div>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start md:self-auto"
        >
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>How to read this dashboard</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Accordion Explanation Box */}
      {showHelp && (
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-slate-700 space-y-2 animate-fadeIn">
          <div className="font-bold text-blue-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700" />
            Dashboard Metric Guidelines & AICTE CaseTrack Definitions
          </div>
          <p className="leading-relaxed">
            • <strong>Total Cases:</strong> Count of all logged complaints within selected filters.<br />
            • <strong>Overdue Cases:</strong> Active cases whose recorded deadline date is strictly prior to today.<br />
            • <strong>Approaching Deadline:</strong> Active cases due within {settings.approachingDeadlineDays} calendar days.<br />
            • <strong>Case Ageing:</strong> Calculated from submission timestamp up to present date for open cases, or up to resolution date for closed cases.<br />
            • <em>Notice: All metrics are computed dynamically from stored demonstration records. No random figures are generated.</em>
          </p>
        </div>
      )}

      {/* Global Filter Bar */}
      <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider pr-2 border-r border-slate-200">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Filters</span>
        </div>

        {/* Bureau Filter */}
        <select
          value={selectedBureau}
          onChange={e => setSelectedBureau(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Bureaus/Cells ({bureaus.length})</option>
          {bureaus.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Institution Filter */}
        <select
          value={selectedInstitution}
          onChange={e => setSelectedInstitution(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-xs"
        >
          <option value="ALL">All Institutions ({institutions.length})</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={selectedPriority}
          onChange={e => setSelectedPriority(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Normal">Normal</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="ALL">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Review">Under Review</option>
          <option value="Awaiting Information">Awaiting Information</option>
          <option value="Escalated">Escalated</option>
          <option value="Resolved">Resolved</option>
        </select>

        {(selectedBureau !== 'ALL' || selectedInstitution !== 'ALL' || selectedPriority !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedBureau('ALL');
              setSelectedInstitution('ALL');
              setSelectedPriority('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Summary KPI Cards (Clickable) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Cases */}
        <button
          onClick={() => handleCardClick('status', 'ALL')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cases</span>
            <FolderOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalCases}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>View all in registry</span>
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Open Cases */}
        <button
          onClick={() => handleCardClick('status', 'Open')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-blue-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Open</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{openCases}</div>
          <div className="text-[11px] text-slate-500 mt-1">Initial assessment pending</div>
        </button>

        {/* Under Review */}
        <button
          onClick={() => handleCardClick('status', 'Under Review')}
          className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 hover:border-amber-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{underReviewCases}</div>
          <div className="text-[11px] text-slate-500 mt-1">Inquiry / documents active</div>
        </button>

        {/* Overdue Cases */}
        <button
          onClick={() => handleCardClick('overdue', 'true')}
          className="p-4 bg-red-50/50 rounded-xl shadow-xs border border-red-200 hover:border-red-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-700 mt-2">{overdueCases}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">Exceeded target deadline</div>
        </button>

        {/* Approaching Deadline */}
        <button
          onClick={() => handleCardClick('approaching', 'true')}
          className="p-4 bg-amber-50/40 rounded-xl shadow-xs border border-amber-200 hover:border-amber-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Approaching</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-2">{approachingCases}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Due within {settings.approachingDeadlineDays} days</div>
        </button>

        {/* Resolved Cases */}
        <button
          onClick={() => handleCardClick('status', 'Resolved')}
          className="p-4 bg-emerald-50/40 rounded-xl shadow-xs border border-emerald-200 hover:border-emerald-400 hover:shadow-md text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-2">{resolvedCases}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Complied & closed</div>
        </button>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Case Status Distribution */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Case Status Distribution</h3>
              <span className="text-xs text-slate-500">{totalCases} Total Active</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Breakdown across Open, Under Review, Awaiting Info, Escalated, and Resolved states.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} Cases`, 'Count']} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Complaints Filed Over Time */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Complaints Intake Over Time</h3>
              <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Actual Filing Dates
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Monthly complaint volume based on recorded submission dates (Aug - Oct 2026).
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B477F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0B477F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E4F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#0B477F" fillOpacity={1} fill="url(#colorCount)" name="Complaints" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* C. Cases by Bureau/Cell */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Workload by Bureau / Cell</h3>
              <span className="text-xs text-slate-500">Pending vs Resolved</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Comparison of active case allocations across the 5 specialized AICTE Bureaus.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="pending" name="Active / Pending" fill="#0B477F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="#237A50" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* D. Case Ageing Analysis */}
        <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Case Ageing Distribution</h3>
              <span className="text-xs text-amber-700 font-semibold">{pendingCases.length} Pending Cases</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Days elapsed since submission for all currently unclosed complaint files.
            </p>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Case Count" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Officer Workload Overview Table */}
      <div className="p-5 bg-white rounded-xl shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              Officer Allocation & Overdue Status
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Operational load balancing across assigned Bureau Officers.
            </p>
          </div>
          <button
            onClick={() => navigate('/registry')}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Open Registry →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Officer Name</th>
                <th className="pb-2">AICTE Bureau / Cell</th>
                <th className="pb-2 text-center">Assigned Cases</th>
                <th className="pb-2 text-center">Overdue Files</th>
                <th className="pb-2 text-right">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {officerWorkload.map(ow => (
                <tr key={ow.name} className="hover:bg-slate-50/60">
                  <td className="py-2.5 font-bold text-slate-800">{ow.name}</td>
                  <td className="py-2.5 text-slate-600">{ow.bureau}</td>
                  <td className="py-2.5 text-center font-bold text-blue-700">{ow.assigned}</td>
                  <td className="py-2.5 text-center">
                    {ow.overdue > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[11px]">
                        {ow.overdue} Overdue
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">0 Overdue</span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    {ow.overdue > 1 ? (
                      <span className="text-xs text-rose-600 font-semibold">Immediate Review</span>
                    ) : (
                      <span className="text-xs text-slate-500">Normal Operations</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
