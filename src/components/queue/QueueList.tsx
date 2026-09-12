import React, { useState } from 'react';
import { useQueueStore, type QueueItem } from '../../store/use-queue-store';
import { QueueItemCard } from './QueueItemCard';
import { AudioTrimmerModal } from '../trimmer/AudioTrimmerModal';
import { ListOrdered, CheckCircle, Clock } from 'lucide-react';

export const QueueList: React.FC = () => {
  const { items, removeItem, retryItem, updateItemOptions } = useQueueStore();
  const [selectedTrimItem, setSelectedTrimItem] = useState<QueueItem | null>(null);

  const handleSaveTrim = (id: string, start: number, end: number) => {
    updateItemOptions(id, {
      trimRange: { start, end },
    });
  };

  if (items.length === 0) {
    return null;
  }

  const completedCount = items.filter((i) => i.status === 'completed').length;
  const processingCount = items.filter((i) => i.status === 'processing').length;
  const pendingCount = items.filter((i) => i.status === 'idle').length;

  return (
    <div className="space-y-4">
      {/* Queue Header summary */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-white">
            Danh sách tệp xử lý ({items.length})
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          {pendingCount > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" /> {pendingCount} chờ
            </span>
          )}
          {processingCount > 0 && (
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              {processingCount} đang xử lý
            </span>
          )}
          {completedCount > 0 && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> {completedCount} hoàn thành
            </span>
          )}
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {items.map((item) => (
          <QueueItemCard
            key={item.id}
            item={item}
            onOpenTrimmer={(it) => setSelectedTrimItem(it)}
            onRemove={removeItem}
            onRetry={retryItem}
          />
        ))}
      </div>

      {/* Audio Trimmer Modal */}
      <AudioTrimmerModal
        item={selectedTrimItem}
        isOpen={selectedTrimItem !== null}
        onClose={() => setSelectedTrimItem(null)}
        onSaveTrim={handleSaveTrim}
      />
    </div>
  );
};
