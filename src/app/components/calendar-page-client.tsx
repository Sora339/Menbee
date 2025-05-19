'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';

import InterviewSlotsList from '@/app/components/interview-list';
import type { CalendarEvent } from '@/lib/calendar-service';
import { InterviewSlot } from '../../../type';
import { getInterviewSlots } from '../actions/interviewList';
import CalendarEventsList from './calender_events_list';
import InterviewSettingsForm from './interview_setting_form';
import FormSubmitButton from './form-submit-button';

// イベント設定のためのスキーマ定義
const formSchema = z.object({
  date_range: z.string().refine(
    (val) => {
      if (!val) return false;
      try {
        const parsed = JSON.parse(val);
        return parsed && parsed.from !== undefined;
      } catch {
        return false;
      }
    },
    {
      message: "面接予定期間を選択してください。",
    }
  ),
  days: z.array(z.string()).min(1, {
    message: "少なくとも1つの曜日を選択してください。",
  }),
  start_time: z.string().min(1, {
    message: "開始時間を入力してください。",
  }),
  end_time: z.string().min(1, {
    message: "終了時間を入力してください。",
  }),
  minimum_duration: z.number().min(30).default(30),
  events: z
    .array(
      z.object({
        id: z.string(),
        selected: z.boolean().default(true),
        bufferBefore: z.number().default(0),
        bufferAfter: z.number().default(0),
      })
    )
    .default([]),
});

type FormSchema = z.infer<typeof formSchema>;

export const daysOfWeek = [
  { label: "月曜日", value: "monday" },
  { label: "火曜日", value: "tuesday" },
  { label: "水曜日", value: "wednesday" },
  { label: "木曜日", value: "thursday" },
  { label: "金曜日", value: "friday" },
  { label: "土曜日", value: "saturday" },
  { label: "日曜日", value: "sunday" },
] as const;

interface CalendarPageClientProps {
  initialEvents: CalendarEvent[];
}

export default function CalendarPageClient({
  initialEvents,
}: CalendarPageClientProps) {
  // モーダル関連の状態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviewSlots, setInterviewSlots] = useState<InterviewSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // フォームの初期化
  const methods = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_range: "",
      days: daysOfWeek.map((day) => day.value),
      start_time: "",
      end_time: "",
      minimum_duration: 30,
      events: initialEvents.map((event) => ({
        id: event.id,
        selected: true,
        bufferBefore: 0,
        bufferAfter: 0,
      })),
    },
  });

  // フォーム送信ハンドラ
  async function onSubmit(values: FormSchema) {
    // フィルタリングされたイベント情報を取得する関数
    const getFilteredEventsData = () => {
      // 日付範囲を解析
      let dateRange: { from?: Date; to?: Date } = { from: undefined, to: undefined };
      if (values.date_range) {
        try {
          const { from: rawFrom, to: rawTo } = JSON.parse(values.date_range);
          dateRange = {
            from: rawFrom ? new Date(rawFrom) : undefined,
            to: rawTo ? new Date(rawTo) : undefined,
          };
        } catch {
          // エラーの場合はデフォルト値を使用
        }
      }

      // 選択された曜日
      const validDays = values.days ?? [];

      // イベントをフィルタリング
      const filteredEvents = initialEvents.filter((event) => {
        const eventStart = event.start.dateTime
          ? new Date(event.start.dateTime)
          : event.start.date
          ? new Date(event.start.date)
          : null;
        if (!eventStart) return false;

        // 範囲の判定
        if (dateRange.from && eventStart < dateRange.from) return false;
        if (dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          if (eventStart > endDate) return false;
        }

        // 曜日でフィルタリング
        const dayNames = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ] as const;
        const day = dayNames[eventStart.getDay()];
        return validDays.includes(day);
      });

      return filteredEvents;
    };

    // フォームデータを整形
    const formDataWithCalendar = {
      ...values,
      calendarData: getFilteredEventsData(),
    };

    setIsLoading(true);
    setActionError(null);

    try {
      // Server Actionを直接呼び出し
      const result = await getInterviewSlots(formDataWithCalendar);

      if (result.success && result.slots) {
        setInterviewSlots(result.slots);
        setIsModalOpen(true);
      } else {
        setActionError(result.message || "面接可能時間の取得に失敗しました");
        console.error("Error details:", result.error);
      }
    } catch (error) {
      setActionError("処理中にエラーが発生しました");
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto relative mt-6 lg:mt-8">
      <div className="p-6 container mx-auto">
        {/* モーダルコンポーネント */}
        <InterviewSlotsList
          slots={interviewSlots}
          isLoading={isLoading}
          error={actionError}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex lg:grid lg:grid-cols-2 gap-12 h-fit flex-col-reverse">
              {/* カレンダーイベントリスト */}
              <CalendarEventsList
                calendarEvents={initialEvents}
              />

              {/* 面接設定フォーム */}
              <InterviewSettingsForm />
            </div>

            {/* 送信ボタン */}
            <FormSubmitButton isLoading={isLoading} />
          </form>
        </FormProvider>
      </div>
    </div>
  );
}