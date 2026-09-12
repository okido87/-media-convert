import { create } from 'zustand';
import type { TranscodeOptions } from '../core/ffmpeg-types';
import { ffmpegService } from '../core/ffmpeg-service';
import { useSettingsStore } from './use-settings-store';

export type QueueStatus = 'idle' | 'processing' | 'completed' | 'failed';

export interface QueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number; // in seconds
  options: TranscodeOptions;
  status: QueueStatus;
  progress: number; // 0 to 100
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  error?: string;
  createdAt: number;
}

interface QueueState {
  items: QueueItem[];
  isConverting: boolean;
  activeItemId: string | null;
  addFiles: (files: File[]) => Promise<void>;
  updateItemOptions: (id: string, options: Partial<TranscodeOptions>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  startConversion: () => Promise<void>;
  retryItem: (id: string) => Promise<void>;
}

// Extract video duration using HTML5 video metadata
const probeVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const tempUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(video.duration || 0);
    };

    video.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(0);
    };

    video.src = tempUrl;
  });
};

export const useQueueStore = create<QueueState>((set, get) => ({
  items: [],
  isConverting: false,
  activeItemId: null,

  addFiles: async (files: File[]) => {
    const currentBitrate = useSettingsStore.getState().bitrate;
    const currentSampleRate = useSettingsStore.getState().sampleRate;

    const newItems: QueueItem[] = [];

    for (const file of files) {
      const duration = await probeVideoDuration(file);
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        duration,
        options: {
          bitrate: currentBitrate,
          sampleRate: currentSampleRate,
          trimRange: duration > 0 ? { start: 0, end: duration } : null,
          volume: 1,
        },
        status: 'idle',
        progress: 0,
        createdAt: Date.now(),
      });
    }

    set((state) => ({
      items: [...state.items, ...newItems],
    }));
  },

  updateItemOptions: (id: string, newOptions: Partial<TranscodeOptions>) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              options: { ...item.options, ...newOptions },
            }
          : item
      ),
    }));
  },

  removeItem: (id: string) => {
    const item = get().items.find((i) => i.id === id);
    if (item?.resultUrl) {
      URL.revokeObjectURL(item.resultUrl);
    }

    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  clearCompleted: () => {
    get().items.forEach((item) => {
      if (item.status === 'completed' && item.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
    });

    set((state) => ({
      items: state.items.filter((i) => i.status !== 'completed'),
    }));
  },

  clearAll: () => {
    get().items.forEach((item) => {
      if (item.resultUrl) {
        URL.revokeObjectURL(item.resultUrl);
      }
    });

    set({ items: [], isConverting: false, activeItemId: null });
  },

  startConversion: async () => {
    if (get().isConverting) return;

    set({ isConverting: true });

    try {
      while (true) {
        // Find next idle or failed item
        const nextItem = get().items.find((i) => i.status === 'idle');
        if (!nextItem) break;

        set({ activeItemId: nextItem.id });

        // Update item to processing
        set((state) => ({
          items: state.items.map((i) =>
            i.id === nextItem.id ? { ...i, status: 'processing', progress: 0, error: undefined } : i
          ),
        }));

        try {
          const result = await ffmpegService.transcode(
            nextItem.file,
            nextItem.options,
            (progress) => {
              set((state) => ({
                items: state.items.map((i) =>
                  i.id === nextItem.id ? { ...i, progress } : i
                ),
              }));
            }
          );

          const resultUrl = URL.createObjectURL(result.blob);

          set((state) => ({
            items: state.items.map((i) =>
              i.id === nextItem.id
                ? {
                    ...i,
                    status: 'completed',
                    progress: 100,
                    resultBlob: result.blob,
                    resultUrl,
                    resultSize: result.size,
                  }
                : i
            ),
          }));
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
          set((state) => ({
            items: state.items.map((i) =>
              i.id === nextItem.id
                ? {
                    ...i,
                    status: 'failed',
                    error: errorMessage,
                  }
                : i
            ),
          }));
        }
      }
    } finally {
      set({ isConverting: false, activeItemId: null });
    }
  },

  retryItem: async (id: string) => {
    const item = get().items.find((i) => i.id === id);
    if (!item) return;

    if (item.resultUrl) {
      URL.revokeObjectURL(item.resultUrl);
    }

    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status: 'idle', progress: 0, error: undefined, resultBlob: undefined, resultUrl: undefined } : i
      ),
    }));

    get().startConversion();
  },
}));
