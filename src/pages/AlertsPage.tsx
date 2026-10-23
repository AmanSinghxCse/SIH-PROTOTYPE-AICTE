import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { formatDate, getCaseAgeInDays, getDaysRemaining, isApproachingDeadline, isOverdue } from '../utils/dateUtils';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Filter,
  Eye,
  ShieldAlert,
  ArrowUpDown,
  Building2,
  RotateCcw,
  Sliders
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    complaints,
    bureaus,
    settings,
    updateSettings,
    reviewedAlertIds,
    markAlertReviewed,
    hasPermission
  } = useCaseTrack();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'OVERDUE' | 'APPROACHING' | 'ESCALATED'>('ALL');
  const [bureauFilter, setBureauFilter] = useState('ALL');
  const [showConfig, setShowConfig] = useState(false);
  const [approachingDaysInput, setApproachingDaysInput] = useState(settings.approachingDeadlineDays);
  const [escalationDaysInput, setEscalationDaysInput] = useState(settings.overdueEscalationDays);

  // Generate alerts from real records
  const allAlerts = useMemo(() => {
    const list: Array<{
      id: string;
      complaint: typeof complaints[0];
      category: 'OVERDUE' | 'APPROACHING' | 'ESCALATED';
      daysRemaining: number;
      age: number;
      urgencyScore: number;
      isReviewed: boolean;
    }> = [];

    complaints.forEach(c => {
      if (c.status === 'Resolved' || c.status === 'Closed') return;

      const daysRemaining = getDaysRemaining(c.deadlineDate);
      const age = getCaseAgeInDays(c.submissionDate);
      const isReviewed = reviewedAlertIds.includes(c.id);

      // Check Escalation Recommended (overdue > escalationDays)
      if (daysRemaining < -settings.overdueEscalationDays) {
        list.push({
          id: c.id,
          complaint: c,
          category: 'ESCALATED',
          daysRemaining,
          age,
          urgencyScore: 100 + Math.abs(daysRemaining),
          isReviewed
        });
      }
      // Check Overdue
      else if (daysRemaining < 0) {
        list.push({
          id: c.id,
          complaint: c,
          category: 'OVERDUE',
          daysRemaining,
          age,
          urgencyScore: 80 + Math.abs(daysRemaining),
          isReviewed
        });
      }
      // Check Approaching Deadline
      else if (daysRemaining <= settings.approachingDeadlineDays) {
        list.push({
          id: c.id,
          complaint: c,
          category: 'APPROACHING',
          daysRemaining,
          age,
          urgencyScore: 50 - daysRemaining,
          isReviewed
        });
      }
    });

    return list.sort((a, b) => b.urgencyScore - a.urgencyScore);
  }, [complaints, settings, reviewedAlertIds]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
      if (bureauFilter !== 'ALL' && a.complaint.bureauId !== bureauFilter) return false;
      return true;
    });
  }, [allAlerts, categoryFilter, bureauFilter]);

  const handleSaveConfig = () => {
    updateSettings({
      approachingDeadlineDays: Number(approachingDaysInput),
      overdueEscalationDays: Number(escalationDaysInput)
    });
    setShowConfig(false);
    alert('Deadline monitoring thresholds successfully updated.');
  };

  const overdueTotal = allAlerts.filter(a => a.category === 'OVERDUE' || a.category === 'ESCALATED').length;
  const approachingTotal = allAlerts.filter(a => a.category === 'APPROACHING').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Case Ageing & Deadline Monitoring
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
              {allAlerts.length} Active Alerts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time threshold surveillance of overdue complaints and approaching statutory review deadlines.
          </p>
        </div>

        {hasPermission('manage_settings') && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Configure Demo Deadlines</span>
          </button>
        )}
      </div>

      {/* Admin Threshold Configurator */}
      {showConfig && (
        <div className="p-5 bg-white rounded-xl shadow-md border border-blue-200 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Configure Demonstration Deadline Parameters
            </h3>
            <span className="text-[11px] text-slate-500">Administrator Privileges Enforced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                "Approaching Deadline" Warning Window (Days before target)
              </label>
              <input
                type="number"
                min={1}
                max={15}
                value={approachingDaysInput}
                onChange={e => setApproachingDaysInput(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">Default: 5 days</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                "Escalation Recommended" Lapsed Threshold (Days overdue)
              </label>
              <input
                type="number"
                min={3}
                max={30}
                value={escalationDaysInput}
                onChange={e => setEscalationDaysInput(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
              <span className="text-[11px] text-slate-400">Default: 7 days</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowConfig(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Update Parameters
            </button>
          </div>
        </div>
      )}

      {/* KPI Tally Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200">
          <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider flex items-center justify-between">
            <span>Critical Overdue</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-3xl font-black text-red-700 mt-2">{overdueTotal}</div>
          <p className="text-xs text-slate-500 mt-1">Exceeded target turnaround dates</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between">
            <span>Approaching Window</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-800 mt-2">{approachingTotal}</div>
          <p className="text-xs text-slate-500 mt-1">Due within {settings.approachingDeadlineDays} calendar days</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
            <span>Officer Acknowledged</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-2">{reviewedAlertIds.length}</div>
          <p className="text-xs text-slate-500 mt-1">Recorded audit acknowledgments</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'ALL'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Alert Categories ({allAlerts.length})
          </button>
          <button
            onClick={() => setCategoryFilter('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'OVERDUE'
                ? 'bg-red-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Overdue Only
          </button>
          <button
            onClick={() => setCategoryFilter('APPROACHING')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              categoryFilter === 'APPROACHING'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Approaching Only
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Bureau Filter:</span>
          <select
            value={bureauFilter}
            onChange={e => setBureauFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          >
            <option value="ALL">All Bureaus</option>
            {bureaus.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Urgency & Alert Type</th>
                <th className="py-3 px-4">Complaint ID & Institution</th>
                <th className="py-3 px-4">Assigned Bureau & Officer</th>
                <th className="py-3 px-4">Filing Date</th>
                <th className="py-3 px-4">Deadline Date</th>
                <th className="py-3 px-4 text-center">Days Delta</th>
                <th className="py-3 px-4 text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No Active Alerts</p>
                    <p className="text-xs text-slate-400 mt-1">All complaints conform with scheduled turnaround targets.</p>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map(alertItem => {
                  const c = alertItem.complaint;
                  const isEscalated = alertItem.category === 'ESCALATED';
                  const isOverdueCat = alertItem.category === 'OVERDUE';
                  const isApproachingCat = alertItem.category === 'APPROACHING';

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/case/${c.id}`)}
                    >
                      {/* Urgency Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isEscalated ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[11px] border border-rose-300">
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                            Escalation Urged
                          </span>
                        ) : isOverdueCat ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-800 font-bold text-[11px] border border-red-200">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold text-[11px] border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Approaching
                          </span>
                        )}
                      </td>

                      {/* Complaint ID & Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-mono font-bold text-blue-700">{c.id}</div>
                        <div className="font-semibold text-slate-900 truncate mt-0.5">{c.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{c.institutionName}</div>
                      </td>

                      {/* Bureau & Officer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{c.bureauName}</div>
                        <div className="text-[11px] text-slate-500">{c.assignedOfficerName}</div>
                      </td>

                      {/* Filed */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        {formatDate(c.submissionDate)}
                      </td>

                      {/* Deadline */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-800">
                        {formatDate(c.deadlineDate)}
                      </td>

                      {/* Delta Days */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {alertItem.daysRemaining < 0 ? (
                          <span className="font-black text-red-700">
                            +{Math.abs(alertItem.daysRemaining)} Days Late
                          </span>
                        ) : (
                          <span className="font-bold text-amber-800">
                            {alertItem.daysRemaining} Days Left
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/case/${c.id}`)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="Inspect Case"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {alertItem.isReviewed ? (
                            <span className="text-[11px] text-emerald-700 font-semibold px-2 py-1 rounded bg-emerald-50 border border-emerald-200">
                              Acknowledged
                            </span>
                          ) : (
                            <button
                              onClick={() => markAlertReviewed(c.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded shadow-xs transition-colors"
                            >
                              Acknowledge
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
      </div>
    </div>
  );
};
