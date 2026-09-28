/**
 * Audio streaming utilities for Gemini Live API & Speech Synthesis
 * - LiveAudioPlayer: plays 24kHz PCM or decoded Audio (WAV/MP3) through Web Audio AnalyserNode
 * - LiveAudioRecorder: captures 16kHz PCM from microphone with VAD and AudioBuffer capture
 * - SpeechRecognizer: Web Speech Recognition for continuous trainee speech practice
 */

export class LiveAudioPlayer {
  public audioCtx: AudioContext | null = null;
  public analyser: AnalyserNode | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  public onPlaybackStart?: () => void;
  public onPlaybackEnd?: () => void;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.connect(this.audioCtx.destination);
      this.nextStartTime = 0;
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play decoded audio buffer (WAV / MP3 from TTS) through the analyser
  public async playAudioData(base64Data: string): Promise<void> {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      if (this.onPlaybackStart) this.onPlaybackStart();

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));
      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioCtx.destination);
      }

      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);

      return new Promise<void>((resolve) => {
        source.onended = () => {
          const index = this.activeSources.indexOf(source);
          if (index > -1) {
            this.activeSources.splice(index, 1);
          }
          if (this.activeSources.length === 0 && this.onPlaybackEnd) {
            this.onPlaybackEnd();
          }
          resolve();
        };
      });
    } catch (err) {
      console.warn('Playback notice (audio decoding):', err);
      if (this.onPlaybackEnd) this.onPlaybackEnd();
    }
  }

  // Play raw 24kHz 16-bit PCM chunk from Live WebSocket API
  public playPcmChunk(base64Data: string) {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      if (this.onPlaybackStart) this.onPlaybackStart();

      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 16-bit PCM little-endian signed integer
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.audioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioCtx.destination);
      }

      const currentTime = this.audioCtx.currentTime;
      if (this.nextStartTime < currentTime) {
        this.nextStartTime = currentTime;
      }

      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index > -1) {
          this.activeSources.splice(index, 1);
        }
        if (this.activeSources.length === 0 && this.onPlaybackEnd) {
          this.onPlaybackEnd();
        }
      };
    } catch (err) {
      console.warn('Error playing PCM audio chunk:', err);
    }
  }

  public stopAndClear() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    if (this.onPlaybackEnd) {
      this.onPlaybackEnd();
    }
  }

  public close() {
    this.stopAndClear();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
  }
}

