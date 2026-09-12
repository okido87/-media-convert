# Domain Context & Glossary

## Ubiquitous Language & Core Terminology
- **Container**: The file wrapper format (e.g., MP4/M4V/MOV/MKV) containing multiple synchronized multimedia streams (video, audio, subtitle tracks, metadata).
- **Elementary Stream**: An unmultiplexed, individual stream of data (e.g., audio stream vs video stream).
- **Codec**: Hardware or software algorithm to encode/decode digital media (e.g., AAC, Opus, MP3 / LAME, PCM).
- **Transcoding**: The process of decoding a compressed audio stream (e.g. AAC) and re-encoding it into a target format (e.g. MP3).
- **Demuxing (Demultiplexing)**: Extracting the audio stream out of the container without necessarily re-encoding.
- **Bitrate**: The number of bits processed per second (e.g., 128 kbps, 192 kbps, 320 kbps).
- **CBR vs VBR**: Constant Bitrate (predictable size, fixed throughput) vs Variable Bitrate (higher quality-to-size ratio, adapts complexity).
- **Sample Rate**: The frequency of audio samples per second (e.g., 44.1 kHz, 48 kHz).
- **Channels**: Mono (1.0), Stereo (2.0), Surround (5.1). Transcoding often requires downmixing multi-channel audio to stereo for standard MP3.
- **ID3 Metadata**: Metadata tags embedded in MP3 files (Title, Artist, Album, Year, Cover Art, Track Number).
