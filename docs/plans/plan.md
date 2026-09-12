# Implementation Plan: Pure Client-Side MP4 to MP3 Converter (FFmpeg WASM)

## Executive Summary
Build a modern, high-performance, 100% privacy-respecting client-side web application to convert MP4 video files into high-quality MP3 audio files. The application runs entirely within the user's browser using WebAssembly (`@ffmpeg/ffmpeg`), requiring zero backend servers, zero cloud storage, and incurring zero bandwidth costs.

## Tech Stack
- **Runtime & Build**: Node.js, Vite, TypeScript
- **UI Framework**: React 18/19, Tailwind CSS, Lucide React, Radix UI primitives
- **Transcoding Core**: `@ffmpeg/ffmpeg` (v0.12.x), `@ffmpeg/util`, `@ffmpeg/core` (with fallback between multi-threaded `core-mt` and single-threaded `core`)
- **State Management**: Zustand
- **Export & Archiving**: JSZip, FileSaver

---

## Phased Implementation Roadmap

### Phase 1: Project Scaffolding & Engine Foundation
- **Goal**: Establish project structure, dependencies, Tailwind theme, and Vite cross-origin isolation headers.
- **Tasks**:
  1. Initialize Vite + React + TypeScript in workspace.
  2. Configure TailwindCSS, PostCSS, and dark modern styling system.
  3. Configure Vite server headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) for `SharedArrayBuffer` support.
  4. Install core dependencies: `@ffmpeg/ffmpeg`, `@ffmpeg/util`, `zustand`, `lucide-react`, `jszip`.

### Phase 2: Transcoding Engine Deep Module (`src/core/`)
- **Goal**: Isolate FFmpeg WASM execution in a clean, robust, leak-free service.
- **Tasks**:
  1. `ffmpeg-service.ts`: Singleton managing WASM initialization, worker lifecycle, and status callbacks.
  2. Dynamic fallback logic: Detect if `crossOriginIsolated` is true; load `core-mt` if available, fallback gracefully to `core` single-thread.
  3. MEMFS File System Lifecycle: Write input buffer, execute transcode command, read output blob, and deterministically call `ffmpeg.deleteFile()` in a `finally` block to reclaim RAM.
  4. FFmpeg Command Generator: Construct parameters supporting fast keyframe seeking (`-ss`, `-to` before `-i`), audio stripping (`-vn`), LAME MP3 encoding (`-c:a libmp3lame`), custom bitrates (`-b:a 128k/192k/320k`), and sample rates (`-ar 44100/48000`).
  5. Audio Stream Probing: Handle silent MP4 videos cleanly without throwing unhandled exceptions.

### Phase 3: State Management & Sequential Queue Engine (`src/store/`)
- **Goal**: Provide rock-solid queue processing with bounded concurrency (1 item at a time) to prevent browser tab crash (OOM).
- **Tasks**:
  1. `use-queue-store.ts`: State machine with items: `id`, `file`, `name`, `size`, `status` (`QUEUED`, `PREPARING`, `TRANSCODING`, `COMPLETED`, `FAILED`), `progress`, `duration`, `trimOptions`, `resultBlob`, `error`.
  2. Queue Processor Loop: Sequentially execute conversions, update granular progress percentages, handle cancellation.
  3. `use-settings-store.ts`: Manage default conversion options (Bitrate: 192kbps default, Sample rate: 44.1kHz default).
  4. Object URL memory manager: Revoke `URL.revokeObjectURL()` on item delete or reset.

### Phase 4: UI / UX Presentation Layer (`src/components/`)
- **Goal**: Create an intuitive, accessible, and responsive interface.
- **Tasks**:
  1. `Dropzone`: Drag & drop target with file input fallback, format validation (.mp4, .m4v, .mov), and multiple file selection.
  2. `QueueList`: Render items with status badges, individual progress bars, duration, target settings, and individual MP3 download triggers.
  3. `AudioTrimmerModal`: Canonical modal for setting Start Time and End Time with video/audio preview and dual-handle slider.
  4. `SettingsPanel`: Dropdown/Radio controls for Bitrate presets (128k, 192k, 320k, VBR) and Sample Rate (44.1kHz, 48kHz).
  5. `Header` & `StatusBanner`: Engine loading indicator (ready / downloading WASM core / transcoding) and system health.

### Phase 5: Batch Packaging & Production Verification
- **Goal**: Enable batch download and verify end-to-end reliability.
- **Tasks**:
  1. `zip-exporter.ts`: Package all completed MP3 files into a single `.zip` archive using `jszip`.
  2. Production Build: Run `npm run build` and verify bundle size, asset hashing, and zero TypeScript lint errors.
  3. Verification Test: Test with sample MP4 files of varying lengths, resolutions, and audio codecs.
