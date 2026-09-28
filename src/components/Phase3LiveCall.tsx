import React, { useState, useEffect, useRef } from 'react';
import { TraineeProfile } from '../data/homeaglowData.ts';
import { AudioWaveform } from './AudioWaveform.tsx';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Send,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  Radio,
  ChevronRight,
  Info,
} from 'lucide-react';

export interface ChatTurn {
  id: string;
  sender: 'trainee' | 'customer' | 'system';
  text: string;
  timestamp: string;
}

interface Phase3LiveCallProps {
  trainee: TraineeProfile;
  turns: ChatTurn[];
  micAnalyser: AnalyserNode | null;
  speakerAnalyser: AnalyserNode | null;
  isMicActive: boolean;
  isMuted: boolean;
  isCustomerSpeaking: boolean;
  isTranscribingAudio?: boolean;
  onToggleMute: () => void;
  onSendTextTurn: (text: string) => void;
  onEndCall: () => void;
  onOpenScriptDrawer: () => void;
  onRequestMicPermission?: () => void;
}

export const Phase3LiveCall: React.FC<Phase3LiveCallProps> = ({
  trainee,
  turns,
  micAnalyser,
  speakerAnalyser,
  isMicActive,
  isMuted,
  isCustomerSpeaking,
  isTranscribingAudio = false,
  onToggleMute,
  onSendTextTurn,
  onEndCall,
  onOpenScriptDrawer,
  onRequestMicPermission,
}) => {
  const [inputText, setInputText] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const turnsEndRef = useRef<HTMLDivElement | null>(null);

  // Discovery item checklist tracking
  const [checkedDiscovery, setCheckedDiscovery] = useState({
    bedBath: false,
    sqft: false,
    cleanType: false,
    pets: false,
    supplies: false,
  });

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat turns
  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, isTranscribingAudio]);

  // Auto-detect discovery questions in transcript
  useEffect(() => {
    const fullText = turns.map((t) => t.text.toLowerCase()).join(' ');
    setCheckedDiscovery({
      bedBath: fullText.includes('bedroom') || fullText.includes('bathroom') || fullText.includes('bed') || fullText.includes('bath'),
      sqft: fullText.includes('square') || fullText.includes('sq ft') || fullText.includes('feet') || fullText.includes('size'),
      cleanType: fullText.includes('deep clean') || fullText.includes('standard') || fullText.includes('maintenance') || fullText.includes('focus'),
      pets: fullText.includes('pet') || fullText.includes('dog') || fullText.includes('cat') || fullText.includes('animal'),
      supplies: fullText.includes('supplies') || fullText.includes('vacuum') || fullText.includes('mop') || fullText.includes('equipment'),
    });
  }, [turns]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendTextTurn(inputText.trim());
    setInputText('');
  };

  const toggleCheck = (key: keyof typeof checkedDiscovery) => {
    setCheckedDiscovery((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 sm:px-6">
      {/* Top Call Status Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        {/* Trainee & Call Info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow">
              HA
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{trainee.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                {trainee.wave}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  trainee.difficulty === 'Difficult'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    : trainee.difficulty === 'Intermediate'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {trainee.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {trainee.callType} • Customer Voice: <strong className="text-emerald-400">{trainee.voiceName}</strong>
            </p>
          </div>
        </div>

        {/* Live Call Timer & Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-emerald-400">{formatTimer(callDuration)}</span>
          </div>

          {/* Quick Teleprompter Button */}
          <button
            type="button"
            onClick={onOpenScriptDrawer}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Call Flow & Cheat Sheet</span>
            <span className="sm:hidden">Scripts</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={onEndCall}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
            title="End Call or say 'End call' / 'Wrap up'"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call & Audit</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Audio Waveform Stream + Live Transcript Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Active Audio State Strip (VoiceLab Engine) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Trainee Mic Status */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onToggleMute}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
                title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 animate-pulse" />}
              </button>
              <div>
                <span className="text-xs font-semibold text-slate-300 block flex items-center gap-1.5">
                  {isMuted ? 'Mic Muted' : 'You (Live Microphone)'}
                  {isMicActive && !isMuted && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isMicActive ? (isTranscribingAudio ? 'AI Listening & Transcribing...' : 'Active Audio Stream') : 'Mic Inactive'}
                </span>
              </div>
              <div className="flex-1 sm:w-36">
                <AudioWaveform analyser={micAnalyser} isActive={isMicActive && !isMuted} color="emerald" height={36} />
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-800"></div>

            {/* Customer Speaker Status */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-300 block">
                  {isCustomerSpeaking ? 'Customer Speaking...' : 'Customer (Listening)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isCustomerSpeaking ? 'Spoken Voice Response' : 'Waiting for Agent'}
                </span>
              </div>
              <div className="flex-1 sm:w-36">
                <AudioWaveform analyser={speakerAnalyser} isActive={isCustomerSpeaking} color="cyan" height={36} />
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  isCustomerSpeaking
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Transcript Feed Container */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[420px] max-h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Spoken Audio Transcript
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {isMicActive ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <Radio className="w-3 h-3 animate-pulse" />
                    Mic Listening
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onRequestMicPermission}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-mono cursor-pointer"
                  >
                    Enable Microphone
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Turn List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
              {turns.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                    <Mic className="w-6 h-6 text-emerald-400 animate-bounce" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">The line is ringing and waiting.</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Speak your Homeaglow opening greeting into your microphone now, or type in the box below.
                  </p>
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 max-w-md">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Speak naturally. When you pause, your turn is captured and the customer answers!</span>
                  </div>
                </div>
              ) : (
                turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${
                      turn.sender === 'trainee' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {turn.sender === 'trainee' ? trainee.name : 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">{turn.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        turn.sender === 'trainee'
                          ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-100 rounded-tr-sm'
                          : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-tl-sm'
                      }`}
                    >
                      <p>{turn.text}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Real-time speech transcription indicator */}
              {isTranscribingAudio && (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-emerald-400">{trainee.name} (Speaking)</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Processing speech...</span>
                  </div>
                </div>
              )}

              <div ref={turnsEndRef} />
            </div>

            {/* Trainee Spoken & Typed Turn Input Bar */}
            <form onSubmit={handleSendMessage} className="mt-3 pt-3 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Speak through your mic anytime, or type a turn here..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Live Coaching Tracker & Discovery Assistant */}
        <div className="flex flex-col gap-4">
          {/* Discovery Checklist Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Discovery Scoping (5 Pillars)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 font-mono">
                {Object.values(checkedDiscovery).filter(Boolean).length}/5 Complete
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Uncover key home parameters before quoting hours and voucher credits:
            </p>

            <div className="space-y-2.5">
              <div
                onClick={() => toggleCheck('bedBath')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checkedDiscovery.bedBath
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${checkedDiscovery.bedBath ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="text-xs font-medium">1. Bed & Bath Count</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Estimates hrs</span>
              </div>

              <div
                onClick={() => toggleCheck('sqft')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checkedDiscovery.sqft
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${checkedDiscovery.sqft ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="text-xs font-medium">2. Approx. Square Footage</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Under 1k / 2k+</span>
              </div>

              <div
                onClick={() => toggleCheck('cleanType')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checkedDiscovery.cleanType
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${checkedDiscovery.cleanType ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="text-xs font-medium">3. Clean Type & Focus Zones</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Oven/fridge/deep</span>
              </div>

              <div
                onClick={() => toggleCheck('pets')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checkedDiscovery.pets
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${checkedDiscovery.pets ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="text-xs font-medium">4. Pet Policy (Dogs/Cats)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Cleaner matching</span>
              </div>

              <div
                onClick={() => toggleCheck('supplies')}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  checkedDiscovery.supplies
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2
                    className={`w-4 h-4 ${checkedDiscovery.supplies ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="text-xs font-medium">5. Vacuum & Cleaning Supplies</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Kit brought or provided</span>
              </div>
            </div>
          </div>

          {/* Quick Objection Helpers & Rebuttal Prompts (Official FCF V3 ECOC) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-xl flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              FCF V3 Objection Rebuttals (E.C.O.C.)
            </h3>

            <div className="space-y-2.5">
              <details className="group bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                  <span>"Why do I need a membership?"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-800 pt-2">
                  <strong className="text-emerald-400">ECOC:</strong> "Totally fair! No one likes being stuck in something long-term. Are you concerned about being locked in, or just prefer to book as needed? With us, you can book whenever you want and manage your appointments anytime. It’s fast, flexible, and locks in $23/hr rates."
                </p>
              </details>

              <details className="group bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                  <span>"Already found another cleaner"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-800 pt-2">
                  <strong className="text-emerald-400">ECOC:</strong> "Totally understand. Are you completely locked in with them or more just trying them out for now? We’ve completed over 2.6M cleanings with 91.4% rated 4.5+ stars, so if you ever need a reliable backup or want to compare, we’d love to be that option."
                </p>
              </details>

              <details className="group bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                  <span>"Can I trust your cleaners?"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-800 pt-2">
                  <strong className="text-emerald-400">ECOC:</strong> "Every single cleaner undergoes multi-tier criminal and identity background checks. 91.4% of cleanings are done by 4.5+ star pros, and our work is backed by our Homeaglow Happiness Guarantee."
                </p>
              </details>

              <details className="group bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-xs cursor-pointer">
                <summary className="font-semibold text-slate-300 flex items-center justify-between list-none">
                  <span>"Need to consult spouse"</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-slate-400 text-[11px] leading-relaxed border-t border-slate-800 pt-2">
                  <strong className="text-emerald-400">ECOC:</strong> "Absolutely! Are you mostly wanting their go-ahead before scheduling, or just looping them in? Let's hold your spot tentatively on Saturday morning so you don't lose the voucher rate while you check in."
                </p>
              </details>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onOpenScriptDrawer}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Open Complete Call Flow Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
