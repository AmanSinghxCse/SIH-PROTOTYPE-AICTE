import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularLifecycleDiagram } from '../components/workflow/CircularLifecycleDiagram';
import { ProjectMilestonesTracker } from '../components/workflow/ProjectMilestonesTracker';
import { ArrowLeft, GitBranch, Layers, ShieldCheck, FileCheck } from 'lucide-react';

export const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 border border-[#D6E4F0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#155A91] mb-1">
              <GitBranch className="w-4 h-4 text-[#0B477F]" />
              <span>SIH Problem Statement SIH26264</span>
            </div>
            <h1 className="text-2xl font-bold text-[#17324D]">
              Workflow Architecture & Project Progress
            </h1>
            <p className="text-sm text-[#53677D] mt-1 max-w-3xl">
              Transparent, end-to-end complaint processing across AICTE bureaus. Inspect how complaints transition through each stage, who holds accountability, and review milestones accomplished in this prototype.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/registry')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0B477F] text-white hover:bg-[#064578] transition-colors shadow-xs"
            >
              Open Registry
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#D6E4F0] bg-[#F1F7FC] text-[#0B477F] hover:bg-[#E5F1FC] transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Part 1: Circular Lifecycle Diagram */}
      <CircularLifecycleDiagram />

      {/* Part 2: Project Milestones Tracker */}
      <ProjectMilestonesTracker />
    </div>
  );
};
