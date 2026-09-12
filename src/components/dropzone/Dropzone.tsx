import React, { useRef, useState } from 'react';
import { useQueueStore } from '../../store/use-queue-store';
import { UploadCloud, Film, CheckCircle2, Shield } from 'lucide-react';

export const Dropzone: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFiles = useQueueStore((state) => state.addFiles);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAdding(true);
    try {
      const validFiles: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Accept video files
        if (
          file.type.startsWith('video/') ||
          /\.(mp4|m4v|mov|webm|mkv|avi)$/i.test(file.name)
        ) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        await addFiles(validFiles);
      }
    } finally {
      setIsAdding(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-12 transition-all duration-300 text-center overflow-hidden ${
        isDragOver
          ? 'border-brand-400 bg-brand-500/10 scale-[1.01] shadow-2xl shadow-brand-500/10'
          : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/x-m4v,video/*,.mp4,.m4v,.mov,.webm,.mkv"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center gap-4 relative z-10">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 ${
            isDragOver
              ? 'scale-110 bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/30'
              : 'bg-slate-800 text-brand-400 group-hover:scale-105 group-hover:bg-slate-700'
          }`}
        >
          {isAdding ? (
            <div className="w-8 h-8 border-3 border-brand-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-8 h-8 stroke-[2.2]" />
          )}
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-lg font-semibold text-white">
            {isAdding
              ? 'Đang đọc thông tin tệp...'
              : 'Kéo thả tệp video MP4 vào đây, hoặc bấm để chọn'}
          </h3>
          <p className="text-sm text-slate-400">
            Hỗ trợ MP4, M4V, MOV, WebM, MKV. Tự động trích xuất âm thanh và chuyển đổi sang MP3 chất lượng cao.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            <Film className="w-3.5 h-3.5 text-brand-400" /> Hỗ trợ nhiều file cùng lúc
          </span>
          <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Tùy chỉnh Bitrate 128k - 320k
          </span>
          <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/50">
            <Shield className="w-3.5 h-3.5 text-brand-400" /> Bảo mật 100% Client-side
          </span>
        </div>
      </div>
    </div>
  );
};
