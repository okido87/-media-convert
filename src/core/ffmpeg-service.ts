import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import type {
  TranscodeOptions,
  TranscodeResult,
  EngineStatus,
  EngineMode,
  EngineState,
} from './ffmpeg-types';

class FFmpegService {
  private static instance: FFmpegService | null = null;
  private ffmpeg: FFmpeg | null = null;
  private status: EngineStatus = 'unloaded';
  private mode: EngineMode = 'none';
  private message: string = 'Engine not initialized';
  private loadPromise: Promise<void> | null = null;
  private listeners: Set<(state: EngineState) => void> = new Set();
  private lastLogs: string[] = [];

  private constructor() {}

  public static getInstance(): FFmpegService {
    if (!FFmpegService.instance) {
      FFmpegService.instance = new FFmpegService();
    }
    return FFmpegService.instance;
  }

  public subscribe(listener: (state: EngineState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): EngineState {
    return {
      status: this.status,
      mode: this.mode,
      message: this.message,
    };
  }

  private notify(status: EngineStatus, message: string, mode?: EngineMode): void {
    this.status = status;
    this.message = message;
    if (mode) this.mode = mode;
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  public async initialize(): Promise<void> {
    if (this.status === 'ready' && this.ffmpeg) {
      return;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.doLoad();
    try {
      await this.loadPromise;
    } finally {
      this.loadPromise = null;
    }
  }

  private async doLoad(): Promise<void> {
    this.notify('loading', 'Đang khởi động công cụ WebAssembly...');
    this.ffmpeg = new FFmpeg();
    this.lastLogs = [];

    this.ffmpeg.on('log', ({ message }) => {
      // Keep last 30 logs for error diagnosis
      this.lastLogs.push(message);
      if (this.lastLogs.length > 50) this.lastLogs.shift();
      // console.debug('[FFmpeg]', message);
    });

    const isIsolated =
      typeof window !== 'undefined' &&
      window.crossOriginIsolated &&
      typeof SharedArrayBuffer !== 'undefined';

    // Attempt 1: Multi-threaded core if cross-origin isolated
    if (isIsolated) {
      try {
        this.notify('loading', 'Đang nạp FFmpeg đa luồng (Multi-Thread WASM)...', 'multi-thread');
        const baseURL = '/ffmpeg/core-mt';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });
        this.notify('ready', 'Sẵn sàng (Đa luồng)', 'multi-thread');
        return;
      } catch (err) {
        console.warn('Không thể nạp FFmpeg multi-thread, tự động chuyển sang single-thread:', err);
      }
    }

    // Attempt 2: Single-threaded core (broad compatibility)
    try {
      this.notify('loading', 'Đang nạp FFmpeg đơn luồng (Single-Thread WASM)...', 'single-thread');
      const baseURL = '/ffmpeg/core';
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      this.notify('ready', 'Sẵn sàng (Đơn luồng)', 'single-thread');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.notify('error', `Lỗi tải bộ xử lý WASM: ${errorMsg}`);
      throw new Error(`Không thể khởi động FFmpeg: ${errorMsg}`);
    }
  }

  public async transcode(
    file: File,
    options: TranscodeOptions,
    onProgress?: (progressPercent: number) => void
  ): Promise<TranscodeResult> {
    await this.initialize();
    if (!this.ffmpeg) {
      throw new Error('FFmpeg chưa sẵn sàng');
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const inputExt = file.name.substring(file.name.lastIndexOf('.')) || '.mp4';
    const inputName = `input_${uniqueId}${inputExt}`;
    const outputName = `output_${uniqueId}.mp3`;

    this.notify('transcoding', `Đang xử lý: ${file.name}`);

    const progressHandler = ({ progress }: { progress: number }) => {
      // progress is between 0 and 1
      const pct = Math.min(100, Math.max(0, Math.round(progress * 100)));
      if (onProgress) onProgress(pct);
    };

    this.ffmpeg.on('progress', progressHandler);

    try {
      // 1. Write file to virtual MEMFS
      const fileData = await fetchFile(file);
      await this.ffmpeg.writeFile(inputName, fileData);

      // 2. Construct FFmpeg command arguments
      const args: string[] = [];

      // Fast seek trimming (placing -ss & -to before -i enables keyframe fast seeking)
      if (options.trimRange && options.trimRange.end > options.trimRange.start) {
        args.push('-ss', options.trimRange.start.toFixed(3));
        args.push('-to', options.trimRange.end.toFixed(3));
      }

      // Input file
      args.push('-i', inputName);

      // Discard video stream completely
      args.push('-vn');

      // Audio codec: MP3 (LAME)
      args.push('-c:a', 'libmp3lame');

      // Bitrate / VBR
      if (options.bitrate === 'vbr') {
        args.push('-q:a', '2'); // Variable Bitrate V2 (~190kbps average)
      } else {
        args.push('-b:a', options.bitrate);
      }

      // Sample rate
      args.push('-ar', String(options.sampleRate));

      // Force stereo (2 channels) for universal compatibility
      args.push('-ac', '2');

      // Volume multiplier if specified
      if (options.volume && options.volume !== 1) {
        args.push('-filter:a', `volume=${options.volume}`);
      }

      // Output file
      args.push(outputName);

      // 3. Execute FFmpeg
      const exitCode = await this.ffmpeg.exec(args);

      if (exitCode !== 0) {
        const recentLogs = this.lastLogs.join('\n');
        if (
          recentLogs.includes('does not contain any stream') ||
          recentLogs.includes('Audio: none') ||
          recentLogs.includes('matches no streams')
        ) {
          throw new Error('Video không có luồng âm thanh nào để trích xuất.');
        }
        throw new Error(`Quá trình transcode kết thúc với mã lỗi ${exitCode}.`);
      }

      // 4. Read output MP3 file from MEMFS
      const outputData = (await this.ffmpeg.readFile(outputName)) as Uint8Array;
      const blob = new Blob([outputData.buffer], { type: 'audio/mp3' });

      // Generate clean output filename
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const finalFileName = `${baseName}.mp3`;

      if (onProgress) onProgress(100);

      return {
        blob,
        size: blob.size,
        outputName: finalFileName,
      };
    } finally {
      // 5. Memory Reclamation (CRITICAL to prevent OOM)
      this.ffmpeg.off('progress', progressHandler);
      try {
        await this.ffmpeg.deleteFile(inputName);
      } catch {
        // ignore if already absent
      }
      try {
        await this.ffmpeg.deleteFile(outputName);
      } catch {
        // ignore if already absent
      }

      this.notify('ready', 'Sẵn sàng');
    }
  }
}

export const ffmpegService = FFmpegService.getInstance();
