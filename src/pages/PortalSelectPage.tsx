import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { UserRole } from '../types';
import {
  Users,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Lock,
  Building2
} from 'lucide-react';

interface PortalCardConfig {
  role: 'public' | 'admin' | 'officer';
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
    tagline: 'Student & Citizen Access',
    description: 'Register complaints, track complaint status, and view updates on submitted complaints.',
    demoUser: 'Ananya Sharma',
    demoDesignation: 'B.Tech Student & Complainant',
    icon: Users,
    features: [
      'Register a Complaint',
      'Track a Complaint',
      'My Complaints',
      'Complaint Status Timeline'
    ],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    buttonLabel: 'Enter Public Portal'
  },
  {
    role: 'admin',
    title: 'Administration Portal',
    hindiTitle: 'केंद्रीय प्रशासनिक पोर्टल',
    tagline: 'Central Control & Governance',
    description: 'Manage complaint records, assign cases to bureaus and officers, monitor progress, and oversee system operations.',
    demoUser: 'Shri Arvind Saxena',
    demoDesignation: 'Senior System Administrator & Nodal Incharge',
    icon: ShieldCheck,
    features: [
      'Administration Dashboard',
      'Complaint Registry',
      'Case Assignment',
      'Institution History',
      'Analytics and Reports',
      'User and Role Management'
    ],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    buttonLabel: 'Enter Administration Portal'
  },
  {
    role: 'officer',
    title: 'Bureau Officer Portal',
    hindiTitle: 'ब्यूरो अधिकारी कार्यस्थल',
    tagline: 'Active Inquiry & Investigation',
    description: 'Review assigned complaints, record actions, identify potentially related cases, and update case progress.',
    demoUser: 'Smt. Sunita Verma',
    demoDesignation: 'Assistant Director / Grievance Officer',
    icon: Briefcase,
    features: [
      'Assigned Complaints',
      'Complaint Details',
      'Case Intelligence',
      'Progress Updates',
      'Institution-Wise History',
      'Resolution Recommendations'
    ],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    buttonLabel: 'Enter Bureau Officer Portal'
  }
];

export const PortalSelectPage: React.FC = () => {
  const { currentUser, switchUserRole, isAuthenticated } = useCaseTrack();
  const [selectedRole, setSelectedRole] = useState<'public' | 'admin' | 'officer'>(
    currentUser.role === 'officer' || currentUser.role === 'bureau_officer' ? 'officer' : currentUser.role === 'admin' ? 'admin' : 'public'
  );
  const navigate = useNavigate();

  const handleSelectRole = (role: 'public' | 'admin' | 'officer') => {
    setSelectedRole(role);
  };

  const handleEnterPortal = (role: 'public' | 'admin' | 'officer') => {
    if (role === 'public') {
      switchUserRole('public');
      navigate('/portal/public');
    } else if (role === 'admin') {
      if (isAuthenticated && currentUser.role === 'admin') {
        navigate('/portal/admin');
      } else {
        navigate('/admin/login');
      }
    } else if (role === 'officer') {
      if (isAuthenticated && (currentUser.role === 'bureau_officer' || currentUser.role === 'officer')) {
        navigate('/portal/officer');
      } else {
        navigate('/officer/login');
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

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17324D] tracking-tight">
          Select Your Portal
        </h1>
        <p className="text-base text-[#53677D] mt-2 font-normal">
          Choose the portal that matches your role to access the appropriate complaint management services.
        </p>
      </div>

      {/* Exactly THREE large cards in a single row on desktop, stacking on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PORTALS.map(portal => {
          const Icon = portal.icon;
          const isSelected = selectedRole === portal.role;
          const isCurrentActive = currentUser.role === portal.role;

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
                  <span>Current Active</span>
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
                    <h3 className="text-xl font-bold text-[#17324D] leading-snug">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-[#53677D] font-medium">{portal.hindiTitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#53677D] leading-relaxed mb-6 min-h-[48px]">
                  {portal.description}
                </p>

                {/* Feature highlights */}
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Core Services:
                  </p>
                  <ul className="space-y-2 text-xs text-[#53677D]">
                    {portal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                    Authorized Demo Account:
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

      {/* Security and RBAC Notice Bar */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5F1FC] text-[#0B477F] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17324D]">
              Role-Based Security & Governance
            </h4>
            <p className="text-xs text-[#53677D]">
              Entering a portal verifies your role authorization. Public users cannot access administration records or officer dockets.
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
