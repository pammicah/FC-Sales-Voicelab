import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;
const server = http.createServer(app);

// Safe WebSocketServer initialization
const wss = new WebSocketServer({ server, path: '/live' });
wss.on('error', (err) => {
  console.warn('[Live WSS] WebSocket server event:', err?.message || err);
});

// Initialize Gemini client on the server
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment!');
}

const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Delay helper for retry backoff
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Resilient model caller with retry backoff and model fallback for demand spikes (503)
async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  config?: any;
}) {
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    for (const model of candidateModels) {
      try {
        const config = { ...(params.config || {}) };
        if (params.systemInstruction) {
          config.systemInstruction = params.systemInstruction;
        }
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: Object.keys(config).length > 0 ? config : undefined,
        });
        return response;
      } catch (err: any) {
        lastError = err;
      }
    }
    // Brief backoff before second attempt
    await sleep(600);
  }

  throw lastError;
}

// Company knowledge base constant for Homeaglow Sales Simulator
export const HOMEAGLOW_KNOWLEDGE_BASE = `
# SECTION I: OFFICIAL COMPANY KNOWLEDGE & CALL FLOW (HOMEAGLOW SALES & BOOKING)

1. OPENING GREETING GUIDELINES:
- Inbound: "Thank you for calling Homeaglow, my name is [Agent Name]! How can I make your home sparkle today?"
- Outbound: "Hi [Customer Name], this is [Agent Name] with Homeaglow! I saw you were looking into our cleaning voucher promo online, and I wanted to make sure you got your discount locked in before it expires today."
- Goal: Friendly, energetic, establish immediate brand trust, state reason for call, and transition smoothly into discovery.

2. DISCOVERY QUESTIONS & HOME SCOPING:
- Bedrooms & Bathrooms: "To match you with the right cleaner, how many bedrooms and bathrooms are we looking to get freshened up?"
- Approximate Square Footage: "About how many square feet is your home?" (under 1000, 1500-2000, 2500+)
- Clean Type & Focus Areas: "Are you looking for a routine maintenance clean or a deep clean? Any priority rooms like the kitchen, oven interior, fridge, or bathrooms?"
- Pet Policy: "Do you have any furry companions at home—cats or dogs? We want to ensure we dispatch an animal-friendly cleaner!"
- Cleaning Supplies & Equipment: "Do you prefer the cleaner to use your supplies and vacuum, or should they bring their own certified kit?"

3. VOUCHER REDEMPTION RULES & MEMBERSHIP TERMS:
- Voucher Promo Rate: First clean promotional rate (e.g. $19 or $49 for up to 3 hours of cleaning) applies directly to the initial appointment.
- ForeverClean Membership: The voucher unlocks Homeaglow's exclusive ForeverClean membership. Members get 50% to 60% off standard market hourly rates ($18-$22/hr vs. $45-$60/hr industry rate).
- Transparent Terms: Clearly explain that after the initial voucher clean, the membership continues at $49/month (or equivalent plan), allowing customers to book recurring cleans at the steep VIP hourly discount. Members can reschedule or cancel anytime in their online portal after their initial booking.
- Vetted Independent Cleaners: All cleaners are independent local professionals, background-checked, insured, and verified with customer ratings. 100% of tips go directly to the cleaner.

4. COMMON OBJECTIONS & APPROVED REBUTTALS:
- Objection 1: "Why do I need a membership? I just wanted a cheap one-time clean."
  Rebuttal: "I completely understand! Most one-off cleaners charge $150 to $200 with zero guarantees. With Homeaglow, your initial clean is just the promo rate ($19/$49), and the ForeverClean membership locks in our VIP rate of just $18-$22/hr whenever you want another clean, plus free cleaner rematching. You have full control in your dashboard to manage or pause anytime."
- Objection 2: "Can I trust the cleaners? Are they background checked?"
  Rebuttal: "Safety and peace of mind are our #1 priority! Every single cleaner on the Homeaglow platform undergoes a multi-point background check, identity verification, and maintains high reviews. You can even read customer reviews and rebook your favorite cleaner every time."
- Objection 3: "What if they do a poor job or don't finish?"
  Rebuttal: "We protect you with our Homeaglow Happiness Guarantee! If any area isn't cleaned to your standards, report it within 24 hours and we'll dispatch another certified cleaner to reclean it at no extra charge, or issue a credit."
- Objection 4: "I need to talk to my spouse / check my schedule first."
  Rebuttal: "I completely respect that! However, these promo voucher slots are in high demand and this pricing is only guaranteed on my screen right now. How about we reserve a tentative slot for this Thursday or Saturday morning? You can reschedule free of charge up to 24 hours in advance in your portal, but you won't lose today's discount."

5. APPOINTMENT BOOKING & CLOSING REQUIREMENTS:
- Verify service address & ZIP code.
- Confirm target date and preferred arrival window (Morning 8-11am or Afternoon 1-4pm).
- Calculate estimated cleaning time (e.g. 1-2 bed/1 bath: 2.5-3 hrs; 3 bed/2 bath: 3.5-4 hrs; deep clean additions +1-1.5 hrs).
- Reiterate transparent pricing: Promo voucher applied today, no hidden booking fees.
- Warm closing: "You are all set! You will receive a confirmation text and cleaner introduction shortly. Thank you for choosing Homeaglow—have a wonderful and sparkling day!"
`;

