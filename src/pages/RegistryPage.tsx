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
  CheckCircle2
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
  const [sortField, setSortField] = useState<'id' | 'submissionDate' | 'deadlineDate' | 'status' | 'institutionName' | 'priority'>('submissionDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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
      }

      // Bureau
      if (filterBureau !== 'ALL' && c.bureauId !== filterBureau) return false;

      // Status
      if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;

      // Category
      if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;

      // Priority
      if (filterPriority !== 'ALL' && c.priority !== filterPriority) return false;

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
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'submissionDate' || sortField === 'deadlineDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
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
      'Complaint ID',
      'Institution Name',
      'Institution Code',
      'Category',
      'Bureau',
      'Assigned Officer',
      'Status',
      'Priority',
      'Submission Date',
      'Deadline Date',
      'Age (Days)',
      'Reference Number'
    ];

    const rows = sorted.map(c => [
      c.id,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      c.institutionCode,
      `"${c.category}"`,
      `"${c.bureauName}"`,
      `"${c.assignedOfficerName}"`,
      c.status,
      c.priority,
      c.submissionDate,
      c.deadlineDate,
      getCaseAgeInDays(c.submissionDate, c.resolvedDate),
      c.referenceNumber || ''
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
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Centralized Complaint Registry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
              {complaints.length} Total Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Cross-bureau repository for monitoring institutional cases, deadlines, and officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
            title="Download CSV report of currently filtered records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register Complaint</span>
          </button>
        </div>
      </div>

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
              placeholder="Search by ID, college name, code (e.g. AICTE-1-8492011), or topic..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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

        {/* Priority Filter & Quick State Pills */}
        {specialFilter !== 'ALL' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E5F1FC] border border-[#D6E4F0] rounded-lg text-xs text-[#0B477F]">
            <span>Active Dashboard Filter: <strong>{specialFilter.replace(/_/g, ' ').toUpperCase()}</strong></span>
            <button
              onClick={() => setSpecialFilter('ALL')}
              className="text-xs font-bold hover:underline ml-auto"
            >
              Clear Filter
            </button>
          </div>
        )}

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
              <span className={`font-medium ${onlyOverdue ? 'text-red-700 font-bold' : 'text-slate-600'}`}>
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
              <span className={`font-medium ${onlyApproaching ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
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
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complaint Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Complaint ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('institutionName')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Institution</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Bureau & Officer</th>
                <th
                  onClick={() => handleSort('submissionDate')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Filed / Age</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Priority</th>
                <th
                  onClick={() => handleSort('deadlineDate')}
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Deadline</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedComplaints.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-sm">No complaints found</p>
                    <p className="text-xs text-slate-400 mt-1">Try relaxing filters or resetting search parameters.</p>
                  </td>
                </tr>
              ) : (
                paginatedComplaints.map(c => {
                  const overdue = isOverdue(c.deadlineDate, c.status);
                  const approaching = isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays);
                  const age = getCaseAgeInDays(c.submissionDate, c.resolvedDate);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/case/${c.id}`)}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                        {c.id}
                      </td>

                      {/* Institution */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{c.institutionName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{c.institutionCode}</div>
                      </td>

                      {/* Category & Title */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{c.title}</div>
                        <div className="text-[11px] text-slate-500">{c.category}</div>
                      </td>

                      {/* Bureau & Officer */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{c.bureauName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-slate-400" />
                          <span>{c.assignedOfficerName}</span>
                        </div>
                      </td>

                      {/* Filed & Age */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800">{formatDate(c.submissionDate)}</div>
                        <div className="text-[11px] text-slate-500">{age} days ago</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={c.priority} size="sm" />
                      </td>

                      {/* Deadline */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className={`font-medium ${overdue ? 'text-red-700 font-bold' : approaching ? 'text-amber-700 font-semibold' : 'text-slate-700'}`}>
                          {formatDate(c.deadlineDate)}
                        </div>
                        {overdue && (
                          <span className="text-[10px] text-red-600 font-semibold block">
                            Overdue
                          </span>
                        )}
                        {approaching && (
                          <span className="text-[10px] text-amber-700 font-medium block">
                            Approaching
                          </span>
                        )}
                      </td>

                      {/* Quick Action Buttons */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/case/${c.id}`)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                            title="View Case Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('change_status') && (
                            <button
                              onClick={() => setStatusModalCase(c)}
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('assign_case') && (
                            <button
                              onClick={() => setAssignModalCase(c)}
                              className="p-1 text-[#53677D] hover:text-[#0B477F] hover:bg-[#F1F7FC] rounded transition-colors"
                              title="Assign / Reassign"
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
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
