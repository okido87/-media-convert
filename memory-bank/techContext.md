# Technical Context

## Core Technologies
- **UI Framework**: React 18/19, TypeScript, Vite, TailwindCSS, Lucide Icons, Radix UI.
- **Transcoding Core**:
  - `@ffmpeg/ffmpeg` (v0.12.x) + `@ffmpeg/util` (`fetchFile`).
  - `@ffmpeg/core` (single-threaded for broad compatibility without requiring COOP/COEP headers, or `@ffmpeg/core-mt` if multi-threaded headers are available).
- **State Management**: Zustand (lightweight, zero-boilerplate, handles queue & file blobs).
- **Audio Trimming & Preview**: HTML5 Audio/Video + custom dual-slider or Wavesurfer.js for visual waveform representation.
- **Batch Export**: `jszip` + `file-saver` (bundle all converted MP3 files into a `.zip` archive).

## Browser Constraints & Compatibility
- **WASM Memory**: Chrome, Edge, Safari, Firefox all support WebAssembly up to 2GB-4GB.
- **Blob URLs**: Revoke `URL.revokeObjectURL()` after download or when queue item is removed to avoid client memory leaks.
- **Static Hosting**: Can be hosted on Vercel, Cloudflare Pages, GitHub Pages, Netlify at $0 server cost.
