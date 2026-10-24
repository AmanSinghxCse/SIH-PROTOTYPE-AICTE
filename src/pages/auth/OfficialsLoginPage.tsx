import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  KeyRound,
  ArrowLeft,
  Briefcase
} from 'lucide-react';

export const OfficialsLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useCaseTrack();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as official, offer direct dashboard redirect
  const isAlreadyOfficial = isAuthenticated && (currentUser.role === 'admin' || currentUser.role === 'bureau_officer' || currentUser.role === 'officer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password, 'officials');
      if (result.success) {
        navigate('/portal/officials');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your official credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected authentication error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoOfficer = () => {
    setEmail('sverma.officer@aicte-demo.gov.in');
    setPassword('Officer@AICTE2026');
    setErrorMessage(null);
  };

  const handleFillDemoAdmin = () => {
    setEmail('admin.saxena@aicte-demo.gov.in');
    setPassword('Admin@AICTE2026');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#D6E4F0] overflow-hidden">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#064578] via-[#0B477F] to-[#155A91] text-white p-6 text-center relative">
          <Link
            to="/portals"
            className="absolute left-4 top-5 text-white/70 hover:text-white flex items-center gap-1 text-xs"
            title="Back to portal selection"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Portals</span>
          </Link>

          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Briefcase className="w-8 h-8 text-amber-300" />
          </div>

          <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-1">
            Council Operational Sector
          </span>
          <h2 className="text-xl font-black tracking-tight">Government Officials Portal</h2>
          <p className="text-xs text-blue-100 mt-1">
            Authorized sign-in for Bureau Desk Officers, Inquiry Leads & Standing Committee Incharges
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {isAlreadyOfficial ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center space-y-3">
              <p className="text-xs text-[#53677D]">
                You are currently signed in as <strong className="text-[#17324D]">{currentUser.name}</strong> ({currentUser.designation}).
              </p>
              <button
                type="button"
                onClick={() => navigate('/portal/officials')}
                className="w-full py-2.5 px-4 bg-[#0B477F] text-white font-bold text-xs rounded-xl hover:bg-[#155A91] transition-all flex items-center justify-center gap-2"
              >
                <span>Enter Government Officials Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Quick-fill Demo Account Button */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                  Quick Demo Access:
                </span>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleFillDemoOfficer}
                    className="w-full text-left p-2.5 bg-white border border-slate-200 hover:border-[#0B477F] rounded-lg transition-all flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-[#0B477F]">
                        Smt. Sunita Verma (Desk Grievance Officer)
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        sverma.officer@aicte-demo.gov.in
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0B477F] bg-blue-50 px-2 py-0.5 rounded">
                      Autofill
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFillDemoAdmin}
                    className="w-full text-left p-2.5 bg-white border border-slate-200 hover:border-[#0B477F] rounded-lg transition-all flex items-center justify-between text-xs group"
                  >
                    <div>
                      <div className="font-bold text-slate-800 group-hover:text-[#0B477F]">
                        Shri Arvind Saxena (Senior Administrator)
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        admin.saxena@aicte-demo.gov.in
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#0B477F] bg-blue-50 px-2 py-0.5 rounded">
                      Autofill
                    </span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17324D]">
                    Government Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@aicte-demo.gov.in"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#17324D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#17324D]">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-[#17324D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B477F]/20 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0B477F] hover:bg-[#155A91] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Officials Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs">
            <Link
              to="/admin/login"
              className="text-[#0B477F] font-semibold hover:underline"
            >
              Are you a Central System Administrator? Log in to Administration Portal &rarr;
            </Link>
            <Link
              to="/portal/public"
              className="text-slate-500 hover:text-slate-800"
            >
              Are you a Complainant? Open Public Complaint Tracking
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
