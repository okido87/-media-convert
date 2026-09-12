import JSZip from 'jszip';
import type { QueueItem } from '../store/use-queue-store';

export async function exportCompletedItemsAsZip(
  completedItems: QueueItem[],
  onProgress?: (percent: number) => void
): Promise<void> {
  if (completedItems.length === 0) return;

  const zip = new JSZip();
  const folder = zip.folder('mediaconvert_mp3s');

  for (const item of completedItems) {
    if (item.resultBlob) {
      const baseName = item.name.replace(/\.[^/.]+$/, '');
      folder?.file(`${baseName}.mp3`, item.resultBlob);
    }
  }

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 5 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  // Trigger browser download
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mediaconvert_batch_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