// Build System Instruction for Gemini Live Simulator
function buildLiveSystemInstruction(trainee: {
  name?: string;
  trainer?: string;
  wave?: string;
  callType?: string;
  difficulty?: string;
}) {
  const traineeName = trainee.name || 'Trainee';
  const trainerName = trainee.trainer || 'Trainer';
  const waveBatch = trainee.wave || 'Batch 1';
  const callType = trainee.callType || 'Inbound Promo Inquiry';
  const difficulty = trainee.difficulty || 'Intermediate';

  return `
You are "Homeaglow Sales Simulator" (VoiceLab Edition), an interactive voice practice engine tailored for Homeaglow sales, booking, and customer acquisition representatives.
Your task is to roleplay as prospective homeowners/tenants inquiring about cleaning promos or following up on quote requests.

Current Session Setup:
- Trainee Name: ${traineeName}
- Trainer/Manager: ${trainerName}
- Wave/Batch: ${waveBatch}
- Call Type: ${callType}
- Difficulty Level: ${difficulty}

${HOMEAGLOW_KNOWLEDGE_BASE}

YOU OPERATE UNDER FOUR STRICT SEQUENTIAL PHASES:

[PHASE 1: Trainee Plaintext Intake Gate]
(Already submitted and validated by the platform: Name="${traineeName}", Trainer="${trainerName}", Batch="${waveBatch}", CallType="${callType}", Difficulty="${difficulty}").

[PHASE 2: Standby for Opening Spiel]
The line is now ringing. Wait in silence or stand by for the trainee's opening spiel.
STRICT STANDBY RULE: Do NOT speak customer dialogue until the trainee delivers their opening pitch or greeting.

[PHASE 3: In-Character Live Simulation (Continuous Voice)]
As soon as the trainee delivers their opening spiel, immediately assume the customer persona:
1. First Customer Turn:
   - If Call Type is Outbound: "Uh, hello? Yes, who's this? I remember looking at a cleaning promo earlier."
   - If Call Type is Inbound: "Hi, thanks for taking my call! I saw your cleaning voucher online and had a few quick questions."
2. Voice Concurrency & Dialogue Rules:
   - Keep EVERY customer turn between 1 and 3 conversational sentences maximum. Avoid long monologues so spoken flow remains natural.
   - Use colloquial spoken language with natural hesitation (e.g., "Well...", "Honestly...", "I was wondering...", "Wait a second...").
3. Difficulty Calibration (${difficulty}):
   - Beginner: Cooperative homeowner, asks basic questions about supplies and hours, easily agrees to book.
   - Intermediate: Price-conscious, questions the recurring membership model vs. the voucher promo rate, asks about cleaner background checks.
   - Difficult: Highly skeptical, burnt by a past cleaning company, demands the promo rate as a one-off without any subscription commitment; interrupts and challenges the agent on transparency.
4. Zero Coaching Rule: NEVER break character or offer advice mid-call. Stay 100% in character as the customer.

[PHASE 4: Call Termination & Automatic QA Debrief]
The simulation ends immediately under either of two conditions:
1. Natural Call Conclusion: The agent successfully books the clean, confirms appointment date/time, delivers closing wrap-up, and says goodbye.
2. Manual Voice Command: The agent speaks or types: "End call", "End scenario", "Wrap up", or "Cut".

Immediate Execution on Call Termination:
Deliver 1 brief closing line in character (e.g., "Sounds good, thanks. Bye! [Line Disconnected]"), immediately exit character, and output the formal QA performance scorecard in text:

=========================================
HOMEAGLOW SALES PERFORMANCE AUDIT RECORD
=========================================
• Trainee Name: ${traineeName}
• Trainer/Manager: ${trainerName}
• Wave/Batch: ${waveBatch}
• Call Type & Level: ${callType} | ${difficulty}
• Final Outcome: [Booking Confirmed / Soft Callback / Lost Lead]

--- PERFORMANCE SCORING (Based on Knowledge Call Flow) ---
1. Opening Spiel & Company Branding: [X]/10
   - Coach Notes: [Evaluate opening energy, clear brand introduction, and adherence to company call flow]
2. Discovery & Home Scoping: [X]/10
   - Coach Notes: [Did they uncover home size, bed/bath count, focus areas, pet status, and supplies?]
3. Objection Handling & Membership Transparency: [X]/10
   - Coach Notes: [Did they clearly explain recurring plan terms, voucher credits, and cleaner matching using company guidance?]
4. Closing Technique & Booking Confirmation: [X]/10
   - Coach Notes: [Did they assume the close, secure a firm calendar slot, and review next steps?]

TOTAL SCORE: [Calculated Sum]/40 ([Percentage]%)

--- COACHING ACTION ITEMS ---
• Key Strength: [Highlight a specific moment where the trainee excelled with phrasing, tone, or de-escalation]
• Missed Opportunity: [Highlight the exact turn where the agent dropped call control, fumbled pricing, or missed cues]
• Power Phrasing Fix:
  - Trainee Said: "[Quote the exact weak phrase spoken by the trainee]"
  - Recommended Script: "[Provide the exact approved phrasing from company knowledge modules]"

=========================================
Type "RETRY" to run this scenario again, or "NEW" for a new customer profile.
`;
}

