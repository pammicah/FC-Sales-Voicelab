import React, { useState } from 'react';
import { TraineeProfile } from '../data/homeaglowData.ts';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Copy,
  RotateCcw,
  UserPlus,
  Printer,
  Sparkles,
  TrendingUp,
  FileText,
  Check,
} from 'lucide-react';

export interface ScorecardData {
  reportText: string;
  scores: {
    opening: number;
    discovery: number;
    objection: number;
    closing: number;
    total: number;
    outcome: string;
  };
}

interface Phase4ScorecardProps {
  trainee: TraineeProfile;
  scorecard: ScorecardData | null;
  isLoading: boolean;
  closingLine?: string;
  onRetry: () => void;
  onNewScenario: () => void;
}

export const Phase4Scorecard: React.FC<Phase4ScorecardProps> = ({
  trainee,
  scorecard,
  isLoading,
  closingLine = 'Sounds good, thanks. Bye! [Line Disconnected]',
  onRetry,
  onNewScenario,
}) => {
  const [copied, setCopied] = useState(false);

  const rawReport =
    scorecard?.reportText ||
    `=========================================
HOMEAGLOW SALES PERFORMANCE AUDIT RECORD
=========================================
• Trainee Name: ${trainee.name}
• Trainer/Manager: ${trainee.trainer}
• Wave/Batch: ${trainee.wave}
• Call Type & Level: ${trainee.callType} | ${trainee.difficulty}
• Final Outcome: Booking Confirmed

--- PERFORMANCE SCORING (Based on Knowledge Call Flow) ---
1. Opening Spiel & Company Branding: 9/10
   - Coach Notes: Solid energy, immediately stated Homeaglow brand and promo reason for call.
2. Discovery & Home Scoping: 8/10
   - Coach Notes: Thoroughly scoped bedrooms, bathrooms, and square footage.
3. Objection Handling & Membership Transparency: 9/10
   - Coach Notes: Clear explanation of ForeverClean VIP rate ($18-$22/hr) vs. standard rates.
4. Closing Technique & Booking Confirmation: 9/10
   - Coach Notes: Assumed the close with alternative time slot options and confirmed arrival window.

TOTAL SCORE: 35/40 (87.5%)

--- COACHING ACTION ITEMS ---
• Key Strength: Confident and transparent tone during the ForeverClean membership explanation.
• Missed Opportunity: Could have specifically confirmed pet status earlier before quoting clean hours.
• Power Phrasing Fix:
  - Trainee Said: "You can just cancel whenever if you don't like it."
  - Recommended Script: "Your ForeverClean membership gives you full control in your dashboard to manage or pause anytime after your initial clean."

=========================================
Type "RETRY" to run this scenario again, or "NEW" for a new customer profile.`;

  const scores = scorecard?.scores || {
    opening: 9,
    discovery: 8,
    objection: 9,
    closing: 9,
    total: 35,
    outcome: 'Booking Confirmed',
  };

  const percentage = Math.round((scores.total / 40) * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (val: number) => {
    if (val >= 9) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 7) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      {/* Customer Disconnect Message in character */}
      <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">
            CALL
          </div>
          <div>
            <span className="text-xs text-slate-500 uppercase font-mono">Customer Closing Turn:</span>
            <p className="font-medium text-slate-200 italic">"{closingLine}"</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-rose-400 text-xs font-mono font-bold">
          [Line Disconnected]
        </span>
      </div>

      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">Analyzing Homeaglow Call Audit...</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Cross-referencing your pitch against the Official Homeaglow Call Flow & Objection Handling guidelines.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header & Overall Score summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4" />
                  PHASE 4 • Formal QA Performance Scorecard
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Sales Performance Audit Record
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Trainee: <strong className="text-slate-200">{trainee.name}</strong> • Wave:{' '}
                  <strong className="text-slate-200">{trainee.wave}</strong> • Trainer:{' '}
                  <strong className="text-slate-200">{trainee.trainer}</strong>
                </p>
              </div>

              {/* Total Score Badge */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase font-mono block">Final Outcome</span>
                  <span className="text-sm sm:text-base font-bold text-emerald-300">
                    {scores.outcome}
                  </span>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center shadow-inner">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    {scores.total}/40
                  </span>
                  <span className="text-xs text-emerald-300 block font-bold">
                    {percentage}% Passing
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Performance Scoring Criteria Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">1. Opening & Branding</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(scores.opening)}`}>
                    {scores.opening}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Opening energy, brand trust statement, and transition to discovery.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">2. Discovery & Scoping</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(scores.discovery)}`}>
                    {scores.discovery}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Beds, baths, sq footage, clean type, pets, and supplies.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">3. Membership Transparency</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(scores.objection)}`}>
                    {scores.objection}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Clear ForeverClean terms, VIP discount rate, and objection rebuttals.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-semibold">4. Closing & Booking</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(scores.closing)}`}>
                    {scores.closing}/10
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Assumed the close, secured calendar slot, and warm wrap-up.
                </p>
              </div>
            </div>

            {/* Raw Formatted Text Audit Block (Exact Prompt Specification) */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono uppercase text-slate-300 font-bold">
                    Official QA Audit Record (Plaintext Export)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied Record' : 'Copy Plaintext'}
                </button>
              </div>

              <pre className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-emerald-500/40">
                {rawReport}
              </pre>
            </div>

            {/* Bottom Actions: RETRY Scenario vs NEW Customer Profile */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-mono">
                Type or click <span className="text-emerald-400 font-bold">"RETRY"</span> to practice again, or{' '}
                <span className="text-teal-400 font-bold">"NEW"</span> for new profile.
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  RETRY (Same Setup)
                </button>

                <button
                  type="button"
                  onClick={onNewScenario}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  NEW Customer Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
