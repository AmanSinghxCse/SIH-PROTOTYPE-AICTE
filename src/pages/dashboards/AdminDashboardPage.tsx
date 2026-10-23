import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { INITIAL_USERS } from '../../data/seedData';
import {
  ShieldCheck,
  Inbox,
  AlertTriangle,
  CheckCircle2,
  Users,
  Settings,
  Layers,
  Clock,
  ArrowRight,
  Filter,
  UserCheck,
  Building2,
  FileSpreadsheet,
  History,
  Check
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, complaints, bureaus, assignComplaint, auditLogs } = useCaseTrack();

  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>('');
  const [targetBureauId, setTargetBureauId] = useState<string>(bureaus[0]?.id || '');
  const [targetOfficerId, setTargetOfficerId] = useState<string>('USR-OFFICER-01');
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Administrative KPI Calculations
  const stats = useMemo(() => {
    const total = complaints.length;
    const unassigned = complaints.filter(c => !c.bureauId || !c.assignedOfficerId).length;
    const open = complaints.filter(c => c.status === 'Open' || c.status === 'Under Review').length;
    
    // Overdue logic: deadline before today and not resolved
    const today = '2026-10-23';
    const overdue = complaints.filter(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return false;
      return c.deadlineDate && c.deadlineDate < today;
    }).length;

    const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

    return { total, unassigned, open, overdue, resolved };
  }, [complaints]);

  // Bureau workload breakdown
  const bureauWorkload = useMemo(() => {
    return bureaus.map(b => {
      const bComplaints = complaints.filter(c => c.bureauId === b.id);
      const total = bComplaints.length;
      const active = bComplaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
      const overdue = bComplaints.filter(c => {
        if (c.status === 'Resolved' || c.status === 'Closed') return false;
        return c.deadlineDate && c.deadlineDate < '2026-10-23';
      }).length;
      const resolved = bComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;

      return {
        ...b,
        total,
        active,
        overdue,
        resolved
      };
    });
  }, [bureaus, complaints]);

  // Case Ageing metrics
  const ageingBuckets = useMemo(() => {
    const today = new Date('2026-10-23T00:00:00Z').getTime();
    let less7 = 0;
    let b8to15 = 0;
    let b16to30 = 0;
    let over30 = 0;

    complaints.forEach(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return;
      const subTime = new Date(`${c.submissionDate}T00:00:00Z`).getTime();
      const ageDays = Math.max(0, Math.floor((today - subTime) / (1000 * 60 * 60 * 24)));

      if (ageDays <= 7) less7++;
      else if (ageDays <= 15) b8to15++;
      else if (ageDays <= 30) b16to30++;
      else over30++;
    });

    return { less7, b8to15, b16to30, over30 };
  }, [complaints]);

  // Handle allocation submission
  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId) return;

    assignComplaint(selectedComplaintId, targetBureauId, targetOfficerId, assignNotes);
    setAssignSuccess(true);
    setTimeout(() => {
      setAllocationModalOpen(false);
      setAssignSuccess(false);
      setSelectedComplaintId('');
      setAssignNotes('');
    }, 1200);
  };

  const openAssignModalFor = (caseId: string) => {
    setSelectedComplaintId(caseId);
    setAllocationModalOpen(true);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0B477F] text-xs font-bold border border-blue-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Central Administration Portal • Nodal Governance</span>
          </div>
          <h1 className="text-2xl font-black text-[#17324D]">
            AICTE CaseTrack System Administration
          </h1>
          <p className="text-xs text-[#53677D] mt-1">
            Logged in as: <strong className="text-[#17324D]">{currentUser.name}</strong> ({currentUser.designation})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setSelectedComplaintId(complaints[0]?.id || '');
              setAllocationModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B477F] text-white text-xs font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Allocate / Reassign Case</span>
          </button>
          <Link
            to="/audit"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white border border-[#D6E4F0] text-[#17324D] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-[#0B477F]" />
            <span>System Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#53677D] uppercase">
            <span>Total Intake</span>
            <Inbox className="w-4 h-4 text-[#0B477F]" />
          </div>
          <p className="text-2xl font-black text-[#17324D] mt-2">{stats.total}</p>
          <p className="text-[11px] text-[#53677D] mt-0.5">Across all 5 bureaus</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase">
            <span>Unassigned Cases</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.unassigned}</p>
          <p className="text-[11px] text-[#53677D] mt-0.5">Awaiting bureau allocation</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-blue-700 uppercase">
            <span>Active / Open</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{stats.open}</p>
          <p className="text-[11px] text-[#53677D] mt-0.5">Under inquiry & review</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase">
            <span>Overdue Cases</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{stats.overdue}</p>
          <p className="text-[11px] text-[#53677D] mt-0.5">Exceeded statutory SLA</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D6E4F0] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase">
            <span>Resolved Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
          <p className="text-[11px] text-[#53677D] mt-0.5">With documented closure</p>
        </div>
      </div>

      {/* Bureau Workload Matrix */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0B477F]" />
              <span>Inter-Bureau Workload & SLA Matrix</span>
            </h2>
            <p className="text-xs text-[#53677D]">
              Real-time distribution of cases across AICTE specialized cells.
            </p>
          </div>
          <Link
            to="/registry"
            className="text-xs font-semibold text-[#0B477F] hover:underline flex items-center gap-1"
          >
            <span>View All in Central Registry</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F7FC] text-[#17324D] border-y border-[#D6E4F0]">
                <th className="py-2.5 px-4 font-bold">Bureau / Cell</th>
                <th className="py-2.5 px-4 font-bold">Head of Cell</th>
                <th className="py-2.5 px-3 font-bold text-center">Total Cases</th>
                <th className="py-2.5 px-3 font-bold text-center">Active</th>
                <th className="py-2.5 px-3 font-bold text-center text-red-600">Overdue</th>
                <th className="py-2.5 px-3 font-bold text-center text-emerald-600">Resolved</th>
                <th className="py-2.5 px-4 font-bold">Capacity Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D6E4F0]">
              {bureauWorkload.map(b => {
                const loadPercentage = Math.min(100, Math.round((b.active / 10) * 100));

                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#17324D]">{b.name}</p>
                      <p className="text-[11px] text-[#53677D] font-mono">{b.code}</p>
                    </td>
                    <td className="py-3 px-4 text-[#53677D]">
                      {b.officerInCharge}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#17324D]">
                      {b.total}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-blue-700">
                      {b.active}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-red-600">
                      {b.overdue}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">
                      {b.resolved}
                    </td>
                    <td className="py-3 px-4 w-44">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              loadPercentage > 75 ? 'bg-red-500' : loadPercentage > 45 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${loadPercentage}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#53677D] w-8">
                          {loadPercentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Ageing Buckets + User Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Ageing distribution */}
        <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <h2 className="text-base font-bold text-[#17324D] mb-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B477F]" />
            <span>Active Case Ageing</span>
          </h2>
          <p className="text-xs text-[#53677D] mb-4">
            Age calculated in calendar days from registration docket date.
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">&le; 7 Days (Fresh Intake)</p>
                <p className="text-[11px] text-emerald-700">Within preliminary inquiry phase</p>
              </div>
              <span className="text-lg font-black text-emerald-800">{ageingBuckets.less7}</span>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-900">8 &ndash; 15 Days (Active Review)</p>
                <p className="text-[11px] text-blue-700">Institution explanation sought</p>
              </div>
              <span className="text-lg font-black text-blue-800">{ageingBuckets.b8to15}</span>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900">16 &ndash; 30 Days (Approaching SLA)</p>
                <p className="text-[11px] text-amber-700">Priority follow-up mandated</p>
              </div>
              <span className="text-lg font-black text-amber-800">{ageingBuckets.b16to30}</span>
            </div>

            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-red-900">&gt; 30 Days (Critical Overdue)</p>
                <p className="text-[11px] text-red-700">Subject to supervisory escalation</p>
              </div>
              <span className="text-lg font-black text-red-800">{ageingBuckets.over30}</span>
            </div>
          </div>
        </div>

        {/* User Management & Security Directory */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0B477F]" />
                <span>Authorized System Users & Access Privileges</span>
              </h2>
              <p className="text-xs text-[#53677D]">
                Active staff accounts across all 6 role definitions.
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 bg-[#F1F7FC] text-[#0B477F] rounded border border-[#D6E4F0]">
              {INITIAL_USERS.length} Active Accounts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F1F7FC] text-[#17324D] border-y border-[#D6E4F0]">
                  <th className="py-2 px-3 font-bold">Officer / User</th>
                  <th className="py-2 px-3 font-bold">Role</th>
                  <th className="py-2 px-3 font-bold">Assigned Cell</th>
                  <th className="py-2 px-3 font-bold">Contact Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6E4F0]">
                {INITIAL_USERS.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-[#17324D]">{user.name}</p>
                      <p className="text-[11px] text-[#53677D]">{user.designation}</p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#0B477F] border border-slate-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#53677D]">
                      {user.bureauName || 'Central / Citizen'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#53677D]">
                      {user.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Allocation Modal */}
      {allocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#D6E4F0]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#17324D] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0B477F]" />
                <span>Allocate Case to Bureau & Officer</span>
              </h3>
              <button
                type="button"
                onClick={() => setAllocationModalOpen(false)}
                className="text-[#53677D] hover:text-[#17324D] text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {assignSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-emerald-800">Case Allocated Successfully!</p>
                <p className="text-xs text-emerald-700">Audit record has been logged.</p>
              </div>
            ) : (
              <form onSubmit={handleAssign} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Select Complaint
                  </label>
                  <select
                    value={selectedComplaintId}
                    onChange={(e) => setSelectedComplaintId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    <option value="">-- Choose a Complaint --</option>
                    {complaints.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.title.substring(0, 50)}... ({c.bureauName || 'Unassigned'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Target Bureau / Cell
                  </label>
                  <select
                    value={targetBureauId}
                    onChange={(e) => setTargetBureauId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    {bureaus.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Assigned Handling Officer
                  </label>
                  <select
                    value={targetOfficerId}
                    onChange={(e) => setTargetOfficerId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  >
                    <option value="USR-OFFICER-01">Smt. Sunita Verma (Assistant Director / Grievance)</option>
                    <option value="USR-SUPERVISOR-01">Dr. P. K. Nambiar (Appellate Director / QA)</option>
                    <option value="USR-VERIFY-01">Shri Rameshwar Nath (Senior Verification Officer)</option>
                    <option value="USR-ADMIN-01">Shri Arvind Saxena (Nodal Administrator)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17324D] mb-1">
                    Assignment Directive / Nodal Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Enter statutory instructions, priority mandate, or timeline directions for the officer..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#D6E4F0] focus:ring-2 focus:ring-[#0B477F] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAllocationModalOpen(false)}
                    className="px-4 py-2 border border-[#D6E4F0] rounded-lg text-xs font-semibold text-[#53677D] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B477F] text-white rounded-lg text-xs font-bold hover:bg-[#155A91] shadow-sm"
                  >
                    Confirm Allocation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
