'use client';

import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { GlassCard } from '@/components/ui/glass-card';
import { NumberInput } from '@/components/ui/number-input';
import type { CalendarEvent } from '@/lib/calendar-service';

interface CalendarEventsListProps {
  calendarEvents: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  setFilteredEvents: (events: CalendarEvent[]) => void;
  sortAndFilterEvents: (
    events: CalendarEvent[],
    range: { from?: Date; to?: Date },
    validDays: string[]
  ) => CalendarEvent[];
  dateRange: { from?: Date; to?: Date };
  setDateRange: (range: { from?: Date; to?: Date }) => void;
}

export default function CalendarEventsList({
  calendarEvents,
  filteredEvents,
  setFilteredEvents,
  sortAndFilterEvents,
  dateRange,
  setDateRange,
}: CalendarEventsListProps) {
  const { control, getValues, setValue } = useFormContext();

  // date_rangeとdaysの値を監視
  const dateRangeValue = useWatch({
    control,
    name: 'date_range',
  });

  const selectedDays = useWatch({
    control,
    name: 'days',
  });

  // 日付範囲と曜日が変更されたときにイベントを再フィルタリング
  // 日付範囲と曜日が変更されたときにイベントを再フィルタリング
  useEffect(() => {
    const validDays = selectedDays ?? [];

    let sorted: CalendarEvent[];
    let newRange = { ...dateRange };
    
    if (dateRangeValue) {
      try {
        const { from: rawFrom, to: rawTo } = JSON.parse(dateRangeValue);
        newRange = {
          from: rawFrom ? new Date(rawFrom) : undefined,
          to: rawTo ? new Date(rawTo) : undefined,
        };
        sorted = sortAndFilterEvents(calendarEvents, newRange, validDays);
      } catch {
        newRange = {};
        sorted = sortAndFilterEvents(calendarEvents, {}, validDays);
      }
    } else {
      newRange = {};
      sorted = sortAndFilterEvents(calendarEvents, {}, validDays);
    }

    // 参照比較を行い、実際に値が変わった場合のみ状態を更新
    if (JSON.stringify(newRange) !== JSON.stringify(dateRange)) {
      setDateRange(newRange);
    }
    
    // 参照比較を行い、実際に値が変わった場合のみ状態を更新
    const sortedJson = JSON.stringify(sorted);
    const filteredJson = JSON.stringify(filteredEvents);
    if (sortedJson !== filteredJson) {
      setFilteredEvents(sorted);
    }

    // events配列を更新（既存のロジックを保持）
    const currentEvents = getValues('events');
    const updatedEvents = sorted.map((event) => {
      const existing = currentEvents.find((e: { id: string }) => e.id === event.id);
      return {
        id: event.id,
        selected: existing?.selected ?? true,
        bufferBefore: existing?.bufferBefore ?? 0,
        bufferAfter: existing?.bufferAfter ?? 0,
      };
    });

    const currentJson = JSON.stringify(currentEvents);
    const updatedJson = JSON.stringify(updatedEvents);
    
    if (currentJson !== updatedJson) {
      setValue('events', updatedEvents);
    }
  }, [
    dateRangeValue,
    selectedDays,
    calendarEvents,
    dateRange,
    filteredEvents,
    getValues,
    setValue,
    sortAndFilterEvents,
    setDateRange,
    setFilteredEvents
  ]);

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
                          開始:{' '}
                          {event.start.dateTime
                            ? format(
                                new Date(event.start.dateTime),
                                'yyyy/MM/dd HH:mm'
                              )
                            : event.start.date
                            ? format(
                                new Date(event.start.date),
                                'yyyy/MM/dd'
                              )
                            : '日付未定'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 w-fit">
                          終了:{' '}
                          {event.end.dateTime
                            ? format(
                                new Date(event.end.dateTime),
                                'yyyy/MM/dd HH:mm'
                              )
                            : event.end.date
                            ? format(
                                new Date(event.end.date),
                                'yyyy/MM/dd'
                              )
                            : '日付未定'}
                        </p>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:w-[30%] md:w-[270px] xl:w-[260px] mt-2 md:mt-0 ml-auto text-right">
                        {/* 時間指定のある予定のみ余裕時間を表示 */}
                        {event.start.dateTime && (
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
                        {event.end.dateTime && (
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