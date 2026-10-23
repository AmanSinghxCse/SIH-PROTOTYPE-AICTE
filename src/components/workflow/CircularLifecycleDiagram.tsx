import React, { useState } from 'react';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { LifecycleStage, Complaint } from '../../types';
import {
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Layers,
  ChevronRight,
  Smartphone,
  Monitor
} from 'lucide-react';

interface CircularLifecycleProps {
  selectedComplaintId?: string;
  onSelectComplaint?: (complaint: Complaint) => void;
}

export const CircularLifecycleDiagram: React.FC<CircularLifecycleProps> = ({
  selectedComplaintId,
  onSelectComplaint
}) => {
  const { lifecycleStages, complaints } = useCaseTrack();

  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [activeComplaintId, setActiveComplaintId] = useState<string>(selectedComplaintId || 'AICTE-2026-COMP-104');
  const [viewMode, setViewMode] = useState<'circular' | 'linear'>('circular');

  // Selected complaint
  const activeComplaint = complaints.find(c => c.id === activeComplaintId) || complaints[0];

  // Determine which stage the selected complaint is currently in
  const getStageForComplaint = (complaint: Complaint): number => {
    switch (complaint.status) {
      case 'Open':
        return 1;
      case 'Under Review':
        return 4;
      case 'Awaiting Information':
        return 2;
      case 'Escalated':
        return 6;
      case 'Resolved':
        return 6;
      case 'Closed':
        return 7;
      default:
        return 1;
    }
  };

  const currentStageForComplaint = getStageForComplaint(activeComplaint);
  const activeStage = lifecycleStages.find(s => s.id === activeStageId) || lifecycleStages[0];

  // Coordinates for 7 points arranged evenly in a circle (center: 260, 260, radius: 180)
  const centerX = 260;
  const centerY = 260;
  const radius = 175;

  const getCoordinates = (index: number, total: number) => {
    // Start at top (-90 degrees) and rotate clockwise
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle
    };
  };

  const stageCoords = lifecycleStages.map((stage, idx) => ({
    stage,
    ...getCoordinates(idx, lifecycleStages.length)
  }));

  const handleComplaintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const compId = e.target.value;
    setActiveComplaintId(compId);
    const target = complaints.find(c => c.id === compId);
    if (target) {
      const stageId = getStageForComplaint(target);
      setActiveStageId(stageId);
      if (onSelectComplaint) onSelectComplaint(target);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-[#D6E4F0] p-6 space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D6E4F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
              Lifecycle Architecture
            </span>
            <span className="text-xs text-[#53677D]">7 Connected Standard Stages</span>
          </div>
          <h2 className="text-xl font-bold text-[#17324D] mt-1">
            Case Lifecycle & Circular Workflow
          </h2>
          <p className="text-xs text-[#53677D] mt-0.5">
            Understand how a complaint moves through the system, who is responsible at each stage, and what actions are enforced.
          </p>
        </div>

        {/* View Mode & Complaint Selector Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#F1F7FC] rounded-lg border border-[#D6E4F0] text-xs">
            <button
              onClick={() => setViewMode('circular')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                viewMode === 'circular'
                  ? 'bg-[#0B477F] text-white shadow-xs'
                  : 'text-[#53677D] hover:text-[#17324D]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Circular</span>
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-semibold transition-all ${
                viewMode === 'linear'
                  ? 'bg-[#0B477F] text-white shadow-xs'
                  : 'text-[#53677D] hover:text-[#17324D]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Step-by-Step</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#53677D] font-medium hidden sm:inline">Simulate Case:</span>
            <select
              value={activeComplaintId}
              onChange={handleComplaintChange}
              className="p-1.5 bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg text-xs font-semibold text-[#17324D] focus:outline-none focus:ring-1 focus:ring-[#0B477F]"
            >
              {complaints.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} • {c.status} ({c.institutionName.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Visual Workflow Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-2 sm:p-4 bg-[#F1F7FC] rounded-2xl border border-[#D6E4F0] min-h-[440px]">
          {viewMode === 'circular' ? (
            <div className="relative w-full max-w-[520px] aspect-square flex items-center justify-center">
              {/* SVG Connector Arrows */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 520 520">
                <defs>
                  {/* Standard Directional Arrow */}
                  <marker
                    id="arrowhead-blue"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#155A91" />
                  </marker>
                  {/* Return Loop Arrow */}
                  <marker
                    id="arrowhead-loop"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#0B477F" />
                  </marker>
                </defs>

                {/* Circular Track Guide */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke="#D6E4F0"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Connecting Arc Arrows between consecutive stages */}
                {stageCoords.map((coord, idx) => {
                  const nextCoord = stageCoords[(idx + 1) % stageCoords.length];
                  const isReturnLoop = idx === stageCoords.length - 1; // 7 -> 1

                  // Control point for subtle curve
                  const midX = (coord.x + nextCoord.x) / 2;
                  const midY = (coord.y + nextCoord.y) / 2;

                  return (
                    <path
                      key={`arc-${idx}`}
                      d={`M ${coord.x} ${coord.y} Q ${midX} ${midY} ${nextCoord.x} ${nextCoord.y}`}
                      fill="none"
                      stroke={isReturnLoop ? '#0B477F' : '#155A91'}
                      strokeWidth={isReturnLoop ? '2.5' : '2'}
                      strokeDasharray={isReturnLoop ? '6 4' : undefined}
                      markerEnd={isReturnLoop ? 'url(#arrowhead-loop)' : 'url(#arrowhead-blue)'}
                      opacity={isReturnLoop ? 0.8 : 0.7}
                    />
                  );
                })}

                {/* Center Core Emblem Box */}
                <circle cx={centerX} cy={centerY} r="65" fill="#FFFFFF" stroke="#D6E4F0" strokeWidth="2" />
                <circle cx={centerX} cy={centerY} r="55" fill="#E5F1FC" />
                <text
                  x={centerX}
                  y={centerY - 12}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#0B477F"
                >
                  AICTE CMIS
                </text>
                <text
                  x={centerX}
                  y={centerY + 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#53677D"
                >
                  Continuous
                </text>
                <text
                  x={centerX}
                  y={centerY + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#155A91"
                >
                  Grievance Loop
                </text>
              </svg>

              {/* Interactive Stage Nodes */}
              {stageCoords.map(({ stage, x, y }) => {
                const isSelected = activeStageId === stage.id;
                const isCurrentForComplaint = currentStageForComplaint === stage.id;
                const isCompleted = stage.id < currentStageForComplaint;

                return (
                  <button
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    style={{
                      left: `${(x / 520) * 100}%`,
                      top: `${(y / 520) * 100}%`
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-10 flex flex-col items-center ${
                      isSelected ? 'scale-110' : 'hover:scale-105'
                    }`}
                  >
                    {/* Outer Circle with Badge */}
                    <div
                      className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-colors ${
                        isCurrentForComplaint
                          ? 'bg-[#0B477F] text-white ring-4 ring-[#E5F1FC] border-2 border-[#155A91]'
                          : isCompleted
                          ? 'bg-[#237A50] text-white border border-[#237A50]'
                          : isSelected
                          ? 'bg-[#155A91] text-white ring-2 ring-[#0B477F]'
                          : 'bg-white text-[#0B477F] border-2 border-[#D6E4F0] hover:border-[#155A91]'
                      }`}
                    >
                      <span>{stage.id}</span>

                      {/* Current Stage Indicator Tag */}
                      {isCurrentForComplaint && (
                        <span className="absolute -top-2.5 px-1.5 py-0.2 rounded-full bg-[#D97706] text-white text-[9px] font-bold shadow-xs whitespace-nowrap">
                          Active
                        </span>
                      )}
                    </div>

                    {/* Stage Label under node */}
                    <span
                      className={`mt-1 text-[11px] font-bold text-center leading-tight max-w-[85px] transition-colors ${
                        isSelected || isCurrentForComplaint
                          ? 'text-[#0B477F]'
                          : 'text-[#17324D]'
                      }`}
                    >
                      {stage.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Linear Step-by-Step for Tablet / Mobile */
            <div className="w-full space-y-3 p-2">
              {lifecycleStages.map(stage => {
                const isSelected = activeStageId === stage.id;
                const isCurrentForComplaint = currentStageForComplaint === stage.id;
                const isCompleted = stage.id < currentStageForComplaint;

                return (
                  <div
                    key={stage.id}
                    onClick={() => setActiveStageId(stage.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#E5F1FC] border-[#0B477F] shadow-xs'
                        : isCurrentForComplaint
                        ? 'bg-amber-50/60 border-amber-300'
                        : 'bg-white border-[#D6E4F0] hover:bg-[#F1F7FC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrentForComplaint
                            ? 'bg-[#0B477F] text-white ring-2 ring-[#D97706]'
                            : isCompleted
                            ? 'bg-[#237A50] text-white'
                            : 'bg-white text-[#0B477F] border border-[#D6E4F0]'
                        }`}
                      >
                        {stage.id}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#17324D]">{stage.title}</div>
                        <div className="text-[10px] text-[#53677D]">{stage.role}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isCurrentForComplaint ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D97706] text-white">
                          Current Case Stage
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[#237A50] text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <span className="text-[#53677D] text-xs">Stage #{stage.id}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtitle Explaining Return Loop Arrow */}
          <div className="mt-2 text-center text-[11px] text-[#53677D] flex items-center justify-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-[#0B477F]" />
            <span>
              The return arrow signifies the continuous repeating institutional lifecycle for newly arriving complaints, not reopening closed cases.
            </span>
          </div>
        </div>

        {/* Stage Inspection Details Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-2xl border-2 border-[#0B477F] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#D6E4F0] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0B477F] text-white flex items-center justify-center font-black text-sm">
                  {activeStage.id}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#53677D]">Selected Stage Details</div>
                  <h3 className="text-base font-bold text-[#17324D]">{activeStage.title}</h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0]">
                {activeStage.statusName}
              </span>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#53677D]">Stage Overview</span>
              <p className="text-xs text-[#17324D] leading-relaxed">
                {activeStage.description}
              </p>
            </div>

            {/* Responsible Role */}
            <div className="p-3 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#0B477F] flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-[#0B477F]" />
                Responsible Actor / Authority
              </span>
              <div className="text-xs font-bold text-[#17324D]">
                {activeStage.role}
              </div>
            </div>

            {/* Action Required */}
            <div className="p-3 bg-[#E5F1FC]/60 rounded-xl border border-[#D6E4F0] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#155A91] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#155A91]" />
                Prescribed Procedural Action
              </span>
              <p className="text-xs text-[#17324D] leading-relaxed">
                {activeStage.actionRequired}
              </p>
            </div>

            {/* Current Complaint Status Binding */}
            <div className="pt-2 border-t border-[#D6E4F0] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#53677D] block text-[10px]">Active Simulated Case:</span>
                <span className="font-mono font-bold text-[#0B477F]">{activeComplaint.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[#53677D] block text-[10px]">Case Current Stage:</span>
                <span className="font-bold text-[#D97706]">
                  Stage #{currentStageForComplaint} ({lifecycleStages[currentStageForComplaint - 1]?.title})
                </span>
              </div>
            </div>
          </div>

          {/* Color Legend Card */}
          <div className="p-4 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0] space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-[#53677D] block">Lifecycle Status Color Legend</span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-[#17324D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#155A91]"></span>
                <span>Normal Workflow Path</span>
              </div>
              <div className="flex items-center gap-2 text-[#237A50]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#237A50]"></span>
                <span>Stage Passed / Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[#D97706]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]"></span>
                <span>Active / Pending Action</span>
              </div>
              <div className="flex items-center gap-2 text-[#C43D3D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C43D3D]"></span>
                <span>Overdue / Critical Stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