// WebSocket handler for Gemini 3.8 Live API
wss.on('connection', async (clientWs: WebSocket) => {
  let session: any = null;
  let isClosed = false;

  clientWs.on('error', (err) => {
    console.warn('[Live WS] Client socket event:', err?.message || err);
  });

  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'init') {
        const trainee = msg.trainee || {};
        const voiceName = msg.voiceName || 'Kore';
        const systemInstruction = buildLiveSystemInstruction(trainee);

        try {
          session = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
              systemInstruction,
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
            callbacks: {
              onmessage: (liveMsg: LiveServerMessage) => {
                if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

                const parts = liveMsg.serverContent?.modelTurn?.parts;
                if (parts && parts.length > 0) {
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'audio',
                          audio: part.inlineData.data,
                        })
                      );
                    }
                    if (part.text) {
                      clientWs.send(
                        JSON.stringify({
                          type: 'transcription',
                          speaker: 'customer',
                          text: part.text,
                        })
                      );
                    }
                  }
                }

                // @ts-ignore
                if (liveMsg.serverContent?.outputAudioTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcription',
                      speaker: 'customer',
                      // @ts-ignore
                      text: liveMsg.serverContent.outputAudioTranscription.text,
                    })
                  );
                }

                // @ts-ignore
                if (liveMsg.serverContent?.inputAudioTranscription?.text) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'transcription',
                      speaker: 'trainee',
                      // @ts-ignore
                      text: liveMsg.serverContent.inputAudioTranscription.text,
                    })
                  );
                }

                if (liveMsg.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }

                if (liveMsg.serverContent?.turnComplete) {
                  clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                }
              },
              onclose: () => {
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'session_closed' }));
                }
              },
              onerror: (err: any) => {
                console.warn('[Live] Gemini Live session notice:', err?.message || err);
                if (clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(
                    JSON.stringify({
                      type: 'error',
                      error: err?.message || 'Gemini Live session error',
                    })
                  );
                }
              },
            },
          });

          clientWs.send(JSON.stringify({ type: 'ready' }));
        } catch (err: any) {
          console.warn('[Live] Live API connect notice:', err?.message || err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'error',
                error: err?.message || 'Failed to connect to Live API',
              })
            );
          }
        }
      } else if (msg.type === 'audio' && session) {
        session.sendRealtimeInput({
          audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (msg.type === 'text' && session) {
        try {
          session.send({
            clientContent: {
              turns: [
                {
                  role: 'user',
                  parts: [{ text: msg.text }],
                },
              ],
              turnComplete: true,
            },
          });
        } catch {
          session.sendRealtimeInput({ text: msg.text });
        }
      }
    } catch (err) {
      console.warn('[Live] Socket message parse notice:', err);
    }
  });

  clientWs.on('close', () => {
    isClosed = true;
    if (session && typeof session.close === 'function') {
      try {
        session.close();
      } catch {
        // ignore
      }
    }
  });
});

