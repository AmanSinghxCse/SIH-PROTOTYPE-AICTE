import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCaseTrack } from '../../context/CaseTrackContext';
import { UserRole } from '../../types';
import { isApproachingDeadline, isOverdue } from '../../utils/dateUtils';
import {
  Search,
  Bell,
  PlayCircle,
  Sparkles,
  ChevronDown,
  Shield,
  RotateCcw,
  AlertTriangle,
  Clock,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  Home,
  LayoutDashboard,
  FileText,
  Building2,
  GitCompare,
  GitBranch,
  BarChart3,
  FileCheck2,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenGuidedTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenGuidedTour }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    switchUserRole,
    complaints,
    relatedSuggestions,
    settings,
    resetDemoData
  } = useCaseTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'EN' | 'HI'>('EN');

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Compute live notifications from database records
  const overdueComplaints = complaints.filter(c => isOverdue(c.deadlineDate, c.status));
  const approachingComplaints = complaints.filter(c =>
    isApproachingDeadline(c.deadlineDate, c.status, settings.approachingDeadlineDays)
  );
  const pendingSuggestions = relatedSuggestions.filter(s => s.status === 'Pending Review');
  const totalAlertCount = overdueComplaints.length + approachingComplaints.length + pendingSuggestions.length;

  // Search results
  const searchResults = searchQuery.trim()
    ? complaints
        .filter(c => {
          const q = searchQuery.toLowerCase();
          return (
            c.id.toLowerCase().includes(q) ||
            c.institutionName.toLowerCase().includes(q) ||
            c.institutionCode.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  const roles: Array<{ role: UserRole; label: string; desc: string; path: string }> = [
    { role: 'public', label: 'Public Portal', desc: 'Register complaints, track status, and view updates', path: '/portal/public' },
    { role: 'admin', label: 'Administration Portal', desc: 'Oversee allocations, registry, users & reports', path: '/portal/admin' },
    { role: 'officer', label: 'Bureau Officer Portal', desc: 'Review assigned complaints & update progress', path: '/portal/officer' }
  ];

  // Dynamic primaryNavItems based on role matching exact section 7 specifications
  const getNavItemsForRole = () => {
    switch (currentUser.role) {
      case 'public':
        return [
          { to: '/', label: 'Home', icon: Home },
          { to: '/register', label: 'Register Complaint', icon: PlusCircle },
          { to: '/portal/public', label: 'Track Complaint', icon: Search },
          { to: '/portal/public', label: 'My Complaints', icon: FileText }
        ];
      case 'officer':
        return [
          { to: '/portal/officer', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/portal/officer', label: 'Assigned Cases', icon: FileText, badge: complaints.filter(c => c.bureauId === (currentUser.bureauId || 'BUR-GRV')).length },
          { to: '/institutions', label: 'Institution History', icon: Building2 },
          { to: '/case-intelligence', label: 'Related Cases', icon: GitCompare, badge: pendingSuggestions.length > 0 ? pendingSuggestions.length : null },
          { to: '/portal/officer', label: 'Case Updates', icon: Clock }
        ];
      case 'admin':
      default:
        return [
          { to: '/portal/admin', label: 'Dashboard', icon: Shield },
          { to: '/registry', label: 'Complaint Registry', icon: FileText, badge: complaints.length },
          { to: '/portal/admin', label: 'Assignments', icon: UserCheck },
          { to: '/institutions', label: 'Institutions', icon: Building2 },
          { to: '/analytics', label: 'Analytics and Reports', icon: BarChart3 },
          { to: '/portal/admin', label: 'User Management', icon: LayoutDashboard },
          { to: '/audit', label: 'Audit History', icon: FileCheck2 }
        ];
    }
  };

  const primaryNavItems = getNavItemsForRole();

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md border-b border-[#D6E4F0]">
      {/* 1. Indian Government Top Sub-header Strip */}
      <div className="bg-[#064578] text-white py-1 text-[11px] border-b border-[#0B477F]/60">
        <div className="portal-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-amber-300">भारत सरकार | Government of India</span>
            <span className="text-white/40 hidden sm:inline">•</span>
            <span className="text-white/80 hidden sm:inline">Ministry of Education</span>
            <span className="text-white/40 hidden md:inline">•</span>
            <span className="text-[#E5F1FC] hidden md:inline font-mono">SIH26264 Prototype</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0B477F] text-[#E5F1FC] border border-white/20 text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DEMO MODE (Fictional Data)</span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Reset fictional sample database to default seed state?')) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1 text-white/80 hover:text-white hover:underline text-[11px] cursor-pointer"
              title="Restore fresh demonstration data"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center gap-1 text-xs font-semibold pl-2 border-l border-white/20">
              <button
                onClick={() => setSelectedLang('EN')}
                className={`px-1 rounded ${selectedLang === 'EN' ? 'text-amber-300 underline' : 'text-white/70 hover:text-white'}`}
              >
                English
              </button>
              <span className="text-white/40">|</span>
              <button
                onClick={() => setSelectedLang('HI')}
                className={`px-1 rounded ${selectedLang === 'HI' ? 'text-amber-300 underline' : 'text-white/70 hover:text-white'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Institutional Header (AICTE CMIS visual layout) */}
      <div className="bg-white border-b border-[#D6E4F0] py-2.5">
        <div className="portal-container flex items-center justify-between gap-4">
          {/* Left: AICTE Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            {/* AICTE Logo Emblem SVG */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B477F] to-[#064578] flex items-center justify-center text-white shadow-xs p-2 border-2 border-amber-400 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-amber-300" aria-label="AICTE Emblem">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" />
                <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" />
                <path d="M50 15 L53 30 L65 30 L55 38 L59 52 L50 44 L41 52 L45 38 L35 30 L47 30 Z" fill="#F59E0B" />
                <path d="M25 65 Q50 55 75 65 Q50 82 25 65 Z" fill="#FFFFFF" opacity="0.9" />
                <circle cx="50" cy="50" r="6" fill="#0B477F" />
              </svg>
            </div>

            <div>
              <div className="text-[11px] sm:text-xs font-semibold text-[#53677D] tracking-wide leading-tight">
                अखिल भारतीय तकनीकी शिक्षा परिषद
              </div>
              <div className="text-sm sm:text-base font-bold text-[#0B477F] tracking-tight leading-tight">
                ALL INDIA COUNCIL FOR TECHNICAL EDUCATION
              </div>
              <div className="text-[10px] text-[#53677D]">
                (A Statutory Body of the Govt. of India)
              </div>
            </div>
          </div>

          {/* Center: CMIS Title (Hidden on small mobile) */}
          <div className="hidden lg:flex flex-col items-center text-center px-4">
            <span className="text-[11px] font-semibold text-[#155A91] tracking-wider uppercase">
              Integrated Monitoring Platform
            </span>
            <span className="text-lg font-black text-[#17324D] tracking-tight">
              Complaint Management Information System (CMIS)
            </span>
            <span className="text-xs font-medium text-[#53677D]">
              Transparent • Accountable • Accessible
            </span>
          </div>

          {/* Right: National Emblems + Action Controls */}
          <div className="flex items-center gap-3">
            {/* Ashoka Emblem & G20 Graphic */}
            <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-[#D6E4F0]">
              <div className="text-right leading-tight">
                <div className="text-[10px] font-bold text-[#17324D]">G20 BHARAT</div>
                <div className="text-[9px] text-[#53677D]">2026</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F1F7FC] border border-[#D6E4F0] flex items-center justify-center font-bold text-[#0B477F] text-xs">
                G20
              </div>
            </div>

            {/* Select Portal Button */}
            <button
              onClick={() => navigate('/portals')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0B477F] bg-[#E5F1FC] hover:bg-[#D6E4F0] border border-[#D6E4F0] transition-colors"
              title="Open Role-Based Portal Selection"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0B477F]" />
              <span>Select Portal</span>
            </button>

            {/* SIH Demo Guided Button */}
            <button
              onClick={onOpenGuidedTour}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B477F] bg-[#E5F1FC] hover:bg-[#D6E4F0] border border-[#D6E4F0] transition-colors"
              title="Launch guided interactive demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Guided Tour</span>
            </button>

            {/* Presentation Mode */}
            <button
              onClick={() => navigate('/presentation')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0B477F] hover:bg-[#064578] shadow-xs transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>SIH Pitch</span>
            </button>

            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg text-[#53677D] hover:text-[#17324D] hover:bg-[#F1F7FC] border border-[#D6E4F0] transition-colors"
                title="System alerts & pending reviews"
              >
                <Bell className="w-4 h-4 text-[#0B477F]" />
                {totalAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C43D3D] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {totalAlertCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#D6E4F0] overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 bg-[#F1F7FC] border-b border-[#D6E4F0] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span className="text-xs font-bold text-[#17324D]">
                        Active Alerts ({totalAlertCount})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        navigate('/alerts');
                        setIsNotificationsOpen(false);
                      }}
                      className="text-[11px] text-[#0B477F] font-semibold hover:underline"
                    >
                      View All Alerts
                    </button>
                  </div>

                  <div className="divide-y divide-[#D6E4F0] max-h-80 overflow-y-auto text-xs">
                    {overdueComplaints.map(c => (
                      <div
                        key={`notif-overdue-${c.id}`}
                        onClick={() => {
                          navigate(`/case/${c.id}`);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-3 hover:bg-rose-50/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#C43D3D] flex items-center gap-1.5 text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C43D3D] animate-ping"></span>
                            Overdue Complaint
                          </span>
                          <span className="font-mono text-[11px] text-[#53677D]">{c.id}</span>
                        </div>
                        <div className="text-[#17324D] font-medium mt-0.5 line-clamp-1">{c.title}</div>
                        <div className="text-[#53677D] text-[11px] mt-0.5">{c.institutionName}</div>
                      </div>
                    ))}

                    {approachingComplaints.map(c => (
                      <div
                        key={`notif-app-${c.id}`}
                        onClick={() => {
                          navigate(`/case/${c.id}`);
                          setIsNotificationsOpen(false);
                        }}
                        className="p-3 hover:bg-amber-50/60 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#D97706] flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3 h-3 text-[#D97706]" />
                            Approaching Deadline
                          </span>
                          <span className="font-mono text-[11px] text-[#53677D]">{c.id}</span>
                        </div>
                        <div className="text-[#17324D] font-medium mt-0.5 line-clamp-1">{c.title}</div>
                        <div className="text-[#53677D] text-[11px] mt-0.5">Deadline: {c.deadlineDate}</div>
                      </div>
                    ))}

                    {pendingSuggestions.map(s => (
                      <div
                        key={`notif-sugg-${s.id}`}
                        onClick={() => {
                          navigate('/case-intelligence');
                          setIsNotificationsOpen(false);
                        }}
                        className="p-3 hover:bg-[#E5F1FC] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#0B477F] text-[11px]">
                            Related Case Match ({s.overallScore}%)
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5F1FC] text-[#0B477F] font-semibold border border-[#D6E4F0]">
                            Review
                          </span>
                        </div>
                        <div className="text-[#53677D] text-[11px] mt-1 line-clamp-1">
                          {s.complaintId} ↔ {s.relatedComplaintId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Active Demo Role Switcher Dropdown */}
            <div ref={roleRef} className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#D6E4F0] bg-[#F1F7FC] hover:bg-[#E5F1FC] transition-all text-left"
              >
                <div className="w-6 h-6 rounded-full bg-[#0B477F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-[#17324D] line-clamp-1 leading-tight">{currentUser.name}</div>
                  <div className="text-[10px] text-[#155A91] font-semibold uppercase tracking-wider">
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#53677D]" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#D6E4F0] overflow-hidden z-50 animate-fadeIn">
                  <div className="p-3 bg-[#F1F7FC] border-b border-[#D6E4F0]">
                    <div className="text-xs font-bold text-[#17324D]">Switch User Role</div>
                    <div className="text-[11px] text-[#53677D] mt-0.5">
                      Verify permissions and workflow restrictions per role.
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    {roles.map(r => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchUserRole(r.role);
                          navigate(r.path);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg transition-colors flex items-start gap-2.5 ${
                          currentUser.role === r.role
                            ? 'bg-[#E5F1FC] text-[#0B477F] border border-[#D6E4F0] font-semibold'
                            : 'hover:bg-[#F1F7FC] text-[#17324D]'
                        }`}
                      >
                        <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${currentUser.role === r.role ? 'text-[#0B477F]' : 'text-[#53677D]'}`} />
                        <div>
                          <div className="text-xs font-bold">{r.label}</div>
                          <div className="text-[11px] text-[#53677D] font-normal leading-tight">{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="p-2.5 bg-[#F1F7FC] border-t border-[#D6E4F0] flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        navigate('/portals');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="text-[#0B477F] font-bold hover:underline flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Select Portal</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setIsRoleDropdownOpen(false);
                      }}
                      className="text-[#53677D] font-medium hover:underline flex items-center gap-1"
                    >
                      <span>Role Specs</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#0B477F] hover:bg-[#F1F7FC] border border-[#D6E4F0]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Primary Dark-Navy Navigation Bar */}
      <nav className="bg-[#0B477F] text-white hidden lg:block border-b border-[#064578]">
        <div className="portal-container flex items-center justify-between">
          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-3 text-xs font-semibold tracking-wide border-b-2 transition-all cursor-pointer ${
                      isActive
                        ? 'border-amber-400 text-white bg-[#064578]'
                        : 'border-transparent text-[#E5F1FC] hover:text-white hover:bg-[#155A91]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 opacity-90" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-[#17324D] font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Quick Search & Register Complaint Action */}
          <div className="flex items-center gap-3 py-1.5">
            {/* Quick Search Input */}
            <div ref={searchRef} className="relative w-56">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search complaint ID..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#064578] border border-white/20 rounded-md text-white placeholder-white/50 focus:bg-[#064578]/80 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
              </div>

              {/* Search dropdown results */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-2xl border border-[#D6E4F0] overflow-hidden z-50 text-[#17324D]">
                  <div className="p-2 bg-[#F1F7FC] text-[11px] font-semibold text-[#53677D] border-b border-[#D6E4F0]">
                    Found {searchResults.length} matches
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="p-3 text-center text-xs text-[#53677D]">
                      No complaints matching query.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#D6E4F0] max-h-72 overflow-y-auto">
                      {searchResults.map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            navigate(`/case/${c.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2.5 hover:bg-[#E5F1FC] transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-[#0B477F]">{c.id}</span>
                            <span className="text-[10px] text-[#53677D]">{c.status}</span>
                          </div>
                          <div className="text-xs font-medium text-[#17324D] line-clamp-1">{c.title}</div>
                          <div className="text-[11px] text-[#53677D]">{c.institutionName}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Register Complaint CTA */}
            <NavLink
              to="/register"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md bg-white text-[#0B477F] hover:bg-[#E5F1FC] transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#0B477F]" />
              <span>Register Complaint</span>
            </NavLink>
          </div>
        </div>
      </nav>

      {/* 4. Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0B477F] text-white border-b border-[#064578] px-4 py-3 space-y-2 animate-fadeIn">
          {/* Mobile Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/registry?search=${encodeURIComponent(searchQuery)}`);
                  setIsMobileMenuOpen(false);
                }
              }}
              placeholder="Search complaint ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#064578] border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${
                      isActive ? 'bg-[#064578] text-white' : 'hover:bg-[#155A91] text-[#E5F1FC]'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-[#17324D] font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between gap-2">
            <NavLink
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg bg-white text-[#0B477F]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Complaint</span>
            </NavLink>
            <button
              onClick={() => {
                onOpenGuidedTour();
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-2 rounded-lg bg-[#064578] text-xs font-semibold text-white border border-white/20"
            >
              Demo Tour
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
