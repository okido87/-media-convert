# Project Brief: MediaConvert (MP4 to MP3 Converter)

## Overview
MediaConvert is a media processing application/utility designed to extract audio tracks from MP4 video containers and transcode them into MP3 audio format with optimal quality, high throughput, and robust edge-case handling.

## Core Goals
- Transcode MP4 (H.264/HEVC/AV1 + AAC/AC3/Opus/MP3 audio streams) to MP3 (LAME / libmp3lame).
- Provide flexible deployment/usage modes: CLI, Local Desktop App (Tauri/Electron), Browser Client-side (WASM), or Web Service (API + Worker).
- Support batch processing, audio bitrate selection (128k, 192k, 320k, VBR), metadata preservation (ID3 tags), and fast extraction without re-encoding if target is already compatible.
- Robust error handling for corrupt files, missing audio streams, variable frame rates, and large video files.