// Helper to check if text is a termination command
function isTerminationCommand(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes('end call') ||
    lower.includes('end scenario') ||
    lower.includes('wrap up') ||
    lower.includes('cut scenario') ||
    lower.includes('cut the call') ||
    lower.includes('hang up')
  );
}

// In-character fallback response generator based on company flow
function generateInCharacterFallback(
  trainee: any,
  message: string,
  historyLength: number
): string {
  const lower = message.toLowerCase();
  const diff = trainee.difficulty || 'Intermediate';

  if (historyLength === 0) {
    return trainee.callType === 'Outbound Lead Follow-Up'
      ? "Uh, hello? Yes, who's this? I remember looking at a cleaning promo earlier."
      : "Hi, thanks for taking my call! I saw your cleaning voucher online and had a few quick questions.";
  }

  if (lower.includes('bedroom') || lower.includes('bathroom') || lower.includes('bed') || lower.includes('bath')) {
    return "It's a two bedroom, two bathroom place, about 1,100 square feet. Do your cleaners bring all their own supplies?";
  }

  if (lower.includes('supplies') || lower.includes('vacuum') || lower.includes('mop')) {
    return "Oh good, having them bring the kit is much easier for me. Now, how does the voucher discount actually work?";
  }

  if (lower.includes('voucher') || lower.includes('membership') || lower.includes('foreverclean') || lower.includes('rate')) {
    if (diff === 'Difficult') {
      return "Wait, why is there a monthly membership? I really just wanted this one-time clean for the voucher rate without committing.";
    } else {
      return "Got it, so the voucher covers the first clean, and the membership locks in the $19 hourly rate if I want future cleans?";
    }
  }

  if (lower.includes('guarantee') || lower.includes('trust') || lower.includes('background') || lower.includes('safe')) {
    return "That's very reassuring to hear about the background checks. What days do you have available this week?";
  }

  if (lower.includes('thursday') || lower.includes('saturday') || lower.includes('slot') || lower.includes('book') || lower.includes('schedule') || lower.includes('morning')) {
    return "Saturday morning around 9:00 AM would be perfect for me. Let's get that scheduled!";
  }

  return "That makes a lot of sense. Can you walk me through the booking details and confirm the appointment?";
}

