# Task Execution Checklist: MP4 to MP3 Converter (FFmpeg WASM)

- [x] **Phase 1: Project Scaffolding & Setup**
  - [x] Initialize Vite + React + TypeScript in workspace
  - [x] Install dependencies (`@ffmpeg/ffmpeg`, `@ffmpeg/util`, `zustand`, `lucide-react`, `jszip`, `clsx`, `tailwind-merge`)
  - [x] Setup TailwindCSS & dark mode styles
  - [x] Configure Vite server COOP/COEP headers for SharedArrayBuffer support

- [x] **Phase 2: Core Transcoder Engine (Deep Module)**
  - [x] Create `src/core/ffmpeg-service.ts` singleton with thread-safe initialization
  - [x] Implement fallback loader (multi-thread `core-mt` vs single-thread `core`)
  - [x] Implement virtual MEMFS file lifecycle with guaranteed memory cleanup
  - [x] Implement FFmpeg command builder (`-ss`, `-to`, `-vn`, `-c:a libmp3lame`, `-b:a`, `-ar`)
  - [x] Implement audio stream probe & error handling for silent MP4s

- [x] **Phase 3: Queue & State Management (Zustand)**
  - [x] Create `src/store/use-queue-store.ts` with queue state machine
  - [x] Implement sequential worker loop (bounded concurrency = 1)
  - [x] Create `src/store/use-settings-store.ts` for bitrate and sample rate presets
  - [x] Implement Object URL lifecycle & memory revocation manager

- [x] **Phase 4: UI Presentation Components**
  - [x] Build Drag & Drop zone (`src/components/dropzone/`) with file validation
  - [x] Build Queue list view (`src/components/queue/`) with real-time progress bars
  - [x] Build Audio Trimmer modal (`src/components/trimmer/`) with preview player and dual slider
  - [x] Build Audio Settings panel (`src/components/settings/`)
  - [x] Build Header & WASM engine status badge

- [x] **Phase 5: Batch Archiving & Verification**
  - [x] Implement `src/utils/zip-exporter.ts` using JSZip for "Download All (.zip)"
  - [x] Validate TypeScript typecheck (`npm run build`)
  - [x] Setup deployment configs for Vercel and Cloudflare Pages (`vercel.json`, `_headers`)
