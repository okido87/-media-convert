import { create } from 'zustand';
import type { AudioBitrate, AudioSampleRate } from '../core/ffmpeg-types';

interface SettingsState {
  bitrate: AudioBitrate;
  sampleRate: AudioSampleRate;
  setBitrate: (bitrate: AudioBitrate) => void;
  setSampleRate: (sampleRate: AudioSampleRate) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  bitrate: '192k',
  sampleRate: 44100,
  setBitrate: (bitrate) => set({ bitrate }),
  setSampleRate: (sampleRate) => set({ sampleRate }),
}));