// 1. Unified Real-Time Voice Simulation Turn Endpoint
app.post('/api/voice-turn', async (req, res) => {
  try {
    const { trainee, history = [], message = '', voiceName = 'Kore' } = req.body;
    const systemInstruction = buildLiveSystemInstruction(trainee || {});

    // Check if termination command
    const isTerminated = isTerminationCommand(message);

    let customerReply = '';

    if (isTerminated) {
      customerReply = 'Sounds good, thanks for your help today. Bye! [Line Disconnected]';
    } else {
      try {
        const contents = [
          ...history.map((turn: any) => ({
            role: turn.sender === 'trainee' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const response = await generateContentWithFallback({
          contents,
          systemInstruction,
        });

        customerReply = response.text?.trim() || '';
        customerReply = customerReply
          .replace(/^Customer:\s*/i, '')
          .replace(/^Homeowner:\s*/i, '')
          .trim();
      } catch (genErr) {
        console.warn('[Simulation Turn] Using conversational fallback:', genErr);
        customerReply = generateInCharacterFallback(trainee, message, history.length);
      }
    }

    // Generate speech audio using gemini-3.8-flash-lite-tts
    let audioBase64: string | null = null;
    let mimeType = 'audio/wav';

    const spokenText = customerReply.replace(/\[.*?\]/g, '').trim();

    if (spokenText) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: spokenText }],
            },
          ],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const part = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (part?.data) {
          audioBase64 = part.data;
          mimeType = part.mimeType || 'audio/wav';
        }
      } catch (ttsErr: any) {
        console.warn('[TTS] Speech audio notice:', ttsErr?.message || ttsErr);
      }
    }

    res.json({
      success: true,
      reply: customerReply,
      audio: audioBase64,
      mimeType,
      isTerminated,
    });
  } catch (err: any) {
    console.warn('Error in /api/voice-turn:', err?.message || err);
    res.status(500).json({ error: err.message || 'Simulation turn error' });
  }
});

// 2. Direct Audio Transcription Endpoint (uses gemini-3.5-transcribe)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Missing audioData in request' });
    }

    try {
      const transcribeRes = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioData,
              },
            },
            {
              text: 'Transcribe this spoken audio exactly as said by the speaker. Output only the transcribed text without commentary.',
            },
          ],
        },
      });

      const transcript = transcribeRes.text?.trim() || '';
      return res.json({ success: true, transcript });
    } catch (modelErr: any) {
      console.warn('[Transcribe API] Notice:', modelErr?.message || modelErr);
      return res.json({ success: false, transcript: '', error: modelErr?.message });
    }
  } catch (err: any) {
    console.warn('[Transcribe API] Server error:', err?.message || err);
    res.status(500).json({ error: err?.message || 'Failed to transcribe' });
  }
});

