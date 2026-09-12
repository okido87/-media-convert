import React from 'react';
import type { QueueItem } from '../../store/use-queue-store';
import { formatBytes, formatDuration, formatBitrate } from '../../utils/format';
import {
  FileVideo,
  Music,
  Scissors,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface QueueItemCardProps {
  item: QueueItem;
  onOpenTrimmer: (item: QueueItem) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

export const QueueItemCard: React.FC<QueueItemCardProps> = ({
  item,
  onOpenTrimmer,
  onRemove,
  onRetry,
}) => {
  const isTrimmed =
    item.options.trimRange &&
    item.duration > 0 &&
    (item.options.trimRange.start > 0 ||
      item.options.trimRange.end < item.duration - 0.5);

  const trimDuration = item.options.trimRange
    ? item.options.trimRange.end - item.options.trimRange.start
    : item.duration;

  const handleDownload = () => {
    if (!item.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    a.download = `${baseName}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Icon & File Meta */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              item.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : item.status === 'processing'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                : item.status === 'failed'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700/60'
            }`}
          >
            {item.status === 'completed' ? (
              <Music className="w-6 h-6 stroke-[2]" />
            ) : item.status === 'processing' ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            ) : item.status === 'failed' ? (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            ) : (
              <FileVideo className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white truncate max-w-sm sm:max-w-md" title={item.name}>
                {item.name}
              </h4>
              {isTrimmed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <Scissors className="w-3 h-3" />
                  {formatDuration(item.options.trimRange!.start)} - {formatDuration(item.options.trimRange!.end)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1 font-medium">
              <span>{formatBytes(item.size)}</span>
              <span>•</span>
              <span>Thời lượng: {formatDuration(isTrimmed ? trimDuration : item.duration)}</span>
              <span>•</span>
              <span className="text-brand-400">{formatBitrate(item.options.bitrate)}</span>
              <span>•</span>
              <span>{item.options.sampleRate / 1000} kHz</span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {item.status === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => onOpenTrimmer(item)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Cắt lấy một đoạn trong video"
              >
                <Scissors className="w-3.5 h-3.5 text-brand-400" />
                <span>Cắt đoạn</span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {item.status === 'processing' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 font-mono">
                {item.progress}%
              </span>
            </div>
          )}

          {item.status === 'completed' && (
            <>
              <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Xong
                </span>
                {item.resultSize && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    {formatBytes(item.resultSize)}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Tải MP3</span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                title="Xóa khỏi danh sách"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {item.status === 'failed' && (
            <>
              <button
                type="button"
                onClick={() => onRetry(item.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>

              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress Bar for Processing State */}
      {item.status === 'processing' && (
        <div className="mt-3 pt-3 border-t border-slate-800/80">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-brand-400 transition-all duration-200 rounded-full"
              style={{ width: `${Math.max(5, item.progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message for Failed State */}
      {item.status === 'failed' && item.error && (
        <div className="mt-3 pt-2 text-xs text-rose-400/90 flex items-center gap-1.5 border-t border-rose-950/40">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{item.error}</span>
        </div>
      )}
    </div>
  );
};
