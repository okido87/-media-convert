import React, { useState } from 'react';
import { useSettingsStore } from '../../store/use-settings-store';
import { useQueueStore } from '../../store/use-queue-store';
import type { AudioBitrate, AudioSampleRate } from '../../core/ffmpeg-types';
import { exportCompletedItemsAsZip } from '../../utils/zip-exporter';
import {
  Play,
  Download,
  Trash2,
  Settings2,
  Sliders,
  CheckCheck,
  Loader2,
} from 'lucide-react';

export const SettingsBar: React.FC = () => {
  const { bitrate, sampleRate, setBitrate, setSampleRate } = useSettingsStore();
  const {
    items,
    isConverting,
    startConversion,
    clearCompleted,
    clearAll,
  } = useQueueStore();

  const [isZipping, setIsZipping] = useState(false);
  const [zipPercent, setZipPercent] = useState(0);

  const idleCount = items.filter((i) => i.status === 'idle').length;
  const completedItems = items.filter((i) => i.status === 'completed');

  const handleDownloadZip = async () => {
    if (completedItems.length === 0 || isZipping) return;
    setIsZipping(true);
    setZipPercent(0);
    try {
      await exportCompletedItemsAsZip(completedItems, (pct) => {
        setZipPercent(pct);
      });
    } finally {
      setIsZipping(false);
      setZipPercent(0);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-xl">
      {/* Settings configuration */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <Settings2 className="w-4 h-4 text-brand-400" />
          <span>Cấu hình xuất MP3:</span>
        </div>

        {/* Bitrate selection */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Bitrate:</span>
          <select
            value={bitrate}
            disabled={isConverting}
            onChange={(e) => setBitrate(e.target.value as AudioBitrate)}
            className="bg-transparent text-xs font-semibold text-brand-300 focus:outline-none cursor-pointer"
          >
            <option value="128k" className="bg-slate-900 text-slate-200">128 kbps (Standard)</option>
            <option value="192k" className="bg-slate-900 text-slate-200">192 kbps (High Quality)</option>
            <option value="256k" className="bg-slate-900 text-slate-200">256 kbps (Very High)</option>
            <option value="320k" className="bg-slate-900 text-slate-200">320 kbps (Studio Max)</option>
            <option value="vbr" className="bg-slate-900 text-slate-200">VBR V2 (Dynamic)</option>
          </select>
        </div>

        {/* Sample Rate selection */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 rounded-xl px-2.5 py-1.5">
          <span className="text-xs text-slate-400 font-medium">Sample Rate:</span>
          <select
            value={sampleRate}
            disabled={isConverting}
            onChange={(e) => setSampleRate(Number(e.target.value) as AudioSampleRate)}
            className="bg-transparent text-xs font-semibold text-brand-300 focus:outline-none cursor-pointer"
          >
            <option value={44100} className="bg-slate-900 text-slate-200">44,100 Hz (CD)</option>
            <option value={48000} className="bg-slate-900 text-slate-200">48,000 Hz (Studio)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
        {completedItems.length > 0 && (
          <>
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang nén ZIP ({zipPercent}%)...
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Tải tất cả ({completedItems.length}) .ZIP
                </>
              )}
            </button>

            <button
              onClick={clearCompleted}
              disabled={isConverting}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Xóa các file đã hoàn thành"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              Dọn hoàn tất
            </button>
          </>
        )}

        {items.length > 0 && (
          <button
            onClick={clearAll}
            disabled={isConverting}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-700/50 transition-colors"
            title="Xóa toàn bộ hàng đợi"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa hết
          </button>
        )}

        <button
          onClick={startConversion}
          disabled={isConverting || idleCount === 0}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg ${
            isConverting
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-not-allowed'
              : idleCount === 0
              ? 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              : 'bg-brand-500 hover:bg-brand-400 text-slate-950 shadow-brand-500/25 hover:scale-[1.02]'
          }`}
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              Đang chuyển đổi...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Chuyển đổi {idleCount > 0 ? `(${idleCount})` : ''}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
