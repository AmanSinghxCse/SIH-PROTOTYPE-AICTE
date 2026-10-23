import React from 'react';
import { ComplaintStatus, ComplaintPriority, MilestoneStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (status) {
    case 'Open':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#155A91]"></span>
          Open
        </span>
      );
    case 'Under Review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-[#D97706] border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          Under Review
        </span>
      );
    case 'Awaiting Information':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#E5F1FC] text-[#155A91] border border-[#D6E4F0] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#155A91]"></span>
          Awaiting Info
        </span>
      );
    case 'Escalated':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-red-50 text-[#C43D3D] border border-red-200 font-bold ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C43D3D] animate-ping"></span>
          Escalated
        </span>
      );
    case 'Resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-[#237A50] border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#237A50]"></span>
          Resolved
        </span>
      );
    case 'Closed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#F1F7FC] text-[#53677D] border border-[#D6E4F0] ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#53677D]"></span>
          Closed
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-[#F1F7FC] text-[#17324D] border border-[#D6E4F0] ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs font-semibold';

  switch (priority) {
    case 'Urgent':
      return (
        <span className={`inline-flex items-center rounded bg-red-50 text-[#C43D3D] border border-red-200 font-bold ${sizeClasses}`}>
          Urgent
        </span>
      );
    case 'High':
      return (
        <span className={`inline-flex items-center rounded bg-amber-50 text-[#D97706] border border-amber-200 ${sizeClasses}`}>
          High
        </span>
      );
    case 'Medium':
      return (
        <span className={`inline-flex items-center rounded bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0] ${sizeClasses}`}>
          Medium
        </span>
      );
    case 'Normal':
      return (
        <span className={`inline-flex items-center rounded bg-[#F1F7FC] text-[#53677D] border border-[#D6E4F0] ${sizeClasses}`}>
          Normal
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
};

export const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
  let color = 'bg-[#F1F7FC] text-[#53677D] border-[#D6E4F0]';
  if (score >= 80) color = 'bg-emerald-50 text-[#237A50] border-emerald-300 font-bold';
  else if (score >= 65) color = 'bg-amber-50 text-[#D97706] border-amber-300 font-semibold';
  else if (score >= 40) color = 'bg-[#E5F1FC] text-[#0B477F] border-[#D6E4F0]';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${color}`}>
      {score}% Match
    </span>
  );
};

export const MilestoneBadge: React.FC<{ status: MilestoneStatus }> = ({ status }) => {
  switch (status) {
    case 'Completed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#237A50] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#237A50]"></span>
          Completed
        </span>
      );
    case 'In Progress':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#155A91] animate-pulse"></span>
          In Progress
        </span>
      );
    case 'Needs Verification':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-[#D97706] border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]"></span>
          Needs Verification
        </span>
      );
    case 'Not Started':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F1F7FC] text-[#53677D] border border-[#D6E4F0]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#53677D]"></span>
          Not Started
        </span>
      );
  }
};
