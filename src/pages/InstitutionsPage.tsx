import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { Institution, Complaint } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate, isOverdue } from '../utils/dateUtils';
import {
  Building2,
  Search,
  MapPin,
  Award,
  Calendar,
  AlertTriangle,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const InstitutionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { institutions, complaints } = useCaseTrack();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstId, setSelectedInstId] = useState<string>(() => {
    const qId = searchParams.get('id');
    return qId && institutions.some(i => i.id === qId) ? qId : institutions[0].id;
  });

  useEffect(() => {
    const qId = searchParams.get('id');
    if (qId && institutions.some(i => i.id === qId)) {
      setSelectedInstId(qId);
    }
  }, [searchParams, institutions]);

  // Compute stats per institution
  const institutionStats = useMemo(() => {
    return institutions.map(inst => {
      const instComplaints = complaints.filter(c => c.institutionId === inst.id);
      const openCount = instComplaints.filter(c => c.status === 'Open').length;
      const underReviewCount = instComplaints.filter(c => c.status === 'Under Review' || c.status === 'Awaiting Information' || c.status === 'Escalated').length;
      const resolvedCount = instComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
      const overdueCount = instComplaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;

      // Find latest date
      let latestDate = '—';
      if (instComplaints.length > 0) {
        const sortedDates = [...instComplaints].sort(
          (a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()
        );
        latestDate = sortedDates[0].submissionDate;
      }

      return {
        ...inst,
        totalComplaints: instComplaints.length,
        openCount,
        underReviewCount,
        resolvedCount,
        overdueCount,
        latestDate,
        complaints: instComplaints
      };
    });
  }, [institutions, complaints]);

  // Filtered list based on search
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return institutionStats;
    const q = searchTerm.toLowerCase();
    return institutionStats.filter(
      i =>
        i.name.toLowerCase().includes(q) ||
        i.code.toLowerCase().includes(q) ||
        i.state.toLowerCase().includes(q) ||
        i.district.toLowerCase().includes(q)
    );
  }, [institutionStats, searchTerm]);

  const activeInstitution = institutionStats.find(i => i.id === selectedInstId) || institutionStats[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institution Directory & Case History
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
            {institutions.length} Monitored Institutions
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Entity-centric dossier aggregating all historical complaints by AICTE Permanent Institution ID.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Directory List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search institution name or AICTE ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredList.map(inst => {
              const isSelected = inst.id === activeInstitution.id;
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstId(inst.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{inst.name}</h4>
                      <span className="font-mono text-[10px] text-slate-500 block">{inst.code}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700">
                      {inst.totalComplaints} Cases
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {inst.district}, {inst.state}
                    </span>
                    {inst.overdueCount > 0 ? (
                      <span className="text-red-700 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        {inst.overdueCount} Overdue
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">0 Overdue</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Institution Dossier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Institution Profile Summary Card */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wide">
                  {activeInstitution.type}
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">{activeInstitution.name}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                  <span>AICTE Identifier: <strong>{activeInstitution.code}</strong></span>
                  <span>•</span>
                  <span>Est: {activeInstitution.establishedYear}</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-right text-xs shrink-0">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">NAAC / Accreditation</span>
                <span className="font-bold text-slate-800 text-sm">{activeInstitution.accreditedGrade}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Grievances</span>
                <span className="text-lg font-black text-slate-900">{activeInstitution.totalComplaints}</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-lg">
                <span className="text-blue-600 block text-[10px] uppercase font-bold">Open Cases</span>
                <span className="text-lg font-black text-blue-700">{activeInstitution.openCount}</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-lg">
                <span className="text-amber-800 block text-[10px] uppercase font-bold">Under Review</span>
                <span className="text-lg font-black text-amber-800">{activeInstitution.underReviewCount}</span>
              </div>
              <div className="p-3 bg-red-50/60 rounded-lg">
                <span className="text-red-700 block text-[10px] uppercase font-bold">Overdue Files</span>
                <span className="text-lg font-black text-red-700">{activeInstitution.overdueCount}</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeInstitution.address}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {activeInstitution.contactEmail}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {activeInstitution.contactPhone}
              </span>
            </div>

            {/* Statutory Disclaimer & Average Resolution Speed */}
            <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg p-3 text-[11px] text-[#53677D] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#0B477F]">
                <ShieldCheck className="w-4 h-4" />
                <span>Statutory Regulatory Notice:</span>
              </div>
              <p>
                The number of registered complaints reflects public intake and must not automatically be interpreted as proof of institutional wrongdoing until formal inquiry findings and official disposal directives are issued by the competent council authority.
              </p>
            </div>
          </div>

          {/* Associated Complaints List */}
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Chronological Complaint History ({activeInstitution.complaints.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All cases linked to this educational institution. Primary matching on AICTE ID.
                </p>
              </div>

              <button
                onClick={() => navigate(`/register`)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + File for this Institution
              </button>
            </div>

            {activeInstitution.complaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No complaint records logged for this institution yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeInstitution.complaints.map(c => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/case/${c.id}`)}
                    className="py-3.5 hover:bg-blue-50/50 cursor-pointer rounded-lg px-2 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{c.id}</span>
                        <StatusBadge status={c.status} size="sm" />
                        <PriorityBadge priority={c.priority} size="sm" />
                      </div>
                      <div className="text-xs font-semibold text-slate-900">{c.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>Category: <strong>{c.category}</strong></span>
                        <span>•</span>
                        <span>Bureau: <strong>{c.bureauName}</strong></span>
                        <span>•</span>
                        <span>Filed: <strong>{formatDate(c.submissionDate)}</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/case/${c.id}`);
                        }}
                        className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
                        Inspect File →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
