import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { Complaint, ComplaintStatus } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate, getCaseAgeInDays, isApproachingDeadline, isOverdue } from '../utils/dateUtils';
import { UpdateStatusModal } from '../components/modals/UpdateStatusModal';
import { AssignCaseModal } from '../components/modals/AssignCaseModal';
import { AddNoteModal } from '../components/modals/AddNoteModal';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  Edit,
  Clock,
  ArrowUpDown,
  UserCheck,
  Building2,
  FileText,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const RegistryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    complaints,
    bureaus,
    updateComplaintStatus,
    assignComplaint,
    addNote,
    hasPermission,
    settings
  } = useCaseTrack();

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBureau, setFilterBureau] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [specialFilter, setSpecialFilter] = useState<string>('ALL');
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyApproaching, setOnlyApproaching] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<
    'id' | 'title' | 'institutionName' | 'category' | 'submissionDate' | 'deadlineDate' | 'status' | 'priority' | 'lastUpdatedDate'
  >('submissionDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Active Modals
  const [statusModalCase, setStatusModalCase] = useState<Complaint | null>(null);
  const [assignModalCase, setAssignModalCase] = useState<Complaint | null>(null);
  const [noteModalCase, setNoteModalCase] = useState<Complaint | null>(null);

  // Read URL query params on load (e.g. from Dashboard click)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const filterParam = searchParams.get('filter');
    const overdueParam = searchParams.get('overdue');
    const approachingParam = searchParams.get('approaching');
    const priorityParam = searchParams.get('priority');
    const searchParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');
    const bureauParam = searchParams.get('bureau');

    if (statusParam !== null) {
      setFilterStatus(statusParam);
    }
    if (filterParam !== null) {
      setSpecialFilter(filterParam);
    }
    if (priorityParam !== null) {
      setFilterPriority(priorityParam);
    }
    if (searchParam !== null) {
      setSearchTerm(searchParam);
    }
    if (categoryParam !== null) {
      setFilterCategory(categoryParam);
    }
    if (bureauParam !== null) {
      setFilterBureau(bureauParam);
    }
    setOnlyOverdue(overdueParam === 'true');
    setOnlyApproaching(approachingParam === 'true');
    setCurrentPage(1);
  }, [searchParams]);

  const today = '2026-10-23';

  // Dynamic helper for next required action
  const getNextRequiredAction = (c: Complaint) => {
    if (c.isReopened || c.status === 'Reopened') {
      return {
        label: 'Stage 5: High-Priority Re-inquiry Mandated',
        badge: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }
    if (!c.verificationStatus || c.verificationStatus === 'Pending') {
      return {
        label: 'Stage 2: Verify AICTE Code & Evidence',
        badge: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
    if (c.verificationStatus === 'Needs Information') {
      return {
        label: 'Stage 2: Citizen Clarification Pending',
        badge: 'bg-purple-100 text-purple-800 border-purple-300'
      };
    }
    if (!c.bureauId || !c.assignedOfficerId) {
      return {
        label: 'Stage 3: Allocate to Competent Bureau',
        badge: 'bg-orange-100 text-orange-800 border-orange-300'
      };
    }
    if (c.status === 'Awaiting Institution Response' || c.institutionResponseRequested) {
      return {
        label: 'Stage 6: Review Institutional Rejoinder',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    }
    if (c.status === 'Action & Investigation') {
      return {
        label: 'Stage 7: On-Site Inquiry / Expert Hearing',
        badge: 'bg-indigo-100 text-indigo-800 border-indigo-300'
      };
    }
    if (c.status === 'Resolution Recommended') {
      return {
        label: 'Stage 8: Formulate Statutory Directives',
        badge: 'bg-teal-100 text-teal-800 border-teal-300'
      };
    }
    if (c.status === 'Awaiting Closure Review' || (c.status === 'Resolved' && !c.closureApprovedBy)) {
      return {
        label: 'Stage 9: Administrative Sanction & Closure',
        badge: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    }
    if (c.status === 'Closed') {
      return {
        label: 'Stage 10: Disposed & Record Archived',
        badge: 'bg-slate-100 text-slate-600 border-slate-300'
      };
    }
    return {
      label: 'Stage 5: Conduct Preliminary Investigation',
      badge: 'bg-blue-100 text-blue-800 border-blue-300'
    };
  };

  // Filter complaints
  const filtered = useMemo(() => {
    return complaints.filter(c => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          c.id.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q) ||
          c.institutionCode.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Special Filter from Dashboard Cards
      if (specialFilter === 'unassigned') {
        if (c.bureauId && c.assignedOfficerId) return false;
      } else if (specialFilter === 'assigned') {
        if (!c.bureauId || !c.assignedOfficerId) return false;
      } else if (specialFilter === 'awaiting_verification') {
        if (c.verificationStatus === 'Verified') return false;
      } else if (specialFilter === 'institution_response') {
        if (c.status !== 'Awaiting Institution Response' && !c.institutionResponseRequested) return false;
      } else if (specialFilter === 'action') {
        if (c.status !== 'Action & Investigation' && c.status !== 'Escalated') return false;
      } else if (specialFilter === 'resolution_recommended') {
        if (c.status !== 'Resolution Recommended') return false;
      } else if (specialFilter === 'closure_review') {
        if (c.status !== 'Awaiting Closure Review' && c.status !== 'Resolved') return false;
      } else if (specialFilter === 'reopened') {
        if (!c.isReopened && c.status !== 'Reopened') return false;
      } else if (specialFilter === 'new_assigned') {
        if (!c.assignedOfficerId || c.status === 'Closed') return false;
      } else if (specialFilter === 'under_review') {
        if (c.status !== 'Under Review') return false;
      } else if (specialFilter === 'action_required') {
        if (c.status !== 'Action & Investigation' && c.status !== 'Awaiting Information') return false;
      } else if (specialFilter === 'near_deadline') {
        if (!isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)) return false;
      } else if (specialFilter === 'recent') {
        const sevenDaysAgo = '2026-10-16';
        if (!((c.lastUpdatedDate && c.lastUpdatedDate >= sevenDaysAgo) || c.submissionDate >= sevenDaysAgo)) return false;
      }

      // Bureau
      if (filterBureau !== 'ALL' && c.bureauId !== filterBureau) return false;

      // Status
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;

      // Category
      if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;

      // Priority
      if (filterPriority !== 'ALL') {
        if (filterPriority === 'High') {
          if (c.priority !== 'High' && c.priority !== 'Critical' && c.priority !== 'Urgent') return false;
        } else if (c.priority !== filterPriority) {
          return false;
        }
      }

      // Overdue
      if (onlyOverdue && !isOverdue(c.deadlineDate, c.status)) return false;

      // Approaching
      if (onlyApproaching && !isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)) {
        return false;
      }

      return true;
    });
  }, [complaints, searchTerm, filterBureau, filterStatus, filterCategory, filterPriority, specialFilter, onlyOverdue, onlyApproaching, settings]);

  // Sort complaints
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA: any = a[sortField] || '';
      let valB: any = b[sortField] || '';

      if (sortField === 'submissionDate' || sortField === 'deadlineDate' || sortField === 'lastUpdatedDate') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortAsc]);

  // Paginated slice
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginatedComplaints = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Complaint Reference ID',
      'Complaint Title',
      'Institution Name',
      'Institution Code',
      'Complaint Category',
      'Submission Date',
      'Priority',
      'Current Status',
      'Assigned Bureau',
      'Assigned Officer',
      'Days Pending',
      'Deadline',
      'Last Updated',
      'Next Required Action'
    ];

    const rows = sorted.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      c.institutionCode,
      `"${c.category}"`,
      c.submissionDate,
      c.priority,
      c.status,
      `"${c.bureauName}"`,
      `"${c.assignedOfficerName}"`,
      getCaseAgeInDays(c.submissionDate, c.resolvedDate),
      c.deadlineDate,
      c.lastUpdatedDate || c.submissionDate,
      `"${getNextRequiredAction(c).label}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_complaint_registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterBureau('ALL');
    setFilterStatus('ALL');
    setFilterCategory('ALL');
    setFilterPriority('ALL');
    setSpecialFilter('ALL');
    setOnlyOverdue(false);
    setOnlyApproaching(false);
    setCurrentPage(1);
    navigate('/registry', { replace: true });
  };

  // Prominent banner content
  const activeBannerInfo = useMemo(() => {
    if (specialFilter !== 'ALL') {
      const labels: Record<string, string> = {
        unassigned: 'Unassigned Complaints (Allocation Stage 3)',
        assigned: 'Assigned Complaints (Active with Desk Officer)',
        awaiting_verification: 'Awaiting Scrutiny & Document Verification (Stage 2)',
        institution_response: 'Awaiting Institution Explanation Notice (Stage 6)',
        action: 'Awaiting Administrative Action & Investigation (Stage 7)',
        resolution_recommended: 'Resolution Recommended (Concluded Cases)',
        closure_review: 'Awaiting Closure Review & Sanction (Stage 9)',
        reopened: 'Reopened Complaints (High-Priority Re-investigation)',
        new_assigned: 'Newly Assigned Officer Cases',
        under_review: 'Cases Under Preliminary Review (Stage 5)',
        action_required: 'Cases Requiring Formal Hearing / Evidence',
        near_deadline: `Cases Approaching SLA Deadline (Within ${settings.approachingDeadlineDays} Days)`,
        recent: 'Recently Updated Complaints (Last 7 Days)'
      };
      return {
        title: labels[specialFilter] || specialFilter.replace(/_/g, ' ').toUpperCase(),
        type: 'special'
      };
    }
    if (onlyOverdue) {
      return { title: 'Overdue Complaints (Statutory SLA Exceeded)', type: 'overdue' };
    }
    if (onlyApproaching) {
      return { title: `Approaching Deadline (Due Within ${settings.approachingDeadlineDays} Days)`, type: 'approaching' };
    }
    if (filterPriority !== 'ALL') {
      return { title: `${filterPriority} Priority Grievances`, type: 'priority' };
    }
    if (filterStatus !== 'ALL') {
      return { title: `Complaints in "${filterStatus}" Status`, type: 'status' };
    }
    if (filterBureau !== 'ALL') {
      const b = bureaus.find(x => x.id === filterBureau);
      return { title: `AICTE Bureau: ${b?.shortName || filterBureau}`, type: 'bureau' };
    }
    if (filterCategory !== 'ALL') {
      return { title: `Category: ${filterCategory}`, type: 'category' };
    }
    if (searchTerm.trim()) {
      return { title: `Search Query: "${searchTerm}"`, type: 'search' };
    }
    return null;
  }, [specialFilter, onlyOverdue, onlyApproaching, filterPriority, filterStatus, filterBureau, filterCategory, searchTerm, bureaus, settings]);

  return (
    <div className="space-y-6 animate-fadeIn py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#17324D] tracking-tight">
              Centralized Complaint Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E5F1FC] text-[#0B477F] text-xs font-bold border border-blue-200">
              {complaints.length} Total Records
            </span>
          </div>
          <p className="text-xs text-[#53677D] mt-1">
            Council-wide statutory repository for monitoring institutional cases, SLA deadlines, assigned bureaus, and lifecycle progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="Download CSV report of currently filtered records"
          >
            <Download className="w-3.5 h-3.5 text-[#0B477F]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B477F] hover:bg-[#155A91] rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register Complaint</span>
          </button>
        </div>
      </div>

      {/* Prominent Active Filter Banner */}
      {activeBannerInfo && (
        <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B477F] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Filter className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0B477F] bg-blue-100 px-2 py-0.5 rounded">
                  Active Filtered Destination
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0B477F] text-white">
                  {sorted.length} {sorted.length === 1 ? 'case matches' : 'cases match'}
                </span>
              </div>
              <h2 className="text-base font-black text-[#17324D] mt-0.5">{activeBannerInfo.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Clear Filter</span>
            </button>
            <button
              onClick={() => navigate('/portal/admin')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#0B477F] hover:bg-[#155A91] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Text Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, college name, code (e.g. AICTE-1-8492011), or subject..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20"
            />
          </div>

          {/* Bureau Filter */}
          <div>
            <select
              value={filterBureau}
              onChange={e => {
                setFilterBureau(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All AICTE Bureaus</option>
              {bureaus.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={e => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Infrastructure & Labs">Infrastructure & Labs</option>
              <option value="Academic Administration & Faculty">Academic Administration</option>
              <option value="Fee Irregularity & Caution Refund">Fee Irregularity</option>
              <option value="Examination Malpractice & Results">Examinations</option>
              <option value="Harassment & Anti-Ragging">Harassment / Anti-Ragging</option>
              <option value="Regulatory Compliance & Fraud">Regulatory & Compliance</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={e => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Awaiting Information">Awaiting Information</option>
              <option value="Awaiting Institution Response">Awaiting Institution Response</option>
              <option value="Action & Investigation">Action & Investigation</option>
              <option value="Resolution Recommended">Resolution Recommended</option>
              <option value="Awaiting Closure Review">Awaiting Closure Review</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Secondary Toggles & Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyOverdue}
                onChange={e => {
                  setOnlyOverdue(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-red-600 focus:ring-red-500"
              />
              <span className={`font-semibold ${onlyOverdue ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
                Overdue Cases Only
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyApproaching}
                onChange={e => {
                  setOnlyApproaching(e.target.checked);
                  setCurrentPage(1);
                }}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className={`font-semibold ${onlyApproaching ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
                Approaching Deadline (Within {settings.approachingDeadlineDays} Days)
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-[11px]">
              Showing <strong>{sorted.length}</strong> of {complaints.length} records
            </span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Comprehensive Complaint Registry Table (All Required Columns) */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                {/* 1. Reference ID */}
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Reference ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 2. Complaint Title */}
                <th
                  onClick={() => handleSort('title')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors min-w-[180px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Complaint Title</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. Institution Name */}
                <th
                  onClick={() => handleSort('institutionName')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors min-w-[170px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Institution Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 4. Complaint Category */}
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 5. Submission Date */}
                <th
                  onClick={() => handleSort('submissionDate')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Submission Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 6. Priority */}
                <th
                  onClick={() => handleSort('priority')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 7. Current Status */}
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 8. Assigned Bureau */}
                <th className="py-3 px-3.5 whitespace-nowrap">Assigned Bureau</th>

                {/* 9. Assigned Officer */}
                <th className="py-3 px-3.5 whitespace-nowrap">Assigned Officer</th>

                {/* 10. Days Pending */}
                <th className="py-3 px-3.5 whitespace-nowrap">Days Pending</th>

                {/* 11. Deadline */}
                <th
                  onClick={() => handleSort('deadlineDate')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Deadline</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 12. Last Updated */}
                <th
                  onClick={() => handleSort('lastUpdatedDate')}
                  className="py-3 px-3.5 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Updated</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 13. Next Required Action */}
                <th className="py-3 px-3.5 min-w-[200px]">Next Required Action</th>

                {/* 14. Actions */}
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-14 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-[#17324D]">No complaints matching criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting search filters or selecting all bureaus.</p>
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map(c => {
                  const overdue = isOverdue(c.deadlineDate, c.status);
                  const approaching = isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);
                  const age = getCaseAgeInDays(c.submissionDate, c.resolvedDate);
                  const nextAction = getNextRequiredAction(c);
                  const lastUpdate = c.lastUpdatedDate || c.submissionDate;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/case/${c.id}`)}
                    >
                      {/* 1. Reference ID */}
                      <td className="py-3.5 px-3.5 font-mono font-bold text-[#0B477F] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.id}</span>
                          {c.isReopened && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                              REOPENED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Complaint Title */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-900 line-clamp-1 group-hover:text-[#0B477F] transition-colors" title={c.title}>
                          {c.title}
                        </div>
                      </td>

                      {/* 3. Institution Name */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-semibold text-slate-800 line-clamp-1" title={c.institutionName}>
                          {c.institutionName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{c.institutionCode}</div>
                      </td>

                      {/* 4. Complaint Category */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700 font-medium">
                          {c.category}
                        </span>
                      </td>

                      {/* 5. Submission Date */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-700">
                        {formatDate(c.submissionDate)}
                      </td>

                      {/* 6. Priority */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>

                      {/* 7. Current Status */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* 8. Assigned Bureau */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{c.bureauName || 'Unassigned'}</span>
                      </td>

                      {/* 9. Assigned Officer */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-slate-700 font-medium">{c.assignedOfficerName || 'Pending Allocation'}</span>
                        </div>
                      </td>

                      {/* 10. Days Pending */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className={`font-semibold ${age > 30 ? 'text-red-700' : age > 15 ? 'text-amber-700' : 'text-slate-700'}`}>
                          {age} {age === 1 ? 'day' : 'days'}
                        </span>
                      </td>

                      {/* 11. Deadline */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className={`font-semibold ${overdue ? 'text-red-700 font-bold' : approaching ? 'text-amber-700' : 'text-slate-700'}`}>
                          {formatDate(c.deadlineDate)}
                        </div>
                        {overdue && (
                          <span className="text-[10px] text-red-600 font-bold block">
                            OVERDUE
                          </span>
                        )}
                        {approaching && (
                          <span className="text-[10px] text-amber-700 font-medium block">
                            Approaching
                          </span>
                        )}
                      </td>

                      {/* 12. Last Updated */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap text-slate-600">
                        {formatDate(lastUpdate)}
                      </td>

                      {/* 13. Next Required Action */}
                      <td className="py-3.5 px-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded text-[11px] font-semibold border ${nextAction.badge}`}>
                          {nextAction.label}
                        </span>
                      </td>

                      {/* 14. Actions */}
                      <td
                        className="py-3.5 px-3.5 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/case/${c.id}`)}
                            className="p-1.5 text-slate-500 hover:text-[#0B477F] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Lifecycle & Full Record"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('change_status') && (
                            <button
                              onClick={() => setStatusModalCase(c)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('assign_case') && (
                            <button
                              onClick={() => setAssignModalCase(c)}
                              className="p-1.5 text-[#53677D] hover:text-[#0B477F] hover:bg-[#F1F7FC] rounded-lg transition-colors"
                              title="Assign / Reassign Desk Officer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of{' '}
            <strong>{filtered.length}</strong> filtered records ({complaints.length} total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {statusModalCase && (
        <UpdateStatusModal
          isOpen={true}
          onClose={() => setStatusModalCase(null)}
          complaint={statusModalCase}
          onUpdate={updateComplaintStatus}
        />
      )}

      {assignModalCase && (
        <AssignCaseModal
          isOpen={true}
          onClose={() => setAssignModalCase(null)}
          complaint={assignModalCase}
          bureaus={bureaus}
          onAssign={assignComplaint}
        />
      )}

      {noteModalCase && (
        <AddNoteModal
          isOpen={true}
          onClose={() => setNoteModalCase(null)}
          complaint={noteModalCase}
          onAddNote={addNote}
        />
      )}
    </div>
  );
};
