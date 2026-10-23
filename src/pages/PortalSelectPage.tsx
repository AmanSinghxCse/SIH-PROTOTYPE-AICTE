import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { UserRole } from '../types';
import {
  UserCircle2,
  ShieldCheck,
  Briefcase,
  FileCheck2,
  Eye,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  Layers
} from 'lucide-react';

interface PortalCardConfig {
  role: UserRole;
  title: string;
  hindiTitle: string;
  tagline: string;
  description: string;
  demoUser: string;
  demoDesignation: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  badgeColor: string;
}

const PORTALS: PortalCardConfig[] = [
  {
    role: 'public',
    title: 'Public / Complainant',
    hindiTitle: 'नागरिक एवं छात्र पोर्टल',
    tagline: 'Student & Citizen Access',
    description: 'Register complaints, track progress, and view updates in a secure and accessible portal.',
    demoUser: 'Ananya Sharma',
    demoDesignation: 'B.Tech Student & Complainant',
    icon: UserCircle2,
    features: ['Instant Grievance Registration', 'Token-Based Status Tracking', 'Direct Response to Queries'],
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    role: 'admin',
    title: 'Administration',
    hindiTitle: 'केंद्रीय प्रशासनिक पोर्टल',
    tagline: 'Central Control & Governance',
    description: 'Manage users, oversee complaint allocation across bureaus, and configure system operations.',
    demoUser: 'Shri Arvind Saxena',
    demoDesignation: 'Senior System Administrator & Nodal Incharge',
    icon: ShieldCheck,
    features: ['Inter-Bureau Workload Balancing', 'Officer Re-assignment & SLA Config', 'System Audit Trail & Security'],
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    role: 'officer',
    title: 'Bureau Officer',
    hindiTitle: 'ब्यूरो अधिकारी कार्यस्थल',
    tagline: 'Active Inquiry & Investigation',
    description: "Review and process complaints assigned to the officer's designated bureau or cell.",
    demoUser: 'Smt. Sunita Verma',
    demoDesignation: 'Assistant Director / Grievance Officer',
    icon: Briefcase,
    features: ['Active Inquiry Management', 'Hearing & Investigation Notes', 'Related Case Correlations'],
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  },
  {
    role: 'verification',
    title: 'Verification Staff',
    hindiTitle: 'दस्तावेज़ एवं संस्थान जांच',
    tagline: 'Document Scrutiny & Ingestion',
    description: 'Validate complaint details, verify institution information, and flag incomplete submissions.',
    demoUser: 'Shri Rameshwar Nath',
    demoDesignation: 'Senior Verification Officer & Scrutiny Lead',
    icon: FileCheck2,
    features: ['AICTE Permanent ID Verification', 'Mandatory Document Validation', 'Duplicate & Defect Flagging'],
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    role: 'supervisor',
    title: 'Supervisor',
    hindiTitle: 'अपीलीय एवं पर्यवेक्षी प्राधिकारी',
    tagline: 'Appellate Oversight & Quality Control',
    description: 'Monitor case progress, review escalations, approve closures, and evaluate team actions.',
    demoUser: 'Dr. P. K. Nambiar',
    demoDesignation: 'Director & Appellate Review Authority',
    icon: Eye,
    features: ['Closure Sign-off & Remand', 'Overdue Case Escalation Directives', 'Supervisory Interventions'],
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    role: 'management',
    title: 'Management User',
    hindiTitle: 'कार्यकारी प्रबंधन एवं नीति समीक्षा',
    tagline: 'Executive Analytics & Policy Insights',
    description: 'Access high-level analytics, systemic patterns, bureau performance, and policy-level summaries.',
    demoUser: 'Prof. M. S. Ramachandran',
    demoDesignation: 'Advisor & Executive Management Observer',
    icon: BarChart3,
    features: ['Privacy-Preserved Aggregated Trends', 'Bureau Turnaround Benchmarks', 'Policy Defect Pattern Analysis'],
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200'
  }
];

export const PortalSelectPage: React.FC = () => {
  const { currentUser, switchUserRole } = useCaseTrack();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const navigate = useNavigate();

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleEnterPortal = (role: UserRole) => {
    switchUserRole(role);
    navigate(`/portal/${role}`);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F1FC] border border-[#D6E4F0] text-[#0B477F] text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5" />
          <span>Role-Based Operational Access • SIH26264 Prototype</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17324D] tracking-tight">
          Select Your Portal
        </h1>
        <p className="text-base text-[#53677D] mt-2 font-normal">
          Choose your role to access the appropriate complaint management services.
        </p>
        <p className="text-xs text-[#53677D] mt-1 italic">
          (प्रत्येक भूमिका के लिए अलग डैशबोर्ड, अनुमतियां और कार्यप्रणाली उपलब्ध हैं)
        </p>
      </div>

      {/* Grid of 6 Role Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
              className={`relative rounded-xl border p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between text-left focus:outline-none focus:ring-2 focus:ring-[#0B477F] focus:ring-offset-2 ${
                isSelected
                  ? 'bg-white border-[#0B477F] ring-2 ring-[#0B477F] shadow-lg'
                  : 'bg-white border-[#D6E4F0] hover:border-[#155A91] hover:shadow-md'
              }`}
            >
              {/* Active Badge */}
              {isCurrentActive && (
                <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B477F] text-white">
                  <span>Current Active</span>
                </div>
              )}

              <div>
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-[#0B477F] text-white border-[#0B477F]'
                        : 'bg-[#F1F7FC] text-[#0B477F] border-[#D6E4F0]'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${portal.badgeColor} mb-1`}>
                      {portal.tagline}
                    </span>
                    <h3 className="text-lg font-bold text-[#17324D] leading-snug">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-[#53677D] font-medium">{portal.hindiTitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-[#53677D] leading-relaxed mb-4">
                  {portal.description}
                </p>

                {/* Feature highlights */}
                <div className="space-y-2 mb-5">
                  <p className="text-xs font-bold text-[#17324D] uppercase tracking-wider">
                    Core Capabilities:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#53677D]">
                    {portal.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Demo user profile & Action CTA */}
              <div className="pt-4 border-t border-[#D6E4F0]">
                <div className="bg-[#F1F7FC] rounded-lg p-2.5 mb-3">
                  <div className="text-[11px] font-semibold text-[#53677D] uppercase tracking-wider">
                    Demo Identity:
                  </div>
                  <div className="text-xs font-bold text-[#17324D] truncate">
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
                  className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#0B477F] text-white hover:bg-[#155A91] shadow'
                      : 'bg-[#F1F7FC] text-[#0B477F] hover:bg-[#E5F1FC] border border-[#D6E4F0]'
                  }`}
                >
                  <span>Enter {portal.title} Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary Continue Bar */}
      <div className="bg-white rounded-xl border border-[#D6E4F0] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E5F1FC] text-[#0B477F] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#17324D]">
              Role-Based Access Control (RBAC) Notice
            </h4>
            <p className="text-xs text-[#53677D]">
              Switching portals sets your active simulated identity, navigation menu, and data clearance level.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleEnterPortal(selectedRole)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0B477F] text-white text-sm font-bold rounded-lg hover:bg-[#155A91] transition-all shadow-md shrink-0"
        >
          <span>Continue to Selected Portal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
