import type { AudioBitrate } from '../core/ffmpeg-types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatBitrate(bitrate: AudioBitrate): string {
  switch (bitrate) {
    case '128k':
      return '128 kbps (Standard)';
    case '192k':
      return '192 kbps (High Quality)';
    case '256k':
      return '256 kbps (Very High)';
    case '320k':
      return '320 kbps (Studio Max)';
    case 'vbr':
      return 'VBR V2 (~190 kbps dynamic)';
    default:
      return bitrate;
  }
}
