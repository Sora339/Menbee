'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { InterviewSlot } from '../../type';


interface InterviewSlotsListProps {
  slots: InterviewSlot[];
  isLoading: boolean;
  error: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InterviewSlotsList({
  slots,
  isLoading,
  error,
  isOpen,
  onClose,
}: InterviewSlotsListProps) {
  const [isCopied, setIsCopied] = useState(false);

  // リストをコピーする関数
  const copyToClipboard = async () => {
    if (slots.length === 0) return;

    try {
      const textToCopy = slots.map((slot) => `・${slot.formatted}`).join('\n');
      await navigator.clipboard.writeText(textToCopy);

      setIsCopied(true);

      // 3秒後にコピー状態をリセット
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  };

  const renderContent = () => {
    if (isLoading) return <div className="text-center py-8">読み込み中...</div>;
    if (error)
      return <div className="text-red-600 text-center py-8">{error}</div>;
    if (slots.length === 0)
      return (
        <div className="text-center py-8">
          条件に合う面接候補時間はありません。条件を変更してください。
        </div>
      );

    return (
      <GlassCard className="h-[400px] w-full p-4 overflow-y-scroll custom-scrollbar">
        {slots.map((slot, index) => (
          <div key={index} className="py-1 text-white text-center">
            ・{slot.formatted}
          </div>
        ))}
      </GlassCard>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm sm:max-w-md bg-black/40 rounded-lg backdrop-blur-xl border border-white/20 text-white [&>button:last-child]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-2xl text-left font-bold mb-2 bg-clip-text text-white">
              面接候補時間一覧
            </DialogTitle>
            <DialogDescription className="text-white/80">
              以下の時間帯が面接可能な候補時間です
            </DialogDescription>
          </div>

          {slots.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-none bg-gradient-to-r from-cyan-600 to-indigo-600 hover:bg-gradient-to-l"
              onClick={copyToClipboard}
              title="リストをコピー"
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-violet-300" />
              )}
              <span className="sr-only">リストをコピー</span>
            </Button>
          )}
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="!justify-center">
          <div className="flex justify-center">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 w-fit"
            >
              閉じる
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}