import React from 'react';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { MilestoneStatus, ProjectMilestone } from '../../types';
import { MilestoneBadge } from '../common/Badge';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Calendar,
  UserCheck,
  Edit2
} from 'lucide-react';

export const ProjectMilestonesTracker: React.FC = () => {
  const { milestones, updateMilestoneStatus, hasPermission } = useCaseTrack();

  // Dynamic calculations for the 4 summary cards
  const completedCount = milestones.filter(m => m.status === 'Completed').length;
  const inProgressCount = milestones.filter(m => m.status === 'In Progress').length;
  const pendingCount = milestones.filter(m => m.status === 'Not Started').length;
  const verificationCount = milestones.filter(m => m.status === 'Needs Verification').length;

  const totalMilestones = milestones.length;
  const progressPercent = Math.round((completedCount / totalMilestones) * 100);

  const handleStatusChange = (id: number, status: MilestoneStatus) => {
    updateMilestoneStatus(id, status);
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-[#D6E4F0] p-6 space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6E4F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
              SIH Development Roadmap
            </span>
            <span className="text-xs text-[#53677D]">Objective Progress Tracker</span>
          </div>
          <h2 className="text-xl font-bold text-[#17324D] mt-1">
            Project Development Tracker
          </h2>
          <p className="text-xs text-[#53677D] mt-0.5">
            What has been implemented, who is responsible, and what remains to be completed for SIH26264 evaluation.
          </p>
        </div>

        {/* Global Completion Progress */}
        <div className="flex items-center gap-3 p-2.5 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0]">
          <div>
            <div className="text-[10px] uppercase font-bold text-[#53677D]">Implementation Completion</div>
            <div className="text-sm font-extrabold text-[#0B477F]">{progressPercent}% Achieved</div>
          </div>
          <div className="w-16 h-2 bg-[#D6E4F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#237A50] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top 4 Summary Cards (Calculated Dynamically) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Completed */}
        <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#237A50] uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-[#237A50]" />
          </div>
          <div className="text-2xl font-black text-[#237A50] mt-2">{completedCount}</div>
          <div className="text-[11px] text-[#53677D] mt-0.5">Verified & built in prototype</div>
        </div>

        {/* In Progress */}
        <div className="p-4 bg-[#E5F1FC]/50 rounded-xl border border-[#D6E4F0]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0B477F] uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-[#155A91] animate-pulse" />
          </div>
          <div className="text-2xl font-black text-[#0B477F] mt-2">{inProgressCount}</div>
          <div className="text-[11px] text-[#53677D] mt-0.5">Under active demonstration refinement</div>
        </div>

        {/* Pending / Not Started */}
        <div className="p-4 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#53677D] uppercase tracking-wider">Pending</span>
            <AlertCircle className="w-4 h-4 text-[#53677D]" />
          </div>
          <div className="text-2xl font-black text-[#17324D] mt-2">{pendingCount}</div>
          <div className="text-[11px] text-[#53677D] mt-0.5">Future phase integration</div>
        </div>

        {/* Items Requiring Verification */}
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider">Needs Verification</span>
            <HelpCircle className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-black text-[#D97706] mt-2">{verificationCount}</div>
          <div className="text-[11px] text-[#53677D] mt-0.5">Requires evaluative review</div>
        </div>
      </div>

      {/* Connected Milestone Diagram / List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#17324D] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0B477F]" />
            All Project Milestones & Work Details
          </span>
          <span className="text-[11px] text-[#53677D]">
            Status is editable to simulate milestone progression during review
          </span>
        </div>

        <div className="space-y-3">
          {milestones.map((m, idx) => {
            return (
              <div
                key={m.id}
                className="p-4 bg-white rounded-xl border border-[#D6E4F0] shadow-xs hover:border-[#155A91] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D6E4F0]/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#0B477F] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {m.id}
                    </span>
                    <h3 className="text-sm font-bold text-[#17324D]">{m.title}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#53677D]">
                      <UserCheck className="w-3.5 h-3.5 text-[#155A91]" />
                      <span>Owner: <strong className="text-[#17324D]">{m.ownerRole}</strong></span>
                    </div>

                    {/* Interactive Status Selector */}
                    <select
                      value={m.status}
                      onChange={e => handleStatusChange(m.id, e.target.value as MilestoneStatus)}
                      className="text-xs p-1 bg-[#F1F7FC] border border-[#D6E4F0] rounded font-semibold text-[#17324D] focus:outline-none focus:ring-1 focus:ring-[#0B477F] cursor-pointer"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Needs Verification">Needs Verification</option>
                      <option value="Not Started">Not Started</option>
                    </select>

                    <MilestoneBadge status={m.status} />
                  </div>
                </div>

                {/* Work Completed vs Next Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#F1F7FC] rounded-lg border border-[#D6E4F0] space-y-1">
                    <span className="text-[10px] font-bold text-[#237A50] uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#237A50]" />
                      Work Completed
                    </span>
                    <p className="text-[#17324D] leading-relaxed">{m.workCompleted}</p>
                  </div>

                  <div className="p-3 bg-[#E5F1FC]/50 rounded-lg border border-[#D6E4F0] space-y-1">
                    <span className="text-[10px] font-bold text-[#0B477F] uppercase flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-[#0B477F]" />
                      Next Action & Roadmap
                    </span>
                    <p className="text-[#17324D] leading-relaxed">{m.nextAction}</p>
                  </div>
                </div>

                <div className="text-[10px] text-[#53677D] flex items-center justify-between pt-1">
                  <span>Milestone Stage #{m.id} of {milestones.length}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#53677D]" />
                    Last Updated: {m.lastUpdated}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
