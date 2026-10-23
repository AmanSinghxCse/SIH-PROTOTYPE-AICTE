import React, { useState, useMemo } from 'react';
import { Complaint, TimelineEvent } from '../../types';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { formatDate, getCaseAgeInDays, isOverdue } from '../../utils/dateUtils';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Building2,
  FileQuestion,
  Search,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

export interface StageDefinition {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  responsibleRole: string;
  publicExplanation: string;
  isConditional?: boolean;
}

export const LIFECYCLE_STAGES: StageDefinition[] = [
  {
    id: 1,
    key: 'registered',
    label: 'Complaint Registered',
    shortLabel: 'Registration',
    description: 'Complaint received and docket assigned with a unique reference tracking token.',
    responsibleRole: 'Public Complainant / Citizen Intake',
    publicExplanation: 'Your complaint has been logged in the AICTE CMIS registry and issued an official reference token.'
  },
  {
    id: 2,
    key: 'verification',
    label: 'Initial Verification',
    shortLabel: 'Verification',
    description: 'Document scrutiny and jurisdiction check performed to validate technical institution mandate.',
    responsibleRole: 'Scrutiny Officer / Administration Desk',
    publicExplanation: 'AICTE scrutiny officers verify that your complaint falls under technical education regulations with necessary prima facie evidence.'
  },
  {
    id: 3,
    key: 'awaiting_assignment',
    label: 'Awaiting Assignment',
    shortLabel: 'Allocation',
    description: 'Validated complaint queued for allocation to the specialized AICTE Bureau or Cell.',
    responsibleRole: 'Central Administration & Allocations',
    publicExplanation: 'Complaint verified and awaiting allocation to the designated cell (Grievance, Approval, Vigilance, etc.).'
  },
  {
    id: 4,
    key: 'bureau_assigned',
    label: 'Bureau Assigned',
    shortLabel: 'Assigned',
    description: 'Allocated to specialized cell and assigned to an authorized Bureau Officer in charge.',
    responsibleRole: 'Bureau In-Charge / Assigned Officer',
    publicExplanation: 'Assigned to the responsible AICTE Bureau and designated case handling officer for formal investigation.'
  },
  {
    id: 5,
    key: 'under_review',
    label: 'Case Under Review',
    shortLabel: 'Under Review',
    description: 'Officer conducts active inquiry, records initial findings, and prepares formal notices.',
    responsibleRole: 'Assigned Bureau Officer',
    publicExplanation: 'The bureau officer is actively reviewing allegations, examining institution guidelines, and preparing queries.'
  },
  {
    id: 6,
    key: 'institution_response',
    label: 'Institution Response / Info',
    shortLabel: 'Response Pending',
    description: 'Formal explanation called from the institution or additional clarification sought from complainant.',
    responsibleRole: 'Institution Authority / Complainant',
    publicExplanation: 'Formal explanation called from the institution or additional clarification sought from complainant.',
    isConditional: true
  },
  {
    id: 7,
    key: 'investigation',
    label: 'Action & Investigation',
    shortLabel: 'Investigation',
    description: 'Inquiry response assessed, factual verification conducted, or inspection team mobilized.',
    responsibleRole: 'Bureau Officer / Inquiry Committee',
    publicExplanation: 'Institution response and supporting materials are evaluated against council norms to decide remedial action.'
  },
  {
    id: 8,
    key: 'resolution_recommended',
    label: 'Resolution Recommended',
    shortLabel: 'Recommended',
    description: 'Bureau officer concludes findings and submits formal redressal recommendation for approval.',
    responsibleRole: 'Assigned Bureau Officer',
    publicExplanation: 'The inquiry officer has prepared official resolution findings and submitted them for administrative sanction.'
  },
  {
    id: 9,
    key: 'closure_review',
    label: 'Closure Review',
    shortLabel: 'Closure Review',
    description: 'Supervisory administration verifies institutional compliance before approving final closure.',
    responsibleRole: 'Supervisory Administration',
    publicExplanation: 'Final compliance check is underway by council administration before formal case disposal.'
  },
  {
    id: 10,
    key: 'closed',
    label: 'Disposed / Closed',
    shortLabel: 'Closed',
    description: 'Resolution order dispatched to complainant and institution; case officially archived.',
    responsibleRole: 'Council Competent Authority',
    publicExplanation: 'Complaint officially resolved with formal directive issued. Case closed in council records.'
  }
];

interface ComplaintLifecycleTrackerProps {
  complaint: Complaint;
  isPublic?: boolean;
  showTimeline?: boolean;
}

