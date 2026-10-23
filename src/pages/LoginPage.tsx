import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';
import {
  ShieldCheck,
  Lock,
  Mail,
  Award,
  ArrowRight,
  UserCheck,
  Building2,
  Info
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchUserRole, currentUser } = useCaseTrack();

  const [email, setEmail] = useState('admin.saxena@aicte-demo.gov.in');
  const [password, setPassword] = useState('demo1234');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole(selectedRole);
    navigate(`/portal/${selectedRole}`);
  };

  const handleQuickLogin = (role: UserRole) => {
    switchUserRole(role);
    navigate(`/portal/${role}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <div className="bg-[#0B192C] text-white px-4 py-2 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400">SIH26264 Prototype</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">All India Council for Technical Education (AICTE)</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 text-[11px] border border-blue-700/50">
          DEMO ENVIRONMENT
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Left Hero Column */}
          <div className="bg-gradient-to-br from-[#0B192C] via-blue-950 to-slate-900 text-white p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
                <Award className="w-7 h-7 text-amber-300" />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight">AICTE CaseTrack</h2>
                <div className="text-blue-300 text-xs font-semibold uppercase tracking-wider mt-0.5">
                  Smart India Hackathon • SIH26264
                </div>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Centralized monitoring and tracking of institution-related complaint cases across AICTE Bureaus and Cells.
              </p>

              <div className="space-y-2 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Cross-bureau institutional dossier index</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Explainable heuristic duplicate detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Real-time statutory deadline surveillance</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
              Prototype developed for SIH26264 evaluation. Strictly uses fictional demonstration records.
            </div>
          </div>

          {/* Right Login Column */}
          <div className="p-8 space-y-6 flex flex-col justify-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sign In to CaseTrack</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose a pre-configured role to immediately test system permissions.
              </p>
            </div>

            {/* Quick Demo Role Cards */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Instant 1-Click Role Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_USERS.map(u => (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => handleQuickLogin(u.role)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                  >
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 capitalize">
                      {u.role}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">{u.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase font-semibold">Or Sign In Manually</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleManualLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Access Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Authority Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none"
                >
                  <option value="admin">Administrator (Full Access)</option>
                  <option value="officer">Bureau Officer (Case Handling)</option>
                  <option value="supervisor">Supervisor (Escalation Review)</option>
                  <option value="management">Management User (Read-only Analytics)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
              >
                <span>Authorize & Enter Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Prototype demonstration for Smart India Hackathon • SIH26264 • AICTE CaseTrack
      </footer>
    </div>
  );
};
