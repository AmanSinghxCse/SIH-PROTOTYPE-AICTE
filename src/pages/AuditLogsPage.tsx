import React, { useState, useMemo } from 'react';
import { useCaseTrack } from '../context/CaseTrackContext';
import { formatDateTime } from '../utils/dateUtils';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Lock,
  RotateCcw,
  Clock,
  UserCheck
} from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs, currentUser, hasPermission } = useCaseTrack();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterEntity, setFilterEntity] = useState('ALL');

  if (!hasPermission('view_audit')) {
    return (
      <div className="p-8 max-w-xl mx-auto bg-white rounded-2xl shadow-xs border border-slate-200 text-center space-y-4 animate-fadeIn my-12">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted: Insufficient Privileges</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          System audit logs contain administrative governance telemetry. In compliance with AICTE Data Protection & RTI Guidelines, access to the global audit trail is restricted to <strong>Administrators</strong> and <strong>Supervisory Authorities</strong>.
        </p>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
          Your current session role is: <strong className="text-slate-800 uppercase">{currentUser.role}</strong> ({currentUser.name})
        </div>
        <div className="text-[11px] text-slate-400">
          To inspect audit records in this prototype, switch to the <strong>Administrator</strong> or <strong>Supervisor</strong> role via the header role selector.
        </div>
      </div>
    );
  }

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          log.entityId.toLowerCase().includes(q) ||
          log.userName.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (filterAction !== 'ALL' && log.action !== filterAction) return false;
      if (filterEntity !== 'ALL' && log.entityType !== filterEntity) return false;

      return true;
    });
  }, [auditLogs, searchTerm, filterAction, filterEntity]);

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));
  const uniqueEntities = Array.from(new Set(auditLogs.map(l => l.entityType)));

  const handleExportAuditCSV = () => {
    const headers = ['Timestamp', 'Acting User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Details', 'Previous Value', 'New Value'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      `"${l.action}"`,
      l.entityType,
      l.entityId,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.previousValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(',')).join('\n')];
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aicte_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              System Audit Trail & Governance Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
              {auditLogs.length} Events Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tamper-evident recording of complaint creations, status mutations, assignments, and relationship confirmations.
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Immutable Event Logging Active</div>
            <div className="text-slate-400 text-[11px]">
              Every administrative and operational modification automatically binds the active session actor and timestamp.
            </div>
          </div>
        </div>
        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Active Auditor: {currentUser.name} ({currentUser.role.toUpperCase()})
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 bg-white rounded-xl shadow-xs border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search audit trail by actor, case ID, or keyword..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div>
          <select
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          >
            <option value="ALL">All Recorded Actions</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterEntity}
            onChange={e => setFilterEntity(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
          >
            <option value="ALL">All Entity Types</option>
            {uniqueEntities.map(ent => (
              <option key={ent} value={ent}>{ent}</option>
            ))}
          </select>
        </div>

        {(searchTerm || filterAction !== 'ALL' || filterEntity !== 'ALL') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAction('ALL');
              setFilterEntity('ALL');
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Reset
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Acting Officer</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity ID</th>
                <th className="py-3 px-4">Event Narrative</th>
                <th className="py-3 px-4 text-right">State Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-800">{log.userName}</div>
                    <div className="text-[10px] text-blue-700 font-bold uppercase">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-700 font-semibold whitespace-nowrap">
                    {log.entityId}
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">
                    {log.details}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.previousValue && log.newValue ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-slate-400 line-through">{log.previousValue}</span>
                        <span>→</span>
                        <span className="text-emerald-700 font-bold">{log.newValue}</span>
                      </span>
                    ) : log.newValue ? (
                      <span className="text-blue-700 font-medium">{log.newValue}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
