/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TraineeProfile, DEFAULT_TRAINEE_PROFILES } from './data/homeaglowData.ts';
import { Phase1IntakeGate } from './components/Phase1IntakeGate.tsx';
import { Phase2Standby } from './components/Phase2Standby.tsx';
import { Phase3LiveCall, ChatTurn } from './components/Phase3LiveCall.tsx';
import { Phase4Scorecard, ScorecardData } from './components/Phase4Scorecard.tsx';
import { ScriptDrawer } from './components/ScriptDrawer.tsx';
import { LiveAudioPlayer, LiveAudioRecorder, SpeechRecognizer } from './utils/audioStreamer.ts';
import { Sparkles, BookOpen, Volume2, ShieldCheck, Activity } from 'lucide-react';

export default function App() {
  // Current Phase: 1 (Intake Gate), 2 (Standby), 3 (Live Simulation), 4 (Scorecard)
  const [currentPhase, setCurrentPhase] = useState<1 | 2 | 3 | 4>(1);

  // Active Trainee & Session setup
  const [trainee, setTrainee] = useState<TraineeProfile>(DEFAULT_TRAINEE_PROFILES[0]);

  // Call turns (spoken transcript & text)
  const [turns, setTurns] = useState<ChatTurn[]>([]);

  // Audio stream state
  const [isMicActive, setIsMicActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCustomerSpeaking, setIsCustomerSpeaking] = useState(false);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);
  const [customerClosingLine, setCustomerClosingLine] = useState('Sounds good, thanks. Bye! [Line Disconnected]');

  // Teleprompter / Reference drawer
  const [isScriptDrawerOpen, setIsScriptDrawerOpen] = useState(false);

  // Scorecard evaluation state
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null);
  const [isScoringLoading, setIsScoringLoading] = useState(false);

  // Simulation mode: WebSocket or intelligent Voice Engine fallback
  const [useVoiceFallback, setUseVoiceFallback] = useState(true);

  // Audio References
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const audioRecorderRef = useRef<LiveAudioRecorder | null>(null);
  const speechRecognizerRef = useRef<SpeechRecognizer | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const turnsRef = useRef<ChatTurn[]>([]);
  const isCustomerSpeakingRef = useRef<boolean>(false);

  // Keep turnsRef in sync for async callbacks
  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    isCustomerSpeakingRef.current = isCustomerSpeaking;
  }, [isCustomerSpeaking]);

  // Clean up audio & websocket on unmount
  useEffect(() => {
    return () => {
      if (speechRecognizerRef.current) speechRecognizerRef.current.stop();
      if (audioRecorderRef.current) audioRecorderRef.current.stop();
      if (audioPlayerRef.current) audioPlayerRef.current.close();
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Initialize or retrieve LiveAudioPlayer
  const getAudioPlayer = () => {
    if (!audioPlayerRef.current) {
      const player = new LiveAudioPlayer();
      player.onPlaybackStart = () => setIsCustomerSpeaking(true);
      player.onPlaybackEnd = () => setIsCustomerSpeaking(false);
      audioPlayerRef.current = player;
    }
    return audioPlayerRef.current;
  };

  // Check if spoken phrase is a manual call termination command
  const isTerminationCommand = (text: string) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('end call') ||
      lower.includes('end scenario') ||
      lower.includes('wrap up') ||
      lower.includes('cut scenario') ||
      lower.includes('cut the call') ||
      lower.includes('hang up')
    );
  };

  // Phase 1 -> Phase 2: Trainee submits intake details
  const handleIntakeSubmit = (profile: TraineeProfile) => {
    setTrainee(profile);
    setTurns([]);
    setCurrentPhase(2);
  };

  // Dispatch customer response turn via HTTP Voice Engine
  const dispatchCustomerVoiceTurn = async (
    userMessage: string,
    currentHistory: ChatTurn[],
    currentProfile: TraineeProfile
  ) => {
    try {
      setIsCustomerSpeaking(true);

      const res = await fetch('/api/voice-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainee: currentProfile,
          history: currentHistory,
          message: userMessage,
          voiceName: currentProfile.voiceName || 'Kore',
        }),
      });

      const data = await res.json();
      if (data.reply) {
        const custTurn: ChatTurn = {
          id: 'cust-' + Math.random().toString(36).substring(2, 9),
          sender: 'customer',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setTurns((prev) => [...prev, custTurn]);

        // Play audio through Web Audio Player with animated waveform
        if (data.audio) {
          const player = getAudioPlayer();
          await player.playAudioData(data.audio);
        } else {
          // Simulated spoken duration if audio was empty
          setTimeout(() => setIsCustomerSpeaking(false), 2500);
        }

        // If termination condition was triggered by user message or model
        if (data.isTerminated || isTerminationCommand(userMessage)) {
          setCustomerClosingLine(data.reply);
          setTimeout(() => {
            triggerCallTermination([...currentHistory, custTurn], currentProfile);
          }, 1200);
        }
      } else {
        setIsCustomerSpeaking(false);
      }
    } catch (err) {
      console.warn('[Simulation] Voice turn notice:', err);
      setIsCustomerSpeaking(false);
    }
  };

  // Direct Audio Transcription via Gemini 3.5 Transcribe
  const handleAudioSegmentTranscribe = async (base64Wav: string) => {
    // If customer is currently speaking or we are not in live call, ignore
    if (isCustomerSpeakingRef.current || currentPhase !== 3) return;

    try {
      setIsTranscribingAudio(true);
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioData: base64Wav,
          mimeType: 'audio/wav',
        }),
      });

      const data = await res.json();
      if (data.success && data.transcript && data.transcript.trim()) {
        const cleaned = data.transcript.trim();
        // Avoid duplicate triggers
        const lastTurn = turnsRef.current[turnsRef.current.length - 1];
        if (!lastTurn || lastTurn.text.trim().toLowerCase() !== cleaned.toLowerCase()) {
          handleSendTextTurn(cleaned);
        }
      }
    } catch (err) {
      console.warn('[Transcribe Audio Segment] Error:', err);
    } finally {
      setIsTranscribingAudio(false);
    }
  };

  // Start live session WebSocket with Gemini 3.8 Live API (with immediate graceful fallback)
  const startLiveWebSocket = useCallback(
    (profile: TraineeProfile, initialTurnText?: string) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live`;

        console.info('[Live WS] Connecting to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        const player = getAudioPlayer();

        // 2-second timeout to fall back cleanly if WebSocket handshake is dropped by cloud proxy
        const wsTimeout = setTimeout(() => {
          if (ws.readyState !== WebSocket.OPEN) {
            console.info('[Live Engine] Activating resilient Voice Engine pipeline.');
            setUseVoiceFallback(true);
            if (initialTurnText) {
              dispatchCustomerVoiceTurn(initialTurnText, [], profile);
            }
          }
        }, 1800);

        ws.onopen = () => {
          clearTimeout(wsTimeout);
          console.info('[Live WS] Session connected');
          setUseVoiceFallback(false);
          ws.send(
            JSON.stringify({
              type: 'init',
              trainee: profile,
              voiceName: profile.voiceName || 'Kore',
            })
          );

          if (initialTurnText) {
            ws.send(
              JSON.stringify({
                type: 'text',
                text: initialTurnText,
              })
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);

            if (msg.type === 'ready') {
              console.info('[Live WS] Session ready');
            } else if (msg.type === 'audio' && msg.audio) {
              setIsCustomerSpeaking(true);
              player.playPcmChunk(msg.audio);
            } else if (msg.type === 'transcription') {
              const speaker = msg.speaker === 'trainee' ? 'trainee' : 'customer';
              const text = msg.text;

              if (speaker === 'customer') {
                if (text.includes('[Line Disconnected]') || text.includes('Disconnected')) {
                  setCustomerClosingLine(text);
                }
              }

              setTurns((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.sender === speaker) {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...last,
                    text: `${last.text} ${text}`.trim(),
                  };
                  return updated;
                } else {
                  return [
                    ...prev,
                    {
                      id: Math.random().toString(),
                      sender: speaker,
                      text,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ];
                }
              });

              if (speaker === 'trainee' && isTerminationCommand(text)) {
                handleEndCall();
              }
            } else if (msg.type === 'turnComplete') {
              setIsCustomerSpeaking(false);
            } else if (msg.type === 'interrupted') {
              setIsCustomerSpeaking(false);
              player.stopAndClear();
            }
          } catch {
            // ignore
          }
        };

        ws.onerror = () => {
          clearTimeout(wsTimeout);
          console.info('[Live Engine] WebSocket unavailable in current sandbox proxy. Using Voice Engine.');
          setUseVoiceFallback(true);
          try {
            ws.close();
          } catch {
            // ignore
          }
          if (initialTurnText) {
            dispatchCustomerVoiceTurn(initialTurnText, [], profile);
          }
        };

        ws.onclose = () => {
          clearTimeout(wsTimeout);
          setIsCustomerSpeaking(false);
        };
      } catch {
        setUseVoiceFallback(true);
        if (initialTurnText) {
          dispatchCustomerVoiceTurn(initialTurnText, [], profile);
        }
      }
    },
    []
  );

  // Initialize and start audio recording & recognition
  const initMicrophoneStream = async () => {
    try {
      if (!audioRecorderRef.current) {
        audioRecorderRef.current = new LiveAudioRecorder(
          (base64Pcm) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !useVoiceFallback) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'audio',
                  audio: base64Pcm,
                })
              );
            }
          },
          (base64Wav) => {
            // Continuous Voice capture with Gemini 3.5 Transcribe
            handleAudioSegmentTranscribe(base64Wav);
          }
        );
      }
      await audioRecorderRef.current.start();
      setIsMicActive(true);
    } catch (err) {
      console.warn('[Microphone] Access notice:', err);
      setIsMicActive(false);
    }

    // Also run browser Web Speech Recognition for instant local transcription
    try {
      if (!speechRecognizerRef.current) {
        speechRecognizerRef.current = new SpeechRecognizer((recognizedText, isFinal) => {
          if (isFinal && recognizedText.trim()) {
            handleSendTextTurn(recognizedText.trim());
          }
        });
      }
      if (speechRecognizerRef.current.isAvailable()) {
        speechRecognizerRef.current.start();
      }
    } catch {
      // ignore
    }
  };

  // Phase 2 -> Phase 3: Trainee delivers opening spiel
  const handleDeliverOpeningSpiel = async (typedSpiel?: string) => {
    setCurrentPhase(3);

    // Initialize player audio context with user gesture
    getAudioPlayer();

    // Start microphone recording for live visualizer & speech input
    await initMicrophoneStream();

    if (typedSpiel && typedSpiel.trim()) {
      // Trainee typed an opening greeting
      const openingTurn: ChatTurn = {
        id: 'turn-opening',
        sender: 'trainee',
        text: typedSpiel.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setTurns([openingTurn]);
      startLiveWebSocket(trainee, typedSpiel.trim());
    } else {
      // Spoken mode: Start live connection in silence, wait for trainee to speak into mic
      setTurns([]);
      startLiveWebSocket(trainee);
    }
  };

  // Handle trainee sending typed or spoken text turn
  const handleSendTextTurn = async (text: string) => {
    if (!text.trim()) return;

    if (isTerminationCommand(text)) {
      handleEndCall();
      return;
    }

    const newTurn: ChatTurn = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      sender: 'trainee',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedTurns = [...turnsRef.current, newTurn];
    setTurns(updatedTurns);

    // Send through WebSocket if actively connected
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !useVoiceFallback) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text,
        })
      );
    } else {
      // Fast, resilient Voice Engine turn dispatch
      dispatchCustomerVoiceTurn(text, updatedTurns, trainee);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRecorderRef.current) {
      audioRecorderRef.current.setMuted(nextMute);
    }
  };

  // Trigger formal call termination & QA audit calculation
  const triggerCallTermination = async (finalTurns: ChatTurn[], currentProfile: TraineeProfile) => {
    // Stop recording and player
    if (speechRecognizerRef.current) speechRecognizerRef.current.stop();
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stop();
      setIsMicActive(false);
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAndClear();
    }
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // ignore
      }
    }

    setCurrentPhase(4);
    setIsScoringLoading(true);

    const transcriptText = finalTurns
      .map((t) => `${t.sender === 'trainee' ? currentProfile.name : 'Customer'}: ${t.text}`)
      .join('\n');

    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainee: currentProfile,
          transcript: transcriptText,
        }),
      });

      const data = await res.json();
      if (data.reportText) {
        setScorecard(data);
      }
    } catch (err) {
      console.warn('[QA Audit] Notice:', err);
    } finally {
      setIsScoringLoading(false);
    }
  };

  // Manual End Call Action (Button or command)
  const handleEndCall = () => {
    const closing = 'Sounds good, thanks for your help today. Bye! [Line Disconnected]';
    setCustomerClosingLine(closing);

    const endTurn: ChatTurn = {
      id: 'end-' + Date.now(),
      sender: 'customer',
      text: closing,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const finalTurns = [...turnsRef.current, endTurn];
    setTurns(finalTurns);

    triggerCallTermination(finalTurns, trainee);
  };

  // Retry same scenario
  const handleRetry = () => {
    setTurns([]);
    setScorecard(null);
    setCurrentPhase(2);
  };

  // Start brand new scenario
  const handleNewScenario = () => {
    setTurns([]);
    setScorecard(null);
    setCurrentPhase(1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
              H
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Homeaglow <span className="text-emerald-400">Sales Simulator</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                  VoiceLab
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Roleplay Training Engine for Sales, Booking & Promos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsScriptDrawerOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Cheat Sheet</span>
            </button>

            {/* Current Phase Badge */}
            <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center gap-1.5">
              <span className="text-slate-400">Phase:</span>
              <span className="text-emerald-300 font-bold">
                {currentPhase === 1 && '1 - Intake Gate'}
                {currentPhase === 2 && '2 - Line Ringing'}
                {currentPhase === 3 && '3 - Live Simulation'}
                {currentPhase === 4 && '4 - QA Scorecard'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 flex flex-col">
        {currentPhase === 1 && <Phase1IntakeGate onSubmitIntake={handleIntakeSubmit} />}

        {currentPhase === 2 && (
          <Phase2Standby
            trainee={trainee}
            onDeliverOpeningSpiel={handleDeliverOpeningSpiel}
            onOpenScriptDrawer={() => setIsScriptDrawerOpen(true)}
          />
        )}

        {currentPhase === 3 && (
          <Phase3LiveCall
            trainee={trainee}
            turns={turns}
            micAnalyser={audioRecorderRef.current?.analyser || null}
            speakerAnalyser={audioPlayerRef.current?.analyser || null}
            isMicActive={isMicActive}
            isMuted={isMuted}
            isCustomerSpeaking={isCustomerSpeaking}
            isTranscribingAudio={isTranscribingAudio}
            onToggleMute={handleToggleMute}
            onSendTextTurn={handleSendTextTurn}
            onEndCall={handleEndCall}
            onOpenScriptDrawer={() => setIsScriptDrawerOpen(true)}
            onRequestMicPermission={initMicrophoneStream}
          />
        )}

        {currentPhase === 4 && (
          <Phase4Scorecard
            scorecard={scorecard}
            isLoading={isScoringLoading}
            trainee={trainee}
            onRetry={handleRetry}
            onNewScenario={handleNewScenario}
            closingLine={customerClosingLine}
          />
        )}
      </main>

      {/* Slide-over Call Flow Cheat Sheet Drawer */}
      <ScriptDrawer isOpen={isScriptDrawerOpen} onClose={() => setIsScriptDrawerOpen(false)} />
    </div>
  );
}
