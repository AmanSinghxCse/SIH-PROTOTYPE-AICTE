import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Building2,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';

interface PortalCardConfig {
  role: 'public' | 'admin' | 'officials';
  title: string;
  hindiTitle: string;
  tagline: string;
  description: string;
  demoUser: string;
  demoDesignation: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  badgeColor: string;
  buttonLabel: string;
}

const PORTALS: PortalCardConfig[] = [
  {
    role: 'public',
    title: 'Public Portal',
    hindiTitle: 'नागरिक एवं छात्र पोर्टल',
    tagline: 'Student & Citizen Redressal Access',
    description: 'Submit grievances against technical institutions, track progress using statutory docket tokens, and provide requested clarifications.',
    demoUser: 'Ananya Sharma',
    demoDesignation: 'B.Tech Student & Complainant',
    icon: Users,
    features: [
      'Statutory Complaint Registration with Evidence Upload',
      'Instant Case Token Generation & Printable Receipt',
      'Real-Time Redressal Tracking (Token-Authenticated)',
      'Public-Safe Redressal Timeline & Clarification Response'
    ],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    buttonLabel: 'Enter Public Portal'
  },
  {
    role: 'admin',
    title: 'Administration Portal',
    hindiTitle: 'केंद्रीय प्रशासनिक नियंत्रण पोर्टल',
    tagline: 'System Control, Governance & Oversight Command',
    description: 'For authorized central administrators to configure, supervise, manage, and audit the complaint-management system, allocate cases, monitor SLAs, and sanction case closures.',
    demoUser: 'Shri Arvind Saxena',
    demoDesignation: 'Senior System Administrator & Nodal Incharge',
    icon: ShieldCheck,
    features: [
      '20 Statutory Interactive KPI Monitoring Cards',
      'Intelligent Case Allocation & Workload Balancing',
      'Staff User & Role Access Management (RBAC)',
      'Statutory SLA Policy, Escalation Rules & Extension Audits',
      'Data Quality Integrity Center & System Health Diagnostics',
      'Dedicated Administrative Redressal Lifecycle SOP'
    ],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    buttonLabel: 'Enter Administration Portal'
  },
  {
    role: 'officials',
    title: 'Government Officials Portal',
    hindiTitle: 'शासकीय अधिकारी एवं अन्वेषण पोर्टल',
    tagline: 'Operational Case Management & Desk Workspaces',
    description: 'For authorized government personnel and desk officers to process assigned responsibilities, examine evidence, dispatch college explanation directives, log rejoinders, and formulate resolution findings.',
    demoUser: 'Smt. Sunita Verma',
    demoDesignation: 'Assistant Director / Bureau Grievance Officer',
    icon: Briefcase,
    features: [
      'Operational Case Investigation Desk with 14 KPI Cards',
      'Statutory Institution Notice Dispatch (Stage 6) & Rejoinder Logging',
      'Citizen Clarification Directives & Evidence Requests',
      'Priority Follow-Up Tasks & Operational Hearing Reminders',
      'Formal Resolution Recommendation Formulation (Stage 8)',
      'Council Officer AI Case Assistant & Intelligence Engine'
    ],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    buttonLabel: 'Enter Government Officials Portal'
  }
];

