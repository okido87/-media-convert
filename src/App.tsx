import React from 'react';
import { Header } from './components/layout/Header';
import { Dropzone } from './components/dropzone/Dropzone';
import { SettingsBar } from './components/settings/SettingsBar';
import { QueueList } from './components/queue/QueueList';
import { useQueueStore } from './store/use-queue-store';
import { ShieldCheck, Zap, Scissors, HardDriveDownload } from 'lucide-react';

export const App: React.FC = () => {
  const items = useQueueStore((state) => state.items);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Xử lý cục bộ bằng WebAssembly & FFmpeg Core</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Chuyển Đổi <span className="bg-gradient-to-r from-brand-400 to-emerald-300 bg-clip-text text-transparent">MP4 Sang MP3</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Trích xuất âm thanh chất lượng phòng thu từ video của bạn ngay trên trình duyệt. Không cần cài đặt phần mềm, không giới hạn tốc độ và an toàn bảo mật tuyệt đối.
          </p>
        </div>

        {/* Upload Dropzone */}
        <Dropzone />

        {/* Settings & Controls when files exist */}
        {items.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <SettingsBar />
            <QueueList />
          </div>
        )}

        {/* Key Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center border border-brand-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">100% Riêng Tư & An Toàn</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dữ liệu video của bạn hoàn toàn không bao giờ được gửi lên bất kỳ máy chủ nào. Mọi thao tác giải mã và nén âm thanh diễn ra trực tiếp trong RAM máy của bạn.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Scissors className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Cắt Đoạn Âm Thanh Linh Hoạt</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nghe trước video và cắt lấy chính xác đoạn âm thanh bạn cần với thanh trượt trực quan trước khi bắt đầu chuyển đổi.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <HardDriveDownload className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">Xử Lý Hàng Loạt & Tải ZIP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Thêm hàng chục video cùng lúc. Hệ thống sẽ tự động xếp hàng tuần tự để tiết kiệm tài nguyên và cho phép tải toàn bộ file MP3 thành gói ZIP duy nhất.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-400">
        <p>MediaConvert • Powered by FFmpeg WebAssembly • Built with React & Vite</p>
      </footer>
    </div>
  );
};

export default App;
