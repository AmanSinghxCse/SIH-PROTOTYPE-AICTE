import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { isApproachingDeadline, isOverdue } from '../../utils/dateUtils';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  GitCompare,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Info,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { complaints, relatedSuggestions, settings, currentUser } = useCaseTrack();

  const overdueCount = complaints.filter(c => isOverdue(c.deadlineDate, c.status)).length;
  const approachingCount = complaints.filter(c =>
    isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)
  ).length;
  const totalAlerts = overdueCount + approachingCount;

  const pendingRelatedCount = relatedSuggestions.filter(s => s.status === 'Pending Review').length;

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      to: '/registry',
      label: 'Complaint Registry',
      icon: FileText,
      badge: complaints.length.toString()
    },
    {
      to: '/register',
      label: 'Register Complaint',
      icon: PlusCircle,
      badge: 'New'
    },
    {
      to: '/institutions',
      label: 'Institutions',
      icon: Building2,
      badge: null
    },
    {
      to: '/related-cases',
      label: 'Related-Case Detection',
      icon: GitCompare,
      badge: pendingRelatedCount > 0 ? `${pendingRelatedCount} New` : null,
      badgeColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      to: '/alerts',
      label: 'Alerts & Deadlines',
      icon: AlertTriangle,
      badge: totalAlerts > 0 ? totalAlerts.toString() : null,
      badgeColor: 'bg-rose-100 text-rose-800 font-bold'
    },
    {
      to: '/analytics',
      label: 'Management Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      to: '/audit',
      label: 'Audit Trail',
      icon: ShieldCheck,
      badge: null
    },
    {
      to: '/about',
      label: 'About & Architecture',
      icon: Info,
      badge: 'SIH'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B192C] text-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-900/50">
            <Award className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">AICTE</span>
              <span className="font-semibold text-blue-400 text-base">CaseTrack</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              SIH26264 National Portal
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Core Modules
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-950 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Current Role Card & Disclaimer Footer */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2">
          <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold text-xs">
              {currentUser.role.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-blue-300 capitalize">{currentUser.role} Role</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center leading-relaxed">
            Prototype Demonstration • SIH26264
          </div>
        </div>
      </aside>
    </>
  );
};
