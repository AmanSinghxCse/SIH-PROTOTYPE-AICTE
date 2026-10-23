import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { StatusBadge, PriorityBadge, ScoreBadge } from '../components/common/Badge';
import { formatDate, formatDateTime, getCaseAgeInDays, isApproachingDeadline, isOverdue } from '../utils/dateUtils';
import { UpdateStatusModal } from '../components/modals/UpdateStatusModal';
import { AssignCaseModal } from '../components/modals/AssignCaseModal';
import { AddNoteModal } from '../components/modals/AddNoteModal';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  GitCompare,
  MessageSquare,
  ShieldCheck,
  Edit,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Tag,
  AlertCircle,
  Plus
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    complaints,
    timelineEvents,
    notes,
    relatedSuggestions,
    auditLogs,
    bureaus,
    institutions,
    updateComplaintStatus,
    assignComplaint,
    addNote,
    confirmRelationship,
    rejectRelationship,
    hasPermission,
    settings,
    currentUser
  } = useCaseTrack();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'assignment' | 'related' | 'notes' | 'audit'>('overview');

  // Modal triggers
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const complaint = complaints.find(c => c.id === id);

  if (!complaint) {
    return (
      <div className="p-12 text-center bg-white rounded-xl border border-slate-200 space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Complaint Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested case identifier "{id}" does not exist in the active registry.</p>
        <button
          onClick={() => navigate('/registry')}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const institution = institutions.find(i => i.id === complaint.institutionId) || institutions[0];
  const caseTimeline = timelineEvents[complaint.id] || [];
  const caseNotes = notes[complaint.id] || [];
  const caseSuggestions = relatedSuggestions.filter(
    s => s.complaintId === complaint.id || s.relatedComplaintId === complaint.id
  );
  const caseAuditLogs = auditLogs.filter(
    l => l.entityId === complaint.id || l.details.includes(complaint.id)
  );

  const overdue = isOverdue(complaint.deadlineDate, complaint.status);
  const approaching = isApproachingDeadline(complaint.deadlineDate, complaint.status, settings.approachingDeadlineDays);
  const age = getCaseAgeInDays(complaint.submissionDate, complaint.resolvedDate);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/registry')}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaint Registry</span>
        </button>

        <div className="flex items-center gap-2">
          {hasPermission('change_status') && (
            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          {hasPermission('assign_case') && (
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Reassign</span>
            </button>
          )}

          {currentUser.role !== 'management' && (
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          )}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-base font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              {overdue && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  Overdue
                </span>
              )}
              {approaching && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Approaching Target
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2">{complaint.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <button
                onClick={() => navigate(`/institutions?id=${complaint.institutionId}`)}
                className="text-blue-600 hover:underline font-semibold"
              >
                {complaint.institutionName}
              </button>
              <span>•</span>
              <span className="font-mono">{complaint.institutionCode}</span>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Bureau</span>
              <span className="font-semibold text-slate-800">{complaint.bureauName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Handling Officer</span>
              <span className="font-semibold text-slate-800">{complaint.assignedOfficerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Filing / Age</span>
              <span className="font-semibold text-slate-800">{formatDate(complaint.submissionDate)} ({age}d)</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Resolution Target</span>
              <span className={`font-semibold ${overdue ? 'text-red-700' : 'text-slate-800'}`}>
                {formatDate(complaint.deadlineDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Banner if Resolved */}
        {complaint.resolvedDate && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-bold">Case Resolved on {formatDate(complaint.resolvedDate)}: </strong>
              <span>{complaint.resolutionSummary || 'Compliance criteria fulfilled and verified by handling officer.'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview', icon: FileText },
          { key: 'timeline', label: `Timeline (${caseTimeline.length})`, icon: Clock },
          { key: 'assignment', label: 'Assignment & Status', icon: UserCheck },
          { key: 'related', label: `Related Cases (${caseSuggestions.length})`, icon: GitCompare },
          { key: 'notes', label: `Notes & Follow-ups (${caseNotes.length})`, icon: MessageSquare },
          { key: 'audit', label: `Audit Trail (${caseAuditLogs.length})`, icon: ShieldCheck }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Complaint Narrative & Facts
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>

              {complaint.tags && complaint.tags.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {complaint.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Source and Reference Metadata */}
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                Intake Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Source Channel</span>
                  <span className="font-semibold text-slate-800">{complaint.sourceChannel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Docket / Reference No.</span>
                  <span className="font-mono text-slate-800 font-semibold">{complaint.referenceNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Last System Update</span>
                  <span className="font-semibold text-slate-800">{formatDate(complaint.lastUpdatedDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Institution Profile Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Associated Institution
                </h4>
                <button
                  onClick={() => navigate(`/institutions?id=${complaint.institutionId}`)}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                <div className="font-bold text-slate-900">{institution.name}</div>
                <div className="text-slate-500 font-mono text-[11px]">{institution.code}</div>
                <div className="text-slate-600">{institution.type} • {institution.accreditedGrade}</div>
                <div className="text-slate-500">{institution.district}, {institution.state}</div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                Official Contact: {institution.contactEmail} • {institution.contactPhone}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recorded Lifecycle Timeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifiable event trail in chronological succession. Historical events cannot be altered.
            </p>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {caseTimeline.map((evt, idx) => (
              <div key={evt.id || idx} className="relative group">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white border-2 border-blue-400"></div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{evt.title}</span>
                    <span className="text-slate-400 text-[11px] font-mono">{formatDateTime(evt.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                  <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5">
                    <span>Recorded by:</span>
                    <strong className="text-slate-600">{evt.actorName}</strong>
                    <span>({evt.actorRole})</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Assignment & Status */}
      {activeTab === 'assignment' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bureau Assignment & Governance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized officers may modify status or reassign bureaus in compliance with AICTE jurisdiction.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Complaint State Machine
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Current Status:</span>
                <StatusBadge status={complaint.status} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Updating status transitions requires an official reason and creates an immutable audit record.
              </p>
              {hasPermission('change_status') ? (
                <button
                  onClick={() => setIsStatusModalOpen(true)}
                  className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Initiate Status Transition
                </button>
              ) : (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  Read-only view: Status modification restricted for your active role.
                </div>
              )}
            </div>

            {/* Assignment Card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Responsible Bureau & Officer
              </span>
              <div className="space-y-1 text-xs">
                <div className="text-slate-500">Bureau: <strong className="text-slate-800">{complaint.bureauName}</strong></div>
                <div className="text-slate-500">Handling Officer: <strong className="text-slate-800">{complaint.assignedOfficerName}</strong></div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cases may be transferred when inquiries reveal cross-functional subject matters.
              </p>
              {hasPermission('assign_case') ? (
                <button
                  onClick={() => setIsAssignModalOpen(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg shadow-xs transition-colors"
                >
                  Reassign Case Jurisdiction
                </button>
              ) : (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                  Assignment changes restricted to Administrators & Supervisors.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Related Cases */}
      {activeTab === 'related' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Explainable Related-Case Matches</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Heuristic signal matching highlights cases concerning the same institution or overlapping issues.
              </p>
            </div>
            <button
              onClick={() => navigate('/related-cases')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Open Detection Hub →
            </button>
          </div>

          {caseSuggestions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No correlated cases currently detected above the active similarity threshold ({settings.similarityThreshold}%).
            </div>
          ) : (
            <div className="space-y-4">
              {caseSuggestions.map(sugg => {
                const otherId = sugg.complaintId === complaint.id ? sugg.relatedComplaintId : sugg.complaintId;
                const otherCase = complaints.find(c => c.id === otherId);

                return (
                  <div
                    key={sugg.id}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-blue-700">{otherId}</span>
                        <ScoreBadge score={sugg.overallScore} />
                        <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                          sugg.status === 'Confirmed Related'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sugg.status === 'Marked Unrelated'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {sugg.status}
                        </span>
                      </div>

                      {otherCase && (
                        <button
                          onClick={() => navigate(`/case/${otherId}`)}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>Open Comparative Case</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {otherCase && (
                      <div className="text-xs text-slate-800">
                        <div className="font-semibold">{otherCase.title}</div>
                        <div className="text-slate-500 mt-0.5 line-clamp-2">{otherCase.description}</div>
                      </div>
                    )}

                    {/* Matching Signals Breakdown */}
                    <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg text-xs">
                      <div className="text-[10px] font-bold text-slate-500 uppercase">Explainable Matching Signals:</div>
                      {sugg.matchSignals.map((sig, i) => (
                        <div key={i} className="text-slate-700 flex items-center gap-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                          <span>{sig}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{sugg.explanation}"
                    </p>

                    {/* Review Action Buttons */}
                    {sugg.status === 'Pending Review' && hasPermission('review_related') && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => rejectRelationship(sugg.id, 'Officer determined cases represent distinct administrative issues.')}
                          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200"
                        >
                          Mark Not Related
                        </button>
                        <button
                          onClick={() => confirmRelationship(sugg.id, 'Officer confirmed correlation based on identical issue.')}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                        >
                          Confirm Related Case
                        </button>
                      </div>
                    )}

                    {sugg.reviewedBy && (
                      <div className="text-[11px] text-slate-400 pt-1">
                        Reviewed by: <strong className="text-slate-600">{sugg.reviewedBy}</strong> on {formatDateTime(sugg.reviewedAt)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Notes & Follow-ups */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Officer Inquiry Notes & Directives</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Internal minutes, telephone inquiry records, and actionable directives.
              </p>
            </div>
            {currentUser.role !== 'management' && (
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            )}
          </div>

          {caseNotes.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              No follow-up notes recorded yet. Click "Add Note" to add an inquiry minute.
            </div>
          ) : (
            <div className="space-y-3">
              {caseNotes.map(n => (
                <div key={n.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{n.authorName} ({n.authorRole})</span>
                    <span className="text-slate-400 font-mono text-[11px]">{formatDateTime(n.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                  {n.actionItem && (
                    <div className="p-2 bg-blue-50/80 rounded border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                      <strong className="font-bold">Next Action:</strong>
                      <span>{n.actionItem}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Audit History */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Case Audit Trail</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tamper-evident system log for actions pertaining to this complaint record.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Timestamp</th>
                  <th className="pb-2">Acting User</th>
                  <th className="pb-2">Action</th>
                  <th className="pb-2">Details</th>
                  <th className="pb-2 text-right">State Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-2.5 font-semibold text-slate-800">{log.userName}</td>
                    <td className="py-2.5 text-blue-700 font-medium">{log.action}</td>
                    <td className="py-2.5 text-slate-600 max-w-xs">{log.details}</td>
                    <td className="py-2.5 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.previousValue && log.newValue
                        ? `${log.previousValue} → ${log.newValue}`
                        : log.newValue || 'Recorded'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isStatusModalOpen && (
        <UpdateStatusModal
          isOpen={true}
          onClose={() => setIsStatusModalOpen(false)}
          complaint={complaint}
          onUpdate={updateComplaintStatus}
        />
      )}

      {isAssignModalOpen && (
        <AssignCaseModal
          isOpen={true}
          onClose={() => setIsAssignModalOpen(false)}
          complaint={complaint}
          bureaus={bureaus}
          onAssign={assignComplaint}
        />
      )}

      {isNoteModalOpen && (
        <AddNoteModal
          isOpen={true}
          onClose={() => setIsNoteModalOpen(false)}
          complaint={complaint}
          onAddNote={addNote}
        />
      )}
    </div>
  );
};
