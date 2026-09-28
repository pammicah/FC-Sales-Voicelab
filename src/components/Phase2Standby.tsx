import React, { useState, useEffect } from 'react';
import { TraineeProfile } from '../data/homeaglowData.ts';
import { PhoneCall, Mic, Volume2, Sparkles, Send, BookOpen, ChevronDown } from 'lucide-react';

interface Phase2StandbyProps {
  trainee: TraineeProfile;
  onDeliverOpeningSpiel: (spielText?: string) => void;
  onOpenScriptDrawer: () => void;
}

export const Phase2Standby: React.FC<Phase2StandbyProps> = ({
  trainee,
  onDeliverOpeningSpiel,
  onOpenScriptDrawer,
}) => {
  const [typedSpiel, setTypedSpiel] = useState('');
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [showReferenceGuide, setShowReferenceGuide] = useState(false);
  const [ringCount, setRingCount] = useState(1);

  // Soft ringing pulse counter
  useEffect(() => {
    const timer = setInterval(() => {
      setRingCount((c) => (c % 4) + 1);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const sampleReferenceSpiel =
    trainee.callType === 'Inbound Promo Inquiry'
      ? `Thank you for calling Homeaglow, my name is ${trainee.name.split(' ')[0]}! How can I make your home sparkle today?`
      : `Hi, this is ${trainee.name.split(' ')[0]} with Homeaglow! I saw you were checking out our cleaning voucher promo online and wanted to ensure your discount was locked in before it expires.`;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
        {/* Ambient Ringing Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 bg-emerald-500/10 rounded-full animate-ping opacity-25"></div>
        </div>

        {/* Phase 2 Required Confirmation Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          PHASE 2 • Line Ringing & Strict Standby Gate
        </div>

        {/* The Exact Required Logged Text from Guidelines */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto shadow-inner">
          <p className="text-emerald-400 font-semibold mb-2">
            Logged: {trainee.name} | Trainer: {trainee.trainer} | Batch: {trainee.wave}.
          </p>
          <p className="text-slate-300">
            The line is ringing. Deliver your Homeaglow opening spiel whenever you are ready.
          </p>
        </div>

        {/* Ringing Visualizer */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg text-slate-950">
                <PhoneCall className="w-8 h-8 animate-bounce text-slate-950" />
              </div>
            </div>
            <span className="absolute -bottom-2 bg-slate-900 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow">
              RING {ringCount}...
            </span>
          </div>

          <div className="mt-6 space-y-1">
            <h2 className="text-xl font-bold text-white">Line Connected & Waiting in Silence</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              <strong className="text-emerald-300">Strict Standby Rule:</strong> The simulation waits in total silence for your opening spiel. Click below to open your mic and speak your greeting naturally.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => onDeliverOpeningSpiel()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2.5 transition-all transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-5 h-5 text-slate-950" />
            Connect Live Mic & Deliver Spiel
          </button>

          <button
            type="button"
            onClick={() => setShowTypeInput(!showTypeInput)}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {showTypeInput ? 'Hide Type Option' : 'Type Spiel Manually'}
          </button>
        </div>

        {/* Optional Typed Spiel input for manual entry */}
        {showTypeInput && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 max-w-xl mx-auto text-left">
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Deliver Your Custom Opening Spiel via Text
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedSpiel}
                onChange={(e) => setTypedSpiel(e.target.value)}
                placeholder="Type your Homeaglow greeting here..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={!typedSpiel.trim()}
                onClick={() => onDeliverOpeningSpiel(typedSpiel.trim())}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Deliver
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Script Reference Box (Optional Teleprompter) */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 max-w-xl mx-auto text-left">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowReferenceGuide(!showReferenceGuide)}
              className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Need inspiration? View sample opening script</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showReferenceGuide ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onOpenScriptDrawer}
              className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Call Flow Guide
            </button>
          </div>

          {showReferenceGuide && (
            <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                Approved Company Standard ({trainee.callType})
              </span>
              <p className="italic text-slate-200">"{sampleReferenceSpiel}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