export const ComplaintLifecycleTracker: React.FC<ComplaintLifecycleTrackerProps> = ({
  complaint,
  isPublic = false,
  showTimeline = true
}) => {
  const { timelineEvents, notes } = useCaseTrack();
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  // Compute current stage ID based on complaint state and history
  const currentStageId = useMemo(() => {
    if (complaint.isReopened) {
      return 5; // Return to Under Review on reopen
    }
    if (complaint.status === 'Closed') return 10;
    if (complaint.status === 'Resolved' || complaint.status === 'Awaiting Closure Review') return 9;
    if (complaint.status === 'Resolution Recommended') return 8;
    if (complaint.status === 'Action & Investigation' || complaint.status === 'Escalated') return 7;
    if (complaint.status === 'Awaiting Information' || complaint.institutionResponseRequested) return 6;
    if (complaint.status === 'Under Review') return 5;
    if (complaint.assignedOfficerId && complaint.bureauId) return 4;
    if (complaint.verificationStatus === 'Verified') return 3;
    if (complaint.verificationStatus === 'Pending') return 2;
    return 1;
  }, [complaint]);

  const activeStage = LIFECYCLE_STAGES.find(s => s.id === (selectedStageId || currentStageId)) || LIFECYCLE_STAGES[0];

  const caseEvents: TimelineEvent[] = useMemo(() => {
    const list = timelineEvents[complaint.id] || [];
    if (!isPublic) return list;
    // Redact internal notes and staff allocation details from public timeline
    return list.filter(e => {
      if (e.type === 'NOTE_ADDED') return e.title.includes('Public') || e.title.includes('Information');
      return true;
    });
  }, [timelineEvents, complaint.id, isPublic]);

  const caseNotes = useMemo(() => {
    if (isPublic) return [];
    return notes[complaint.id] || [];
  }, [notes, complaint.id, isPublic]);

  const caseOverdue = isOverdue(complaint.deadlineDate, complaint.status);

  // Derive entry/exit timestamps from real events
  const stageTimelineInfo = useMemo(() => {
    const entryDate = complaint.submissionDate;
    let exitDate: string | undefined = undefined;
    if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
      exitDate = complaint.resolvedDate || complaint.lastUpdatedDate;
    }
    return { entryDate, exitDate };
  }, [complaint]);

  return (
    <div className="bg-white rounded-xl border border-[#D6E4F0] p-5 shadow-xs space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#D6E4F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
              Lifecycle Progression
            </span>
            {complaint.isReopened && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Reopened Case (Active Inquiry)</span>
              </span>
            )}
            {caseOverdue && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-rose-100 text-[#C43D3D] border border-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue Stage</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-[#17324D] mt-1 flex items-center gap-2">
            <span>Complaint Lifecycle:</span>
            <span className="font-mono text-[#0B477F]">{complaint.id}</span>
          </h3>
          <p className="text-xs text-[#53677D]">
            {isPublic
              ? 'Real-time transparent monitoring of your submitted grievance milestones.'
              : 'End-to-end statutory workflow tracking from citizen intake to council closure.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs">
          <span className="text-[#53677D]">Current State:</span>
          <span className="px-2.5 py-1 rounded-md font-bold bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
            Stage {currentStageId} of 10 ({complaint.status})
          </span>
        </div>
      </div>

      {/* Reopened Banner Notice */}
      {complaint.isReopened && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <RotateCcw className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Case Reopened on {complaint.reopenedDate || complaint.lastUpdatedDate}:</span>{' '}
            {complaint.reopenedReason || 'Additional evidence or compliance deficiency identified following preliminary disposal.'}
            <div className="text-[11px] text-amber-700 mt-0.5">
              Case has returned to active Stage 5 (Inquiry & Review) while preserving all historical audit records.
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Interactive Lifecycle Diagram (Desktop: scrollable row, Mobile: responsive wrap) */}
      <div className="overflow-x-auto pb-3 pt-1">
        <div className="min-w-[900px] flex items-center justify-between relative px-2">
          {/* Connector line between all stages */}
          <div className="absolute top-5 left-6 right-6 h-1 bg-[#D6E4F0] -z-0" />

          {LIFECYCLE_STAGES.map((stage) => {
            const isCompleted = stage.id < currentStageId;
            const isCurrent = stage.id === currentStageId;
            const isFuture = stage.id > currentStageId;
            const isSelected = activeStage.id === stage.id;

            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
                style={{ width: `${100 / LIFECYCLE_STAGES.length}%` }}
              >
                {/* Stage Node Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? caseOverdue
                        ? 'bg-rose-600 text-white ring-4 ring-rose-200 shadow-md scale-110'
                        : 'bg-[#0B477F] text-white ring-4 ring-blue-100 shadow-md scale-110'
                      : isCompleted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-[#F1F7FC] text-[#53677D] border-2 border-[#D6E4F0] hover:border-[#0B477F]'
                  } ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    caseOverdue ? (
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    ) : (
                      <span className="font-mono text-sm">{stage.id}</span>
                    )
                  ) : (
                    <span className="text-xs">{stage.id}</span>
                  )}
                </div>

                {/* Stage Label */}
                <div className="mt-2 text-center px-1">
                  <div
                    className={`text-[11px] leading-tight font-semibold line-clamp-2 transition-colors ${
                      isCurrent
                        ? 'text-[#0B477F] font-bold underline decoration-amber-400 decoration-2'
                        : isCompleted
                        ? 'text-[#17324D]'
                        : 'text-[#53677D]'
                    }`}
                  >
                    {stage.shortLabel}
                  </div>
                  <div className="text-[9px] text-[#53677D] mt-0.5 uppercase tracking-tighter">
                    {isCurrent ? (caseOverdue ? 'Overdue' : 'Active') : isCompleted ? 'Completed' : 'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Stage Detail Drawer / Inspection Panel */}
      <div className="bg-[#F1F7FC] rounded-xl border border-[#D6E4F0] p-4 text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D6E4F0] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0B477F] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {activeStage.id}
            </span>
            <div>
              <span className="font-bold text-sm text-[#17324D]">{activeStage.label}</span>
              <span className="text-[#53677D] ml-2">({activeStage.responsibleRole})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-[#53677D]">Stage State:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                activeStage.id === currentStageId
                  ? 'bg-blue-100 text-[#0B477F]'
                  : activeStage.id < currentStageId
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {activeStage.id === currentStageId
                ? 'Current Active Stage'
                : activeStage.id < currentStageId
                ? 'Completed'
                : 'Upcoming Stage'}
            </span>
          </div>
        </div>

        {/* Stage Content & Explanations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-[#17324D] mb-1">
              {isPublic ? 'Citizen Guidance & Stage Meaning' : 'Statutory Stage Mandate'}
            </div>
            <p className="text-[#53677D] leading-relaxed">
              {isPublic ? activeStage.publicExplanation : activeStage.description}
            </p>

            <div className="mt-3 space-y-1 text-[11px] text-[#53677D]">
              <div>
                <strong className="text-[#17324D]">Entry Date:</strong> {stageTimelineInfo.entryDate}
              </div>
              {stageTimelineInfo.exitDate && activeStage.id < currentStageId && (
                <div>
                  <strong className="text-[#17324D]">Completed Date:</strong> {stageTimelineInfo.exitDate}
                </div>
              )}
              <div>
                <strong className="text-[#17324D]">Configured Deadline:</strong> {complaint.deadlineDate}
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#17324D] mb-1">
              {isPublic ? 'What Happens at this Milestone' : 'Recorded Evidence & Operations'}
            </div>
            {isPublic ? (
              <p className="text-[#53677D] leading-relaxed">
                {activeStage.id <= currentStageId
                  ? 'Our compliance officers and bureau teams process this grievance under AICTE statutory regulations. You will receive notifications if additional clarification is required.'
                  : 'This step will automatically trigger upon completion of earlier milestones.'}
              </p>
            ) : (
              <div className="bg-white rounded-lg p-2.5 border border-[#D6E4F0] space-y-1.5 max-h-36 overflow-y-auto">
                <div className="text-[11px] text-[#17324D]">
                  <strong>Assigned Cell:</strong> {complaint.bureauName} ({complaint.bureauId || 'Unassigned'})
                </div>
                <div className="text-[11px] text-[#17324D]">
                  <strong>Assigned Officer:</strong> {complaint.assignedOfficerName || 'Awaiting Allocation'}
                </div>
                {complaint.findings && (
                  <div className="text-[11px] text-[#53677D]">
                    <strong>Officer Findings:</strong> {complaint.findings}
                  </div>
                )}
                {complaint.resolutionRecommendation && (
                  <div className="text-[11px] text-[#0B477F] font-medium">
                    <strong>Recommended Resolution:</strong> {complaint.resolutionRecommendation}
                  </div>
                )}
                {caseNotes.length > 0 && (
                  <div className="text-[11px] text-[#53677D]">
                    <strong>Internal Notes:</strong> {caseNotes.length} officer log entries recorded.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chronological Real Stored History Timeline */}
      {showTimeline && (
        <div className="pt-2 border-t border-[#D6E4F0] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17324D] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0B477F]" />
              <span>Complaint Event Stream & Audit Timeline ({caseEvents.length})</span>
            </h4>
            <span className="text-[11px] text-[#53677D]">Chronological historical audit records</span>
          </div>

          {caseEvents.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#53677D] border border-dashed border-[#D6E4F0] rounded-lg">
              No historical status mutations logged yet.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {caseEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-3 rounded-lg border border-[#D6E4F0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#0B477F] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#17324D]">{event.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E5F1FC] text-[#0B477F] font-mono">
                        {event.type}
                      </span>
                    </div>
                    <p className="text-[#53677D] text-[11px]">{event.description}</p>
                  </div>

                  <div className="text-left sm:text-right shrink-0 text-[11px] text-[#53677D]">
                    <div className="font-medium text-[#17324D]">
                      {isPublic ? 'AICTE Grievance Authority' : event.actorName}
                    </div>
                    <div className="text-[10px]">{formatDate(event.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};