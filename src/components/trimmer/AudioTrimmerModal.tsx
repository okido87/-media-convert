import React, { useState, useRef, useEffect } from 'react';
import type { QueueItem } from '../../store/use-queue-store';
import { formatDuration } from '../../utils/format';
import {
  X,
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Check,
  Clock,
} from 'lucide-react';

interface AudioTrimmerModalProps {
  item: QueueItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTrim: (id: string, start: number, end: number) => void;
}

export const AudioTrimmerModal: React.FC<AudioTrimmerModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaveTrim,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const duration = item?.duration || 0;
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(duration);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize video URL and trim range when modal opens
  useEffect(() => {
    if (isOpen && item) {
      const url = URL.createObjectURL(item.file);
      setVideoUrl(url);

      const existingTrim = item.options.trimRange;
      const initialStart = existingTrim?.start ?? 0;
      const initialEnd = existingTrim?.end && existingTrim.end > 0 ? existingTrim.end : item.duration;

      setStart(initialStart);
      setEnd(initialEnd > 0 ? initialEnd : item.duration);
      setCurrentTime(initialStart);

      return () => {
        URL.revokeObjectURL(url);
        setVideoUrl(null);
      };
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // Auto pause if reached end of trim range
      if (end > 0 && time >= end) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= end || currentTime < start) {
        videoRef.current.currentTime = start;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const playTrimmedSegment = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = start;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSetCurrentAsStart = () => {
    if (currentTime < end) {
      setStart(currentTime);
    }
  };

  const handleSetCurrentAsEnd = () => {
    if (currentTime > start) {
      setEnd(currentTime);
    }
  };

  const handleResetFull = () => {
    setStart(0);
    setEnd(duration);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleSave = () => {
    onSaveTrim(item.id, start, end);
    onClose();
  };

  const trimDuration = Math.max(0, end - start);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white truncate max-w-md">
                Cắt đoạn âm thanh: {item.name}
              </h3>
              <p className="text-xs text-slate-400">
                Độ dài gốc: {formatDuration(duration)} | Đoạn cắt: {formatDuration(trimDuration)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black flex items-center justify-center aspect-video max-h-72 overflow-hidden">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-full object-contain"
            />
          )}

          {/* Quick Play Overlay Button */}
          <button
            onClick={togglePlay}
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm border border-slate-700/60 shadow-lg"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Tạm dừng' : 'Phát'}</span>
            <span className="text-slate-400 font-mono">({formatDuration(currentTime)})</span>
          </button>
        </div>

        {/* Trimming Controls */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Dual range visual bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Bắt đầu: <strong className="text-brand-400 font-mono">{formatDuration(start)}</strong></span>
              <span>Thời lượng xuất: <strong className="text-white font-mono">{formatDuration(trimDuration)}</strong></span>
              <span>Kết thúc: <strong className="text-brand-400 font-mono">{formatDuration(end)}</strong></span>
            </div>

            {/* Slider track */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 flex items-center justify-between mb-1">
                  <span>Điểm bắt đầu (Start Time):</span>
                  <span className="font-mono text-brand-300 text-xs">{start.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, end - 0.5)}
                  step={0.1}
                  value={start}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStart(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 flex items-center justify-between mb-1">
                  <span>Điểm kết thúc (End Time):</span>
                  <span className="font-mono text-brand-300 text-xs">{end.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min={Math.min(duration, start + 0.5)}
                  max={duration || 100}
                  step={0.1}
                  value={end}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEnd(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleSetCurrentAsStart}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-brand-400" />
                Lấy mốc hiện tại làm Bắt đầu
              </button>
              <button
                type="button"
                onClick={handleSetCurrentAsEnd}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-brand-400" />
                Lấy mốc hiện tại làm Kết thúc
              </button>
              <button
                type="button"
                onClick={playTrimmedSegment}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 border border-brand-500/30 flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-current" />
                Nghe thử đoạn cắt
              </button>
              <button
                type="button"
                onClick={handleResetFull}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/60 hover:bg-slate-800 text-slate-400 flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Lấy toàn bộ
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-md shadow-brand-500/20 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Lưu đoạn cắt ({formatDuration(trimDuration)})
          </button>
        </div>
      </div>
    </div>
  );
};
