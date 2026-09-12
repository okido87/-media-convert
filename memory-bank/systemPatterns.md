# System Patterns & Architecture

## Selected Architecture: Pure Client-Side WASM Media Transcoder

```
+-------------------------------------------------------------------+
|                        Browser Client (UI)                        |
|                                                                   |
|   +-------------------+   +------------------+   +------------+   |
|   | Drag & Drop Zone  |   | Trimmer / Player |   | Queue Card |   |
|   +-------------------+   +------------------+   +------------+   |
|            |                        |                  |          |
|            v                        v                  v          |
|   +-----------------------------------------------------------+   |
|   |       Zustand Store: FileQueueState & ConversionConfig     |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|                                 v (Web Worker Message)            |
|   +-----------------------------------------------------------+   |
|   |         FFmpeg WASM Engine Worker (Isolated Thread)       |   |
|   |                                                           |   |
|   |  - FS Write Virtual Input File                            |   |
|   |  - Run: ffmpeg -ss .. -to .. -i in.mp4 -vn -c:a libmp3lame|   |
|   |  - Progress Callback Stream (FFmpeg logs -> percentage)   |   |
|   |  - FS Read Output Virtual Buffer                          |   |
|   |  - FS Delete Input & Output (Memory Reclamation)          |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|                                 v (Blob / ObjectURL)              |
|   +-----------------------------------------------------------+   |
|   |      Direct MP3 Download / JSZip Batch Bundle Archiver    |   |
|   +-----------------------------------------------------------+   |
+-------------------------------------------------------------------+
```

## Architectural Patterns
1. **Thread Isolation**: Never run FFmpeg on the main UI thread. WASM execution is managed by `@ffmpeg/ffmpeg` inside a dedicated Web Worker to maintain smooth 60fps UI animations and interactions.
2. **Deterministic Memory Reclamation**: The MEMFS (virtual in-memory filesystem of Emscripten/WASM) retains files in memory until explicitly unlinked. The engine must invoke `ffmpeg.deleteFile()` in a `finally` block to prevent browser tab crashes.
3. **Queue State Machine**:
   - `QUEUED` -> `PREPARING` -> `TRANSCODING` (with progress %) -> `COMPLETED` (Blob ready) or `FAILED` (Error reason).
4. **Input Seeking Optimization**:
   - For audio trimming, place `-ss [start] -to [end]` before `-i` for fast demuxer seeking rather than decoding frames from the beginning.