export const PortalSelectPage: React.FC = () => {
  const { currentUser, switchUserRole, isAuthenticated } = useCaseTrack();
  const [selectedRole, setSelectedRole] = useState<'public' | 'admin' | 'officials'>(
    currentUser.role === 'admin' ? 'admin' : currentUser.role === 'public' ? 'public' : 'officials'
  );
  const navigate = useNavigate();

  const handleSelectRole = (role: 'public' | 'admin' | 'officials') => {
    setSelectedRole(role);
  };

  const handleEnterPortal = (role: 'public' | 'admin' | 'officials') => {
    if (role === 'public') {
      switchUserRole('public');
      navigate('/portal/public');
    } else if (role === 'admin') {
      if (isAuthenticated && currentUser.role === 'admin') {
        navigate('/portal/admin');
      } else {
        navigate('/admin/login');
      }
    } else {
      if (isAuthenticated && (currentUser.role === 'bureau_officer' || currentUser.role === 'officer' || currentUser.role === 'admin')) {
        navigate('/portal/officials');
      } else {
        navigate('/officials/login');
      }
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header section matching exact specification */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F1FC] border border-[#D6E4F0] text-[#0B477F] text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>Role-Based Access Control • AICTE CMIS</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#17324D] tracking-tight">
          Select Your Portal
        </h1>
        <p className="text-sm sm:text-base text-[#53677D] mt-2 font-normal">
          Choose your authorized portal to access grievance redressal and complaint monitoring services.
        </p>
      </div>

      {/* Three Dedicated Portals in Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {PORTALS.map(portal => {
          const Icon = portal.icon;
          const isSelected = selectedRole === portal.role;
          const isCurrentActive =
            portal.role === 'public'
              ? currentUser.role === 'public'
              : portal.role === 'admin'
              ? currentUser.role === 'admin'
              : currentUser.role === 'bureau_officer' || currentUser.role === 'officer';

          return (
            <div
              key={portal.role}
              onClick={() => handleSelectRole(portal.role)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectRole(portal.role);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              className={`relative rounded-2xl border p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#0B477F] focus:ring-offset-2 ${
                isSelected
                  ? 'bg-white border-[#0B477F] ring-2 ring-[#0B477F] shadow-xl'
                  : 'bg-white border-[#D6E4F0] hover:border-[#155A91] hover:shadow-md'
              }`}
            >
              {/* Active Badge */}
              {isCurrentActive && (
                <div className="absolute top-5 right-5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0B477F] text-white">
                  <span>Current Active Session</span>
                </div>
              )}

              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                      isSelected
                        ? 'bg-[#0B477F] text-white border-[#0B477F]'
                        : 'bg-[#F1F7FC] text-[#0B477F] border-[#D6E4F0]'
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${portal.badgeColor} mb-1`}>
                      {portal.tagline}
                    </span>
                    <h3 className="text-xl font-black text-[#17324D] leading-snug">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-[#53677D] font-medium">{portal.hindiTitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#53677D] leading-relaxed mb-6">
                  {portal.description}
                </p>

                {/* Feature highlights */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Core Services & Modules:
                  </p>
                  <ul className="space-y-2 text-xs text-[#53677D]">
                    {portal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="font-medium text-[#17324D]">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Demo user profile & Action CTA */}
              <div className="pt-5 border-t border-[#D6E4F0]">
                <div className="bg-[#F1F7FC] rounded-xl p-3 mb-4">
                  <div className="text-[10px] font-bold text-[#53677D] uppercase tracking-wider">
                    Authorized Demo Credentials:
                  </div>
                  <div className="text-xs font-bold text-[#17324D] truncate mt-0.5">
                    {portal.demoUser}
                  </div>
                  <div className="text-[11px] text-[#53677D] truncate">
                    {portal.demoDesignation}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnterPortal(portal.role);
                  }}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#0B477F] text-white hover:bg-[#155A91] shadow-md'
                      : 'bg-[#F1F7FC] text-[#0B477F] hover:bg-[#E5F1FC] border border-[#D6E4F0]'
                  }`}
                >
                  <span>{portal.buttonLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specialized Role Portals Strip */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-7xl mx-auto space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Additional Specialized Statutory Portals
            </span>
            <p className="text-xs text-slate-600">
              Direct access for Scrutiny Officers, Appellate Supervisors, and Council Executive Observers:
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 self-start">
            All 6 Portals Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate('/portal/verification')}
            className="p-3 bg-white border border-slate-200 hover:border-[#0B477F] rounded-xl text-left transition flex items-center justify-between group shadow-2xs"
          >
            <div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-[#0B477F]">
                4. Verification Staff Portal
              </div>
              <div className="text-[11px] text-slate-500">
                Prima facie scrutiny & evidence intake
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B477F] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/portal/supervisor')}
            className="p-3 bg-white border border-slate-200 hover:border-[#0B477F] rounded-xl text-left transition flex items-center justify-between group shadow-2xs"
          >
            <div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-[#0B477F]">
                5. Bureau Supervisor Portal
              </div>
              <div className="text-[11px] text-slate-500">
                Workload allocation & closure review
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B477F] shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/portal/management')}
            className="p-3 bg-white border border-slate-200 hover:border-[#0B477F] rounded-xl text-left transition flex items-center justify-between group shadow-2xs"
          >
            <div>
              <div className="font-bold text-xs text-slate-800 group-hover:text-[#0B477F]">
                6. Executive Management Portal
              </div>
              <div className="text-[11px] text-slate-500">
                Council oversight & compliance trends
              </div>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0B477F] shrink-0" />
          </button>
        </div>
      </div>

      {/* Security and RBAC Notice Bar */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5F1FC] text-[#0B477F] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17324D]">
              Role-Based Security & Integrated Bureau Operations
            </h4>
            <p className="text-xs text-[#53677D]">
              Government Officials portal combines central administrative supervision and bureau desk operations with strict, least-privilege role authorization.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleEnterPortal(selectedRole)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0B477F] text-white text-sm font-bold rounded-xl hover:bg-[#155A91] transition-all shadow-md shrink-0"
        >
          <span>Continue to Selected Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
