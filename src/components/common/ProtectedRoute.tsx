import React from 'react';
import { Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { UserRole } from '../../types';
import { ShieldAlert, ArrowLeft, KeyRound, ExternalLink } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { currentUser } = useCaseTrack();

  const isAuthorized = allowedRoles.includes(currentUser.role);

  if (isAuthorized) {
    return <>{children}</>;
  }

  const roleLabels: Record<UserRole, string> = {
    public: 'Public Portal',
    admin: 'Administration Portal',
    officer: 'Bureau Officer Portal',
    verification: 'Administration Portal (Verification)',
    supervisor: 'Administration Portal (Appellate)',
    management: 'Administration Portal (Analytics)'
  };

  const userPortalPath =
    currentUser.role === 'public'
      ? '/portal/public'
      : currentUser.role === 'officer'
      ? '/portal/officer'
      : '/portal/admin';

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md border border-[#D6E4F0] p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-amber-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Restricted Zone • RBAC Enforced
        </span>

        <h2 className="text-2xl font-bold text-[#17324D] mb-2">Portal Access Restricted</h2>
        
        <p className="text-[#53677D] text-sm leading-relaxed mb-6">
          Your active session profile <strong className="text-[#17324D]">"{currentUser.name}"</strong> is currently operating under the role: <span className="font-semibold text-[#0B477F] uppercase tracking-wide">[{currentUser.role}]</span>. 
          This route requires authorization for: <span className="font-semibold text-[#17324D]">{allowedRoles.join(' / ').toUpperCase()}</span>.
        </p>

        <div className="bg-[#F1F7FC] border border-[#D6E4F0] rounded-lg p-4 text-left text-xs text-[#53677D] mb-6 space-y-1.5">
          <div className="flex items-center gap-2 font-semibold text-[#0B477F]">
            <KeyRound className="w-4 h-4" />
            Security & Governance Standard
          </div>
          <p>
            AICTE CaseTrack maintains strict separation between Complainant personal data, Bureau inquiry files, Verification records, and Appellate decisions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={userPortalPath}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B477F] text-white text-sm font-semibold rounded-lg hover:bg-[#155A91] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to {roleLabels[currentUser.role]}
          </Link>
          <Link
            to="/portals"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#D6E4F0] text-[#17324D] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            Switch Active Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