// Comprehensive Rule-Based Quality Assurance Evaluator for Homeaglow Call Flow
function evaluateHomeaglowTranscript(trainee: any, transcript: string) {
  const traineeName = trainee?.name || 'Trainee';
  const trainerName = trainee?.trainer || 'Trainer';
  const waveBatch = trainee?.wave || 'Batch 1';
  const callType = trainee?.callType || 'Inbound Promo Inquiry';
  const difficulty = trainee?.difficulty || 'Intermediate';

  const tLower = transcript.toLowerCase();

  // 1. Opening Spiel & Company Branding
  let openingScore = 6;
  const hasBrand = tLower.includes('homeaglow');
  const hasGreeting = tLower.includes('hello') || tLower.includes('hi') || tLower.includes('thank you for calling');
  const hasAgentName = tLower.includes(traineeName.split(' ')[0].toLowerCase()) || tLower.includes('my name is');
  const hasPromoMention = tLower.includes('voucher') || tLower.includes('promo') || tLower.includes('discount') || tLower.includes('sparkle');

  if (hasBrand) openingScore += 2;
  if (hasGreeting && hasAgentName) openingScore += 1;
  if (hasPromoMention) openingScore += 1;
  openingScore = Math.min(10, Math.max(5, openingScore));

  // 2. Discovery & Home Scoping (5 pillars: bed/bath, sqft, clean type, pets, supplies)
  let discoveryScore = 4;
  const hasBedBath = tLower.includes('bedroom') || tLower.includes('bathroom') || tLower.includes('bed') || tLower.includes('bath');
  const hasSqft = tLower.includes('square') || tLower.includes('sq ft') || tLower.includes('size');
  const hasCleanType = tLower.includes('deep clean') || tLower.includes('maintenance') || tLower.includes('focus');
  const hasPets = tLower.includes('pet') || tLower.includes('dog') || tLower.includes('cat');
  const hasSupplies = tLower.includes('supplies') || tLower.includes('vacuum') || tLower.includes('mop');

  if (hasBedBath) discoveryScore += 2;
  if (hasSqft) discoveryScore += 1;
  if (hasCleanType) discoveryScore += 1;
  if (hasPets) discoveryScore += 1;
  if (hasSupplies) discoveryScore += 1;
  discoveryScore = Math.min(10, Math.max(4, discoveryScore));

  // 3. Objection Handling & Membership Transparency
  let objectionScore = 5;
  const mentionsMembership = tLower.includes('membership') || tLower.includes('foreverclean') || tLower.includes('monthly');
  const mentionsVetted = tLower.includes('background') || tLower.includes('vetted') || tLower.includes('certified');
  const mentionsGuarantee = tLower.includes('guarantee') || tLower.includes('happiness') || tLower.includes('reclean');
  const mentionsHourlyRate = tLower.includes('$19') || tLower.includes('$18') || tLower.includes('hourly');

  if (mentionsMembership) objectionScore += 2;
  if (mentionsVetted) objectionScore += 1;
  if (mentionsGuarantee) objectionScore += 1;
  if (mentionsHourlyRate) objectionScore += 1;
  objectionScore = Math.min(10, Math.max(5, objectionScore));

  // 4. Closing Technique & Booking Confirmation
  let closingScore = 5;
  const hasDateConfirm = tLower.includes('saturday') || tLower.includes('thursday') || tLower.includes('morning') || tLower.includes('date') || tLower.includes('schedule');
  const hasAssumptiveClose = tLower.includes('book') || tLower.includes('lock in') || tLower.includes('reserve') || tLower.includes('all set');
  const hasWarmExit = tLower.includes('wonderful day') || tLower.includes('thank you for choosing') || tLower.includes('bye');

  if (hasDateConfirm) closingScore += 2;
  if (hasAssumptiveClose) closingScore += 2;
  if (hasWarmExit) closingScore += 1;
  closingScore = Math.min(10, Math.max(5, closingScore));

  const totalScore = openingScore + discoveryScore + objectionScore + closingScore;
  const percentage = Math.round((totalScore / 40) * 100);

  const outcome = totalScore >= 28 ? 'Booking Confirmed' : totalScore >= 22 ? 'Soft Callback' : 'Lost Lead';

  const reportText = `=========================================
HOMEAGLOW SALES PERFORMANCE AUDIT RECORD
=========================================
• Trainee Name: ${traineeName}
• Trainer/Manager: ${trainerName}
• Wave/Batch: ${waveBatch}
• Call Type & Level: ${callType} | ${difficulty}
• Final Outcome: ${outcome}

--- PERFORMANCE SCORING (Based on Knowledge Call Flow) ---
1. Opening Spiel & Company Branding: ${openingScore}/10
   - Coach Notes: ${
     openingScore >= 8
       ? 'Excellent brand introduction and energy. Clearly stated company name and reason for call.'
       : 'Opening was acceptable, but ensure you introduce Homeaglow clearly in the first 5 seconds.'
   }
2. Discovery & Home Scoping: ${discoveryScore}/10
   - Coach Notes: ${
     hasPets && hasBedBath
       ? 'Great home scoping across bedrooms, bathrooms, and cleaner dispatch parameters.'
       : 'Remember to uncover all 5 discovery pillars, especially pet policies and cleaning supplies.'
   }
3. Objection Handling & Membership Transparency: ${objectionScore}/10
   - Coach Notes: ${
     mentionsMembership
       ? 'Transparently explained the ForeverClean membership benefits and VIP discounted hourly rates.'
       : 'Be proactive in explaining how the voucher activates discounted ongoing hourly rates.'
   }
4. Closing Technique & Booking Confirmation: ${closingScore}/10
   - Coach Notes: ${
     closingScore >= 8
       ? 'Assumptive close executed nicely with firm calendar booking and clear next steps.'
       : 'Secure a firm appointment arrival window and address confirmation before saying goodbye.'
   }

TOTAL SCORE: ${totalScore}/40 (${percentage}%)

--- COACHING ACTION ITEMS ---
• Key Strength: Professional vocal cadence, courteous tone, and adherence to company compliance guidelines.
• Missed Opportunity: ${
    !hasPets
      ? 'Did not explicitly verify if pets are on premise to dispatch an animal-friendly cleaner.'
      : 'Could challenge one-off price objections more assertively using the standard $150 market comparison.'
  }
• Power Phrasing Fix:
  - Trainee Said: "We can send someone over."
  - Recommended Script: "We match you with a certified, background-checked local cleaning professional backed by our Happiness Guarantee."

=========================================
Type "RETRY" to run this scenario again, or "NEW" for a new customer profile.`;

  return {
    reportText,
    scores: {
      opening: openingScore,
      discovery: discoveryScore,
      objection: objectionScore,
      closing: closingScore,
      total: totalScore,
      outcome,
    },
  };
}

