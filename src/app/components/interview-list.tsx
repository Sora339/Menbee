"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/glass-card";

interface InterviewSlot {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  formatted: string;
}

export default function InterviewSlotsList({ formData }: { formData: any }) {
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviewSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/interview-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "面接候補時間の取得に失敗しました");
      }

      const data = await response.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.error("面接候補時間の取得エラー:", err);
      setError((err as Error).message || "面接候補時間の計算に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData) {
      console.log("InterviewSlotsList - 受信データ:", formData);
      if (!formData.calendarData || formData.calendarData.length === 0) {
        setError("カレンダーイベントデータが存在しません。予定情報を取得してください。");
        setLoading(false);
        return;
      }
      fetchInterviewSlots();
    }
  }, [formData]);

  if (loading) return <div className="text-white">読み込み中...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (slots.length === 0) return <div>条件に合う面接候補時間はありません。条件を変更してください。</div>;

  return (
    
    <div>
           <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                            面接候補時間一覧
                            </h2>
                            <GlassCard className="h-[600px] w-fit p-4 overflow-y-scroll custom-scrollbar">

      {slots.map((slot, index) => (
        <div key={index} className="py-1 text-white text-center">
          ・{slot.formatted}
        </div>
      ))}
                            </GlassCard>
    </div>
  );
}