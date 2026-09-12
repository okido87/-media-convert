# Product Context

## Problem Statement
Users frequently need to extract audio tracks from MP4 video recordings (lectures, music videos, podcasts, Zoom calls, interviews) into standalone MP3 audio files for listening on portable players, reducing storage footprints, or podcast distribution.

## Key Challenges
1. **Performance & Resource Consumption**: Video files can be multi-gigabyte. Re-encoding high-resolution video is unnecessary; only the audio stream needs to be decoded and re-encoded.
2. **Privacy vs Convenience**: Users often distrust online conversion websites (which upload private videos to unknown cloud servers). Client-side or local desktop tools guarantee 100% privacy and zero network transfer cost.
3. **Audio Quality Degradation**: Transcoding from lossy AAC (standard in MP4) to lossy MP3 incurs generational loss. Choosing appropriate bitrates (e.g. LAME VBR V0 or 320kbps CBR) is critical.
4. **Platform Form Factor**: Different users prefer different tools:
   - Developer/Power user: Fast CLI tool with batch folder processing.
   - Everyday user: Clean Desktop UI (drag-and-drop, progress bar) or Browser-based local tool (FFmpeg WASM).
   - Enterprise/SaaS: API endpoint with asynchronous task queue (BullMQ/Celery + S3/MinIO).
