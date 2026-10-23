import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import {
  Briefcase,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';

export const OfficerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, currentUser } = useCaseTrack();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAlreadyOfficer =
    isAuthenticated && (currentUser.role === 'bureau_officer' || currentUser.role === 'officer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await login(email, password, 'bureau_officer');
      if (result.success) {
        navigate('/portal/officer');
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#D6E4F0] overflow-hidden">
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-[#155A91] to-[#0B477F] text-white p-6 text-center relative">
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

          <span className="inline-block px-3 py-0.5 rounded-full bg-white/10 text-indigo-200 text-[10px] font-bold uppercase tracking-wider mb-1">
            Grievance Redressal Desk
          </span>
          <h2 className="text-xl font-black tracking-tight">AICTE Bureau Officer Sign In</h2>
          <p className="text-xs text-blue-100 mt-1">
            Dedicated portal for assigned cell officers & handling authorities
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          {isAlreadyOfficer ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center space-y-3">
              <p className="text-xs text-[#53677D]">
                You are currently signed in as <strong className="text-[#17324D]">{currentUser.name}</strong> ({currentUser.bureauName || 'Bureau Officer'}).
              </p>
              <button
                type="button"
                onClick={() => navigate('/portal/officer')}
                className="w-full py-2.5 px-4 bg-[#0B477F] text-white font-bold text-xs rounded-xl hover:bg-[#155A91] transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Bureau Officer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  Bureau Officer Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#53677D] absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="sverma.officer@aicte-demo.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D6E4F0] bg-[#F1F7FC] text-[#17324D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#17324D] mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#53677D] absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-[#D6E4F0] bg-[#F1F7FC] text-[#17324D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B477F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#53677D] hover:text-[#17324D]"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#0B477F] hover:bg-[#155A91] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Bureau Officer...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Bureau Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Demonstration Aid Notice */}
          <div className="pt-4 border-t border-[#D6E4F0] text-center space-y-2">
            <button
              type="button"
              onClick={handleFillDemoOfficer}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-[#0B477F]/40 bg-[#F1F7FC] hover:bg-[#E5F1FC] text-[#0B477F] text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Fill Demo Bureau Officer Credentials</span>
            </button>
            <p className="text-[11px] text-[#53677D]">
              Grievance Cell Demo: <span className="font-mono font-medium">sverma.officer@aicte-demo.gov.in</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F1F7FC] px-6 py-3 border-t border-[#D6E4F0] text-center text-[11px] text-[#53677D]">
          Scoped to Assigned Bureau Records &bull; AICTE CaseTrack SIH26264
        </div>
      </div>
    </div>
  );
};
