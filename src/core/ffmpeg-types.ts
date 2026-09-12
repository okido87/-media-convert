export type AudioBitrate = '128k' | '192k' | '256k' | '320k' | 'vbr';

export type AudioSampleRate = 44100 | 48000;

export interface TrimRange {
  start: number; // in seconds
  end: number;   // in seconds
}

export interface TranscodeOptions {
  bitrate: AudioBitrate;
  sampleRate: AudioSampleRate;
  trimRange?: TrimRange | null;
  volume?: number; // 1.0 is default
}

export type EngineStatus = 'unloaded' | 'loading' | 'ready' | 'transcoding' | 'error';
export type EngineMode = 'multi-thread' | 'single-thread' | 'none';

export interface EngineState {
  status: EngineStatus;
  mode: EngineMode;
  message: string;
  error?: string;
}

export interface TranscodeResult {
  blob: Blob;
  size: number;
  outputName: string;
}
