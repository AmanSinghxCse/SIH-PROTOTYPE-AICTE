import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaseTrack } from '../context/CaseTrackContext';
import { calculateRelatedness, MatchAnalysis } from '../utils/matchingEngine';
import { ScoreBadge } from '../components/common/Badge';
import { formatDate, formatDateTime } from '../utils/dateUtils';
import {
  GitCompare,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  RefreshCw,
  Info,
  HelpCircle,
  Cpu,
  Layers
} from 'lucide-react';

export const RelatedCasesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    complaints,
    relatedSuggestions,
    settings,
    updateSettings,
    confirmRelationship,
    rejectRelationship,
    hasPermission
  } = useCaseTrack();

  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'sandbox'>('pending');
  const [thresholdInput, setThresholdInput] = useState(settings.similarityThreshold);
  const [selectedCaseAId, setSelectedCaseAId] = useState<string>('AICTE-2026-COMP-104');
  const [selectedCaseBId, setSelectedCaseBId] = useState<string>('AICTE-2026-COMP-112');

  const pendingSuggestions = relatedSuggestions.filter(s => s.status === 'Pending Review');
  const confirmedSuggestions = relatedSuggestions.filter(s => s.status === 'Confirmed Related');

  // Case lookup for Sandbox
  const caseA = complaints.find(c => c.id === selectedCaseAId) || complaints[0];
  const caseB = complaints.find(c => c.id === selectedCaseBId) || complaints[1];

  // Live sandbox calculation
  const sandboxAnalysis: MatchAnalysis = calculateRelatedness(caseA, caseB);

  // Preset positive & negative pairs for judges
  const loadPositiveExample = () => {
    setSelectedCaseAId('AICTE-2026-COMP-104'); // Caution deposit non-refund
    setSelectedCaseBId('AICTE-2026-COMP-112'); // Caution fee withholding
  };

  const loadNegativeExample = () => {
    setSelectedCaseAId('AICTE-2026-COMP-101'); // Ragging in GTU hostel
    setSelectedCaseBId('AICTE-2026-COMP-105'); // Unapproved PGDM at Riverdale
  };

  const handleUpdateThreshold = () => {
    updateSettings({ similarityThreshold: Number(thresholdInput) });
    alert(`Matching threshold updated to ${thresholdInput}%. New suggestions will adhere to this minimum heuristic score.`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Explainable Related-Case Detection
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E5F1FC] text-[#0B477F] text-xs font-bold border border-[#D6E4F0]">
              Heuristic Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surfaces institutionally correlated or duplicate complaints using transparent signal scoring.
          </p>
        </div>

        {/* Threshold Configurator for Admins */}
        {hasPermission('manage_settings') && (
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-xs text-xs">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 font-medium">Detection Threshold:</span>
            <input
              type="number"
              min={30}
              max={95}
              value={thresholdInput}
              onChange={e => setThresholdInput(Number(e.target.value))}
              className="w-14 p-1 text-center font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded"
            />
            <span className="text-slate-400 font-bold">%</span>
            <button
              onClick={handleUpdateThreshold}
              className="px-2 py-1 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Methodology Banner */}
      <div className="p-4 bg-[#F1F7FC] border border-[#D6E4F0] rounded-xl text-xs text-[#17324D] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#0B477F] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-[#0B477F]">Explainability & Human-in-the-Loop Safeguards</div>
          <p className="leading-relaxed text-[#53677D]">
            This module uses a transparent weighted similarity scoring system across 4 distinct dimensions:
            <strong> Institution Identifier (40 pts)</strong>, <strong>Category Agreement (25 pts)</strong>,
            <strong> Semantic/Jaccard Keyword Overlap (30 pts)</strong>, and <strong>Filing Proximity (5 pts)</strong>.
            AICTE CaseTrack <em>never</em> automatically closes or merges complaints based on algorithm scores; official confirmation requires an authorized officer's affirmative review.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Review</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
            {pendingSuggestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('confirmed')}
          className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'confirmed'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Confirmed Related Records</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
            {confirmedSuggestions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'sandbox'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-[#0B477F]" />
          <span>Interactive Comparison Sandbox</span>
        </button>
      </div>

      {/* Tab: Pending Review */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingSuggestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">All Related-Case Suggestions Reviewed</div>
              <p>No unreviewed cross-case matches above {settings.similarityThreshold}% threshold.</p>
            </div>
          ) : (
            pendingSuggestions.map(sugg => {
              const cA = complaints.find(c => c.id === sugg.complaintId);
              const cB = complaints.find(c => c.id === sugg.relatedComplaintId);

              return (
                <div
                  key={sugg.id}
                  className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-blue-700">{sugg.complaintId}</span>
                      <span className="text-slate-400">↔</span>
                      <span className="font-mono text-sm font-bold text-blue-700">{sugg.relatedComplaintId}</span>
                      <ScoreBadge score={sugg.overallScore} />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/case/${sugg.complaintId}`)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <span>Open Primary File</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Comparative Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Case A */}
                    {cA && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="text-[10px] font-bold text-blue-700 uppercase">Primary Complaint ({cA.id})</div>
                        <div className="font-semibold text-slate-900">{cA.title}</div>
                        <p className="text-slate-600 line-clamp-3">{cA.description}</p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                          <span>{cA.institutionName}</span>
                          <span>Filed: {formatDate(cA.submissionDate)}</span>
                        </div>
                      </div>
                    )}

                    {/* Case B */}
                    {cB && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="text-[10px] font-bold text-[#0B477F] uppercase">Potentially Related ({cB.id})</div>
                        <div className="font-semibold text-slate-900">{cB.title}</div>
                        <p className="text-slate-600 line-clamp-3">{cB.description}</p>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                          <span>{cB.institutionName}</span>
                          <span>Filed: {formatDate(cB.submissionDate)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Match Signals Breakdown */}
                  <div className="p-3.5 bg-[#F1F7FC] rounded-xl border border-[#D6E4F0] space-y-2">
                    <div className="text-xs font-bold text-[#0B477F]">Computed Heuristic Signals:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {sugg.matchSignals.map((sig, idx) => (
                        <div key={idx} className="p-2 bg-white rounded border border-[#D6E4F0] text-[#17324D]">
                          {sig}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-[#53677D] pt-1 italic">
                      Analysis: {sugg.explanation}
                    </p>
                  </div>

                  {/* Officer Actions */}
                  {hasPermission('review_related') ? (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => rejectRelationship(sugg.id, 'Officer confirmed issues are distinct upon reviewing institutional filings.')}
                        className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-slate-400" />
                        <span>Mark Not Related</span>
                      </button>

                      <button
                        onClick={() => confirmRelationship(sugg.id, 'Officer verified systemic correlation between both cases.')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Related Case</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                      Officer or Administrator permissions required to confirm or reject relationships.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab: Confirmed Related */}
      {activeTab === 'confirmed' && (
        <div className="space-y-4">
          {confirmedSuggestions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              No cases currently marked as confirmed related.
            </div>
          ) : (
            confirmedSuggestions.map(sugg => (
              <div
                key={sugg.id}
                className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-blue-700">{sugg.complaintId}</span>
                    <span className="text-slate-400">↔</span>
                    <span className="font-mono text-sm font-bold text-blue-700">{sugg.relatedComplaintId}</span>
                    <ScoreBadge score={sugg.overallScore} />
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmed Related
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/case/${sugg.complaintId}`)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    View in Case File →
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <div className="text-slate-600 font-medium">Review Verification:</div>
                  <div className="text-slate-700">{sugg.reviewNotes || 'Confirmed by officer'}</div>
                  <div className="text-[11px] text-slate-400">
                    Decision logged by {sugg.reviewedBy} at {formatDateTime(sugg.reviewedAt)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Sandbox Comparator */}
      {activeTab === 'sandbox' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#0B477F]" />
                Algorithm Testing Sandbox for Judges
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Select any two complaints to inspect real-time heuristic calculations and explainable score breakdowns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadPositiveExample}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              >
                Preset Positive Pair
              </button>
              <button
                onClick={loadNegativeExample}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
              >
                Preset Negative Pair
              </button>
            </div>
          </div>

          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Case A
              </label>
              <select
                value={selectedCaseAId}
                onChange={e => setSelectedCaseAId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              >
                {complaints.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} • {c.institutionName} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Select Case B
              </label>
              <select
                value={selectedCaseBId}
                onChange={e => setSelectedCaseBId(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              >
                {complaints.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} • {c.institutionName} ({c.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Calculation Result Gauge */}
          <div className="p-6 bg-gradient-to-r from-[#064578] to-[#0B477F] text-white rounded-2xl shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#E5F1FC]">
                  Computed Heuristic Similarity Score
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-5xl font-black">{sandboxAnalysis.overallScore}%</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    sandboxAnalysis.overallScore >= 70
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : sandboxAnalysis.overallScore >= 45
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/10 text-[#E5F1FC] border border-white/20'
                  }`}>
                    {sandboxAnalysis.overallScore >= 70 ? 'High Correlation' : sandboxAnalysis.overallScore >= 45 ? 'Moderate Similarity' : 'Distinct Matters'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#E5F1FC] max-w-sm leading-relaxed">
                {sandboxAnalysis.explanation}
              </div>
            </div>

            {/* Score Component Breakdown Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-white/20 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-[#E5F1FC] mb-1">
                  <span>Institution Match</span>
                  <strong>{sandboxAnalysis.institutionMatchScore} / 40 pts</strong>
                </div>
                <div className="h-2 bg-[#064578] rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(sandboxAnalysis.institutionMatchScore / 40) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#E5F1FC] mb-1">
                  <span>Category Agreement</span>
                  <strong>{sandboxAnalysis.categoryMatchScore} / 25 pts</strong>
                </div>
                <div className="h-2 bg-[#064578] rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(sandboxAnalysis.categoryMatchScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#E5F1FC] mb-1">
                  <span>Semantic & Keyword</span>
                  <strong>{sandboxAnalysis.textSimilarityScore} / 30 pts</strong>
                </div>
                <div className="h-2 bg-[#064578] rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${(sandboxAnalysis.textSimilarityScore / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#E5F1FC] mb-1">
                  <span>Filing Proximity</span>
                  <strong>{sandboxAnalysis.dateProximityScore} / 5 pts</strong>
                </div>
                <div className="h-2 bg-[#064578] rounded-full overflow-hidden border border-white/20">
                  <div
                    className="h-full bg-[#E5F1FC] rounded-full"
                    style={{ width: `${(sandboxAnalysis.dateProximityScore / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Signal Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Itemized Explainable Signal Audit ({sandboxAnalysis.matchSignals.length})
            </h4>
            <div className="space-y-2 text-xs">
              {sandboxAnalysis.matchSignals.map((sig, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-slate-800">
                  <span>{sig}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
