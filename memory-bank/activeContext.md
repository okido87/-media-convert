# Active Context

## Current Focus
Brainstorming and architectural design for **Pure Client-side Web Application (React + Vite + FFmpeg WASM)** for MP4 to MP3 conversion.

## Active Decisions
- **Form Factor**: Pure Client-Side Web App (100% In-Browser Transcoding, Zero Backend, Zero Cloud Storage Cost, 100% Privacy).
- **Core Engine**: `@ffmpeg/ffmpeg` (v0.12.x) with WebAssembly and Web Worker isolation.
- **Priority Features**:
  1. Batch Processing: Queue-based sequential/concurrent conversion for multiple files.
  2. Audio Quality Controls: Bitrate selection (128kbps, 192kbps, 320kbps, VBR V0/V2) and Sample Rate (44.1kHz, 48kHz).
  3. Audio Trimming: Interactive start/end time slider & player to extract specific segments.
  4. ZIP Batch Download: Single file download or bundle all converted MP3s with JSZip.
