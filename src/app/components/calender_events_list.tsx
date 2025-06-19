'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/glass-card';
import { NumberInput } from '@/components/ui/number-input';
import { FormattedCalendarEvent } from '../../type';

interface CalendarEventsListProps {
  events: FormattedCalendarEvent[];
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function CalendarEventsList({
  events,
}: CalendarEventsListProps) {
  'use memo';
  
  const { control, setValue, getValues } = useFormContext();

  // フォームの値を監視
  const dateRangeValue = useWatch({
    control,
    name: 'date_range',
  });

  const selectedDays = useWatch({
    control,
    name: 'days',
  });

  // イベントをソートして日付範囲でフィルターする関数
  const sortAndFilterEvents = (
    events: FormattedCalendarEvent[],
    range: DateRange,
    validDays: string[]
  ): FormattedCalendarEvent[] => {
    
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = a.startDateTime
        ? new Date(a.startDateTime)
        : a.startDate
        ? new Date(a.startDate)
        : new Date(0);
      const dateB = b.startDateTime
        ? new Date(b.startDateTime)
        : b.startDate
        ? new Date(b.startDate)
        : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedEvents.filter((event) => {
      const eventStart = event.startDateTime
        ? new Date(event.startDateTime)
        : event.startDate
        ? new Date(event.startDate)
        : null;
      if (!eventStart) return false;

      // 範囲の判定
      if (range.from && eventStart < range.from) return false;
      if (range.to) {
        const endDate = new Date(range.to);
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
      ];
      const day = dayNames[eventStart.getDay()];
      return validDays.includes(day);
    });
  };

  // 日付範囲を解析
  // React Compilerにより自動的にメモ化される
  const dateRange: DateRange = (() => {
    if (!dateRangeValue) {
      return { from: undefined, to: undefined };
    }
    
    try {
      const { from: rawFrom, to: rawTo } = JSON.parse(dateRangeValue);
      return {
        from: rawFrom ? new Date(rawFrom) : undefined,
        to: rawTo ? new Date(rawTo) : undefined,
      };
    } catch {
      return { from: undefined, to: undefined };
    }
  })();

  // フィルタリングされたイベント
  // React Compilerにより自動的にメモ化される
  const filteredEvents = (() => {
    const validDays = selectedDays ?? [];
    return sortAndFilterEvents(events, dateRange, validDays);
  })();

  // フォームのevents配列を更新
  // React Compilerにより依存関係が自動で管理される
  const updateFormEvents = () => {
    const currentEvents = getValues('events');
    const updatedEvents = filteredEvents.map((event) => {
      const existing = currentEvents.find((e: { id: string }) => e.id === event.id);
      return {
        id: event.id,
        selected: existing?.selected ?? true,
        bufferBefore: existing?.bufferBefore ?? 0,
        bufferAfter: existing?.bufferAfter ?? 0,
      };
    });

    // フォームの値を同期（参照が変わった場合のみ）
    const currentJson = JSON.stringify(currentEvents);
    const updatedJson = JSON.stringify(updatedEvents);
    
    if (currentJson !== updatedJson) {
      // setValueの呼び出しはレンダリング中ではなく、副作用として実行
      setTimeout(() => {
        setValue('events', updatedEvents);
      }, 0);
    }

    return updatedEvents;
  };

  // 副作用として実行
  updateFormEvents();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h2 className="text-2xl font-bold mb-1 text-white">
        あなたの予定
      </h2>
      <div className="mb-4">
        <span className="text-white/80 font-sans">
          すでに入っている予定に関する設定です
        </span>
      </div>
      <GlassCard className="h-[600px] p-4 overflow-y-scroll custom-scrollbar">
        <ul className="space-y-4 pr-2">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.li
                key={`${index}-${event.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
              >
                <GlassCard className="p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    {/* イベント選択のチェックボックス */}
                    <FormField
                      control={control}
                      name={`events.${index}.selected`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-indigo-300 data-[state=checked]:bg-indigo-600"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-col sm:flex-row w-full justify-between sm:items-center">
                      <div className="w-[80%]">
                        <h3 className="text-lg font-semibold text-left">
                          {event.summary}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 w-fit">
                          開始: {event.startFormatted || '日付未定'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 w-fit">
                          終了: {event.endFormatted || '日付未定'}
                        </p>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:w-[30%] md:w-[270px] xl:w-[260px] mt-2 md:mt-0 ml-auto text-right">
                        {/* 時間指定のある予定のみ余裕時間を表示 */}
                        {event.startDateTime && (
                          <FormField
                            control={control}
                            name={`events.${index}.bufferBefore`}
                            render={({ field }) => (
                              <FormItem className="">
                                <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row justify-end md:items-center lg:items-end xl:items-center gap-1">
                                  <label className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                    前の余裕(分):
                                  </label>
                                  <FormControl>
                                    <NumberInput
                                      value={field.value}
                                      onChange={(val: number) =>
                                        field.onChange(val)
                                      }
                                      step={15}
                                      min={0}
                                      className="flex justify-end"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                        {event.endDateTime && (
                          <FormField
                            control={control}
                            name={`events.${index}.bufferAfter`}
                            render={({ field }) => (
                              <FormItem className="">
                                <div className="flex flex-col md:flex-row lg:flex-col xl:flex-row justify-end md:items-center lg:items-end xl:items-center gap-1">
                                  <label className="text-sm text-gray-600 dark:text-gray-300 text-right">
                                    後の余裕(分):
                                  </label>
                                  <FormControl>
                                    <NumberInput
                                      value={field.value}
                                      onChange={(val: number) =>
                                        field.onChange(val)
                                      }
                                      step={15}
                                      min={0}
                                      className="flex justify-end"
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.li>
            ))
          ) : (
            <p className="text-center p-4">
              {dateRange.from
                ? "選択した期間内に予定はありません。"
                : "予定はありません。"}
            </p>
          )}
        </ul>
      </GlassCard>
    </motion.div>
  );
}