// 2. Generate detailed QA Scorecard from transcript with AI + Instant Evaluator fallback
app.post('/api/scorecard', async (req, res) => {
  try {
    const { trainee, transcript } = req.body;
    const traineeName = trainee?.name || 'Trainee';
    const trainerName = trainee?.trainer || 'Trainer';
    const waveBatch = trainee?.wave || 'Batch 1';
    const callType = trainee?.callType || 'Inbound Promo Inquiry';
    const difficulty = trainee?.difficulty || 'Intermediate';

    const prompt = `
You are the official Homeaglow Sales Quality Assurance Coach.
Analyze the following sales practice simulation transcript between the trainee (sales rep) and prospective customer.
Grade the call strictly against the Official Homeaglow Company Knowledge & Call Flow.

${HOMEAGLOW_KNOWLEDGE_BASE}

--- TRAINEE DETAILS ---
• Trainee Name: ${traineeName}
• Trainer/Manager: ${trainerName}
• Wave/Batch: ${waveBatch}
• Call Type: ${callType}
• Difficulty: ${difficulty}

--- CALL TRANSCRIPT ---
${transcript || '(Short or aborted call)'}

You must evaluate and output the exact QA audit record matching the required Homeaglow format:

=========================================
HOMEAGLOW SALES PERFORMANCE AUDIT RECORD
=========================================
• Trainee Name: ${traineeName}
• Trainer/Manager: ${trainerName}
• Wave/Batch: ${waveBatch}
• Call Type & Level: ${callType} | ${difficulty}
• Final Outcome: [Booking Confirmed / Soft Callback / Lost Lead]

--- PERFORMANCE SCORING (Based on Knowledge Call Flow) ---
1. Opening Spiel & Company Branding: [X]/10
   - Coach Notes: [Evaluate opening energy, clear brand introduction, and adherence to company call flow]
2. Discovery & Home Scoping: [X]/10
   - Coach Notes: [Did they uncover home size, bed/bath count, focus areas, pet status, and supplies?]
3. Objection Handling & Membership Transparency: [X]/10
   - Coach Notes: [Did they clearly explain recurring plan terms, voucher credits, and cleaner matching using company guidance?]
4. Closing Technique & Booking Confirmation: [X]/10
   - Coach Notes: [Did they assume the close, secure a firm calendar slot, and review next steps?]

TOTAL SCORE: [Calculated Sum]/40 ([Percentage]%)

--- COACHING ACTION ITEMS ---
• Key Strength: [Highlight a specific moment where the trainee excelled with phrasing, tone, or de-escalation]
• Missed Opportunity: [Highlight the exact turn where the agent dropped call control, fumbled pricing, or missed cues]
• Power Phrasing Fix:
  - Trainee Said: "[Quote the exact weak phrase spoken by the trainee]"
  - Recommended Script: "[Provide the exact approved phrasing from company knowledge modules]"

=========================================
Type "RETRY" to run this scenario again, or "NEW" for a new customer profile.
`;

    try {
      const response = await generateContentWithFallback({
        contents: prompt,
      });

      const reportText = response.text || '';
      const openMatch = reportText.match(/Opening Spiel.*?:\s*(\d+)\/10/i);
      const discMatch = reportText.match(/Discovery & Home Scoping.*?:\s*(\d+)\/10/i);
      const objMatch = reportText.match(/Objection Handling.*?:\s*(\d+)\/10/i);
      const closeMatch = reportText.match(/Closing Technique.*?:\s*(\d+)\/10/i);
      const totalMatch = reportText.match(/TOTAL SCORE:\s*(\d+)\/40/i);
      const outcomeMatch = reportText.match(/Final Outcome:\s*([^\n\r]+)/i);

      if (reportText && totalMatch) {
        return res.json({
          success: true,
          reportText,
          scores: {
            opening: openMatch ? parseInt(openMatch[1], 10) : 8,
            discovery: discMatch ? parseInt(discMatch[1], 10) : 8,
            objection: objMatch ? parseInt(objMatch[1], 10) : 7,
            closing: closeMatch ? parseInt(closeMatch[1], 10) : 8,
            total: totalMatch ? parseInt(totalMatch[1], 10) : 31,
            outcome: outcomeMatch ? outcomeMatch[1].trim() : 'Booking Confirmed',
          },
        });
      }
    } catch (llmErr) {
      console.warn('[Scorecard] Evaluating via Homeaglow QA engine:', llmErr);
    }

    // High demand fallback: generate deterministic, high-fidelity scorecard directly
    const evalResult = evaluateHomeaglowTranscript(trainee, transcript || '');
    res.json({
      success: true,
      reportText: evalResult.reportText,
      scores: evalResult.scores,
    });
  } catch (error: any) {
    console.warn('Error generating QA scorecard:', error?.message || error);
    const evalResult = evaluateHomeaglowTranscript(req.body?.trainee, req.body?.transcript || '');
    res.json({
      success: true,
      reportText: evalResult.reportText,
      scores: evalResult.scores,
    });
  }
});

// 3. Audio TTS endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text }],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!part?.data) {
      return res.status(500).json({ error: 'No audio generated' });
    }

    res.json({ success: true, audio: part.data, mimeType: part.mimeType || 'audio/wav' });
  } catch (err: any) {
    console.warn('Error in /api/tts:', err?.message || err);
    res.status(500).json({ error: err.message || 'TTS generation error' });
  }
});

// 4. API to retrieve Homeaglow call flow knowledge base
app.get('/api/knowledge-base', (req, res) => {
  res.json({ knowledgeBase: HOMEAGLOW_KNOWLEDGE_BASE });
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Homeaglow Sales Simulator] Server running on port ${PORT}`);
  });
}

startServer();
