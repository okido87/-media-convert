import React, { useEffect, useState } from 'react';
import { ffmpegService } from '../../core/ffmpeg-service';
import type { EngineState } from '../../core/ffmpeg-types';
import { Cpu, ShieldCheck, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const [engineState, setEngineState] = useState<EngineState>(ffmpegService.getState());

  useEffect(() => {
    const unsubscribe = ffmpegService.subscribe((state) => {
      setEngineState(state);
    });
    // Trigger lazy init in background
    ffmpegService.initialize().catch(() => {});
    return unsubscribe;
  }, []);

  const getStatusBadge = () => {
    switch (engineState.status) {
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Đang tải WASM Engine...
          </span>
        );
      case 'ready':
      case 'transcoding':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            <Cpu className="w-3.5 h-3.5" />
            {engineState.mode === 'multi-thread' ? 'WASM Đa luồng' : 'WASM Đơn luồng'} Sẵn sàng
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Lỗi nạp Engine
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Khởi động...
          </span>
        );
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">MediaConvert</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                WASM v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Trích xuất âm thanh MP4 sang MP3 100% trong trình duyệt</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400/90 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800/40">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Riêng tư (Không upload)</span>
          </div>
          {getStatusBadge()}
        </div>
      </div>
    </header>
  );
};
