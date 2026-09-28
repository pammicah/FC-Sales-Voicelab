import React, { useState } from 'react';
import { TraineeProfile, DEFAULT_TRAINEE_PROFILES, VOICE_OPTIONS } from '../data/homeaglowData.ts';
import { Sparkles, ShieldCheck, UserCheck, AlertCircle, ArrowRight, Play, Volume2, Info } from 'lucide-react';

interface Phase1IntakeGateProps {
  onSubmitIntake: (trainee: TraineeProfile) => void;
}

export const Phase1IntakeGate: React.FC<Phase1IntakeGateProps> = ({ onSubmitIntake }) => {
  const [traineeName, setTraineeName] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [waveBatch, setWaveBatch] = useState('');
  const [callType, setCallType] = useState<TraineeProfile['callType']>('Apex Lead');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Difficult'>('Intermediate');
  const [voiceName, setVoiceName] = useState('Kore');
  const [rawTextPaste, setRawTextPaste] = useState('');
  const [isRawMode, setIsRawMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parse raw text paste if trainee pastes intake bullet list
  const handleParseRawText = () => {
    if (!rawTextPaste.trim()) {
      setErrorMessage('Session locked. Please type and submit your required intake fields (Trainee Name, Trainer/Manager, and Batch Number) to continue.');
      return;
    }

    const nameMatch = rawTextPaste.match(/Trainee Full Name:?\s*([^\n\r*]+)/i);
    const trainerMatch = rawTextPaste.match(/Trainer\s*(?:\/\s*Manager)?\s*Name:?\s*([^\n\r*]+)/i);
    const waveMatch = rawTextPaste.match(/(?:Wave\s*(?:\/\s*Batch)?|Batch)\s*Number:?\s*([^\n\r*]+)/i);
    const callMatch = rawTextPaste.match(/Call Type:?\s*([^\n\r*]+)/i);
    const diffMatch = rawTextPaste.match(/Difficulty(?: Level)?:?\s*([^\n\r*]+)/i);

    const parsedName = nameMatch ? nameMatch[1].trim() : '';
    const parsedTrainer = trainerMatch ? trainerMatch[1].trim() : '';
    const parsedWave = waveMatch ? waveMatch[1].trim() : '';

    if (!parsedName || !parsedTrainer || !parsedWave) {
      setErrorMessage('Session locked. Please type and submit your required intake fields (Trainee Name, Trainer/Manager, and Batch Number) to continue.');
      return;
    }

    let determinedCallType: TraineeProfile['callType'] = 'Apex Lead';
    if (callMatch) {
      const cLower = callMatch[1].toLowerCase();
      if (cLower.includes('revisit')) determinedCallType = 'Revisit Lead';
      else if (cLower.includes('apex')) determinedCallType = 'Apex Lead';
      else if (cLower.includes('outbound')) determinedCallType = 'Outbound Lead Follow-Up';
      else if (cLower.includes('inbound')) determinedCallType = 'Inbound Promo Inquiry';
    }

    let determinedDiff: 'Beginner' | 'Intermediate' | 'Difficult' = 'Intermediate';
    if (diffMatch) {
      const lower = diffMatch[1].toLowerCase();
      if (lower.includes('difficult') || lower.includes('hard')) determinedDiff = 'Difficult';
      else if (lower.includes('beginner') || lower.includes('easy')) determinedDiff = 'Beginner';
    }

    setTraineeName(parsedName);
    setTrainerName(parsedTrainer);
    setWaveBatch(parsedWave);
    setCallType(determinedCallType);
    setDifficulty(determinedDiff);
    setErrorMessage(null);

    // Automatically trigger submission
    onSubmitIntake({
      name: parsedName,
      trainer: parsedTrainer,
      wave: parsedWave,
      callType: determinedCallType,
      difficulty: determinedDiff,
      voiceName,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!traineeName.trim() || !trainerName.trim() || !waveBatch.trim()) {
      setErrorMessage('Session locked. Please type and submit your required intake fields (Trainee Name, Trainer/Manager, and Batch Number) to continue.');
      return;
    }

    setErrorMessage(null);
    onSubmitIntake({
      name: traineeName.trim(),
      trainer: trainerName.trim(),
      wave: waveBatch.trim(),
      callType,
      difficulty,
      voiceName,
    });
  };

  const loadPreset = (preset: TraineeProfile) => {
    setTraineeName(preset.name);
    setTrainerName(preset.trainer);
    setWaveBatch(preset.wave);
    setCallType(preset.callType);
    setDifficulty(preset.difficulty);
    setVoiceName(preset.voiceName);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Official Greeting Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              PHASE 1 • Mandatory Trainee Plaintext Intake Gate
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Homeaglow Sales Simulator <span className="text-emerald-400 font-medium text-base ml-1">VoiceLab Edition</span>
            </h1>
          </div>
        </div>

        {/* Phase 1 Required Greeting Prompt Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 font-mono text-sm leading-relaxed mb-6">
          <p className="text-emerald-300 font-semibold mb-2">
            "Welcome to the Homeaglow Sales Practice Simulator. Before we begin, please paste and complete your trainee intake details below:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
            <li><strong className="text-slate-200">Trainee Full Name:</strong> [Required]</li>
            <li><strong className="text-slate-200">Trainer / Manager Name:</strong> [Required]</li>
            <li><strong className="text-slate-200">Wave / Batch Number:</strong> [Required]</li>
            <li><strong className="text-slate-200">Call Type:</strong> [Outbound Lead Follow-Up] or [Inbound Promo Inquiry]</li>
            <li><strong className="text-slate-200">Difficulty Level:</strong> [Beginner] | [Intermediate] | [Difficult]</li>
          </ul>
          <p className="mt-3 text-slate-400 italic text-xs">
            Submit this form in the chat to prepare your call line."
          </p>
        </div>

        {/* Gatekeeper Error Notification if incomplete */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 flex items-start gap-3 text-sm animate-pulse">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Gatekeeper Verification Required:</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Mode Toggle: Form Mode vs Raw Plaintext Paste Mode */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Input Method:</span>
            <button
              type="button"
              onClick={() => setIsRawMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !isRawMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Interactive Form
            </button>
            <button
              type="button"
              onClick={() => setIsRawMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isRawMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Paste Plaintext Form
            </button>
          </div>

          {/* Quick Presets for Rapid Testing */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Quick Fill:</span>
            {DEFAULT_TRAINEE_PROFILES.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p)}
                className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title={`Load ${p.name} (${p.difficulty})`}
              >
                {p.name.split(' ')[0]} ({p.difficulty[0]})
              </button>
            ))}
          </div>
        </div>

        {isRawMode ? (
          /* Plaintext Paste & Chat Submission */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                Paste Trainee Intake Details
              </label>
              <textarea
                value={rawTextPaste}
                onChange={(e) => setRawTextPaste(e.target.value)}
                placeholder={`Trainee Full Name: Alex Rivera\nTrainer / Manager Name: Sarah Jenkins\nWave / Batch Number: Wave 24-B\nCall Type: Apex Lead\nDifficulty Level: Intermediate`}
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setRawTextPaste(
                    `Trainee Full Name: Alex Rivera\nTrainer / Manager Name: Sarah Jenkins\nWave / Batch Number: Wave 24-B\nCall Type: Apex Lead\nDifficulty Level: Intermediate`
                  );
                }}
                className="text-xs text-emerald-400 hover:underline"
              >
                Insert Sample Template
              </button>

              <button
                type="button"
                onClick={handleParseRawText}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95"
              >
                Submit Intake & Ring Line <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Form Submission */
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Trainee Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={traineeName}
                  onChange={(e) => setTraineeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  Trainer / Manager Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={trainerName}
                  onChange={(e) => setTrainerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Wave / Batch Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wave 24-B"
                  value={waveBatch}
                  onChange={(e) => setWaveBatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Call Type
                </label>
                <select
                  value={callType}
                  onChange={(e) => setCallType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Apex Lead">APEX Lead (FCF V3)</option>
                  <option value="Revisit Lead">Revisit Lead (FCF V3)</option>
                  <option value="Inbound Promo Inquiry">Inbound Promo Inquiry</option>
                  <option value="Outbound Lead Follow-Up">Outbound Lead Follow-Up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Beginner">Beginner (Cooperative)</option>
                  <option value="Intermediate">Intermediate (Price-Conscious)</option>
                  <option value="Difficult">Difficult (Skeptical & Guarded)</option>
                </select>
              </div>
            </div>

            {/* Voice & Persona Selection */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-2 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Gemini Live Customer Voice Persona
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VOICE_OPTIONS.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVoiceName(v.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      voiceName === v.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-slate-200">{v.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {v.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{v.name.split('(')[1]?.replace(')', '')}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>Line will enter Phase 2 Standby upon submission</span>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Submit Intake & Start Scenario
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