export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  public analyser: AnalyserNode | null = null;
  private onAudioChunk: ((base64: string) => void) | null = null;
  private onSpeechSegmentEnd: ((base64Wav: string) => void) | null = null;
  private isMuted: boolean = false;

  // Voice Activity Detection (VAD) buffer
  private recordedSamples: Float32Array[] = [];
  private totalRecordedLength: number = 0;
  private silenceCounter: number = 0;
  private isSpeakingDetected: boolean = false;
  private lastSpeechTimestamp: number = 0;

  constructor(
    onChunk?: (base64: string) => void,
    onSpeechSegmentEnd?: (base64Wav: string) => void
  ) {
    if (onChunk) this.onAudioChunk = onChunk;
    if (onSpeechSegmentEnd) this.onSpeechSegmentEnd = onSpeechSegmentEnd;
  }

  public async start(): Promise<void> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported on this browser/environment');
    }

    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioCtxClass();
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.source = this.audioCtx.createMediaStreamSource(this.mediaStream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.source.connect(this.analyser);

    // Audio processor for live streaming and VAD speech segment capture
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);

    this.processor.onaudioprocess = (e) => {
      if (this.isMuted) return;
      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate Root Mean Square (RMS) volume level
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      // Highly sensitive speech threshold (0.007) so normal spoken conversational levels are caught immediately
      const isAudible = rms > 0.007;

      // Live PCM streaming callback (for WebSocket)
      if (this.onAudioChunk) {
        const base64Pcm = this.floatTo16BitPCMBase64(inputData);
        if (base64Pcm) {
          this.onAudioChunk(base64Pcm);
        }
      }

      // Voice Activity Detection segment accumulation (for Gemini 3.5 Transcribe)
      if (this.onSpeechSegmentEnd) {
        const cloned = new Float32Array(inputData);
        this.recordedSamples.push(cloned);
        this.totalRecordedLength += cloned.length;

        if (isAudible) {
          this.isSpeakingDetected = true;
          this.silenceCounter = 0;
          this.lastSpeechTimestamp = Date.now();
        } else if (this.isSpeakingDetected) {
          this.silenceCounter++;
          // ~800ms of natural silence after speech detected (8 frames with 4096 buffer @ 44.1k/48k)
          if (this.silenceCounter >= 8 && Date.now() - this.lastSpeechTimestamp > 800) {
            // Speech segment complete: encode to WAV and deliver
            this.flushSpeechSegment();
          }
        } else {
          // Keep a rolling buffer of 4 frames before speech starts for natural onset
          if (this.recordedSamples.length > 5) {
            const dropped = this.recordedSamples.shift();
            if (dropped) this.totalRecordedLength -= dropped.length;
          }
        }
      }
    };
  }

  private flushSpeechSegment() {
    if (this.totalRecordedLength <= 0 || !this.onSpeechSegmentEnd) {
      this.resetVad();
      return;
    }

    try {
      const sampleRate = this.audioCtx?.sampleRate || 44100;
      const merged = new Float32Array(this.totalRecordedLength);
      let offset = 0;
      for (const chunk of this.recordedSamples) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      // Encode merged float32 array to standard WAV Base64
      const wavBase64 = this.encodeWAVBase64(merged, sampleRate);
      if (wavBase64) {
        this.onSpeechSegmentEnd(wavBase64);
      }
    } catch (err) {
      console.warn('[VAD] Error encoding speech segment:', err);
    } finally {
      this.resetVad();
    }
  }

  private resetVad() {
    this.recordedSamples = [];
    this.totalRecordedLength = 0;
    this.silenceCounter = 0;
    this.isSpeakingDetected = false;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  public stop() {
    this.resetVad();
    if (this.processor) {
      try {
        this.processor.disconnect();
      } catch {
        // ignore
      }
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      try {
        this.source.disconnect();
      } catch {
        // ignore
      }
      this.source = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
  }

  private floatTo16BitPCMBase64(float32Array: Float32Array): string {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, Math.min(i + chunk, bytes.length)))
      );
    }
    return btoa(binary);
  }

  private encodeWAVBase64(samples: Float32Array, sampleRate: number): string {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // file length
    view.setUint32(4, 36 + samples.length * 2, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // format chunk length
    view.setUint32(16, 16, true);
    // sample format (1 = PCM)
    view.setUint16(20, 1, true);
    // channel count (1 = mono)
    view.setUint16(22, 1, true);
    // sample rate
    view.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    view.setUint32(28, sampleRate * 2, true);
    // block align (channel count * bytes per sample)
    view.setUint16(32, 2, true);
    // bits per sample
    view.setUint16(34, 16, true);
    // data chunk identifier
    this.writeString(view, 36, 'data');
    // data chunk length
    view.setUint32(40, samples.length * 2, true);

    // write PCM samples
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(bytes.subarray(i, Math.min(i + chunk, bytes.length)))
      );
    }
    return btoa(binary);
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

/**
 * SpeechRecognizer: Seamless Web Speech Recognition for trainee spoken turns
 */
export class SpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private onResultCallback: (text: string, isFinal: boolean) => void;
  private onErrorCallback?: (err: any) => void;

  constructor(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: any) => void
  ) {
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;

    const SpeechClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechClass) {
      this.recognition = new SpeechClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      let debounceTimer: any = null;
      let accumulatedFinal = '';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            accumulatedFinal += ' ' + event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript.trim()) {
          this.onResultCallback(interimTranscript.trim(), false);
        }

        if (accumulatedFinal.trim()) {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (accumulatedFinal.trim()) {
              const toSend = accumulatedFinal.trim();
              accumulatedFinal = '';
              this.onResultCallback(toSend, true);
            }
          }, 800);
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && this.onErrorCallback) {
          this.onErrorCallback(event.error);
        }
      };

      this.recognition.onend = () => {
        // Automatically restart if still listening
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // ignore
          }
        }
      };
    }
  }

  public isAvailable(): boolean {
    return !!this.recognition;
  }

  public start() {
    if (!this.recognition || this.isListening) return;
    this.isListening = true;
    try {
      this.recognition.start();
    } catch {
      // ignore
    }
  }

  public stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
  }
}
