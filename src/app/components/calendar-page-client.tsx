"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { GlassCard } from "@/components/ui/glass-card";

import InterviewSlotsList from "@/app/components/interview-list";
import type { CalendarEvent } from "@/lib/calendar-service";
import { NumberInput } from "@/components/ui/number-input";

// イベント設定のためのスキーマ定義
const formSchema = z.object({
  date_range: z.string().refine(
    (val) => {
      // 未入力または「日付を選択」状態の検出
      if (!val) return false;

      try {
        const parsed = JSON.parse(val);
        // from が設定されているかチェック
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

type FormValues = z.infer<typeof formSchema> & {
  calendarData: CalendarEvent[];
};

const daysOfWeek = [
  { label: "月曜日", value: "monday" },
  { label: "火曜日", value: "tuesday" },
  { label: "水曜日", value: "wednesday" },
  { label: "木曜日", value: "thursday" },
  { label: "金曜日", value: "friday" },
  { label: "土曜日", value: "saturday" },
  { label: "日曜日", value: "sunday" },
];

interface CalendarPageClientProps {
  initialEvents: CalendarEvent[];
}

export default function CalendarPageClient({
  initialEvents,
}: CalendarPageClientProps) {
  const [calendarEvents] = useState<CalendarEvent[]>(initialEvents);
  const [filteredEvents, setFilteredEvents] =
    useState<CalendarEvent[]>(initialEvents);
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // イベントをソートして日付範囲でフィルターする関数
  const sortAndFilterEvents = (
    events: CalendarEvent[],
    range: { from?: Date; to?: Date },
    validDays: string[]
  ): CalendarEvent[] => {
    const sortedEvents = [...events].sort((a, b) => {
      const dateA = a.start.dateTime
        ? new Date(a.start.dateTime)
        : a.start.date
        ? new Date(a.start.date)
        : new Date(0);
      const dateB = b.start.dateTime
        ? new Date(b.start.dateTime)
        : b.start.date
        ? new Date(b.start.date)
        : new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedEvents.filter((event) => {
      const eventStart = event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start.date
        ? new Date(event.start.date)
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

  const form = useForm<z.infer<typeof formSchema>>({
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

  const { getValues, setValue, control } = form;

  // date_rangeの値が変わるたびにイベントをフィルタリングする
  const dateRangeValue = useWatch({
    control: control,
    name: "date_range",
  });

  // CalendarPageClient の内部
  const selectedDays = useWatch({
    control: control,
    name: "days",
  });

  useEffect(() => {
    const validDays = selectedDays ?? [];

    let sorted: CalendarEvent[];
    if (dateRangeValue) {
      try {
        const { from: rawFrom, to: rawTo } = JSON.parse(dateRangeValue);
        const range = {
          from: rawFrom ? new Date(rawFrom) : undefined,
          to: rawTo ? new Date(rawTo) : undefined,
        };
        setDateRange(range);
        sorted = sortAndFilterEvents(calendarEvents, range, validDays);
      } catch {
        setDateRange({});
        sorted = sortAndFilterEvents(calendarEvents, {}, validDays);
      }
    } else {
      setDateRange({});
      sorted = sortAndFilterEvents(calendarEvents, {}, validDays);
    }

    setFilteredEvents(sorted);

    const currentEvents = getValues("events");
    const updatedEvents = sorted.map((event) => {
      const existing = currentEvents.find((e) => e.id === event.id);
      return {
        id: event.id,
        selected: existing?.selected ?? true,
        bufferBefore: existing?.bufferBefore ?? 0,
        bufferAfter: existing?.bufferAfter ?? 0,
      };
    });

    if (JSON.stringify(currentEvents) !== JSON.stringify(updatedEvents)) {
      setValue("events", updatedEvents);
    }
  }, [dateRangeValue, selectedDays, calendarEvents, getValues, setValue]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("フォーム送信:", values);
    // カレンダーイベントデータを含める
    const formDataWithCalendar = {
      ...values,
      calendarData: filteredEvents,
    };
    console.log("送信するデータ:", formDataWithCalendar);
    setFormValues(formDataWithCalendar);
    setIsModalOpen(true);
  }

  return (
    <div className="mx-auto relative mt-6 lg:mt-12">
      <div className="p-6 container mx-auto">
        {/* モーダルコンポーネント */}
        {formValues && (
          <InterviewSlotsList
            formData={formValues}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        ></motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-fit">
              {/* 左側：カレンダーイベント */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  あなたの予定
                </h2>
                <div className="mb-4">
                  <span className="text-white font-sans">
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
                                control={form.control}
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
                                    開始:{" "}
                                    {event.start.dateTime
                                      ? format(
                                          new Date(event.start.dateTime),
                                          "yyyy/MM/dd HH:mm"
                                        )
                                      : event.start.date
                                      ? format(
                                          new Date(event.start.date),
                                          "yyyy/MM/dd"
                                        )
                                      : "日付未定"}
                                  </p>
                                  <p className="text-gray-600 dark:text-gray-300 w-fit">
                                    終了:{" "}
                                    {event.end.dateTime
                                      ? format(
                                          new Date(event.end.dateTime),
                                          "yyyy/MM/dd HH:mm"
                                        )
                                      : event.end.date
                                      ? format(
                                          new Date(event.end.date),
                                          "yyyy/MM/dd"
                                        )
                                      : "日付未定"}
                                  </p>
                                </div>
                                <div className="flex sm:flex-col gap-2 sm:w-[30%] md:w-[270px] xl:w-[260px] mt-2 md:mt-0 ml-auto text-right">
                                  {/* 時間指定のある予定のみ余裕時間を表示 */}
                                  {event.start.dateTime && (
                                    <FormField
                                      control={form.control}
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
                                      control={form.control}
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

              {/* 右側：面接設定フォーム */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  面接可能時間設定
                </h2>
                <div className="mb-4">
                  <span className="text-white font-sans">
                    面接の日程に関する条件の設定です
                  </span>
                </div>
                <GlassCard className="h-[600px] space-y-4 p-4 overflow-y-scroll custom-scrollbar">
                  <FormField
                    control={form.control}
                    name="date_range"
                    render={({ field }) => {
                      const value = field.value
                        ? JSON.parse(field.value)
                        : { from: undefined, to: undefined };

                      return (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-lg font-medium text-white">
                            面接予定期間
                          </FormLabel>
                          <FormDescription className="text-gray-400">
                            候補日を設定する期間の開始日と終了日を指定してください。
                          </FormDescription>
                          <FormControl>
                            <DatePickerWithRange
                              value={value}
                              onChange={(date) =>
                                field.onChange(JSON.stringify(date))
                              }
                              className="sm:w-[60%] w-[90%]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="days"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-lg font-medium text-white">
                          面接可能曜日
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          面接が可能な曜日を設定してください。
                        </FormDescription>
                        <FormMessage />
                        <div className="grid grid-cols-2 gap-2">
                          {daysOfWeek.map((day) => (
                            <FormItem
                              key={day.value}
                              className="flex flex-row items-center cursor-pointer space-x-3 rounded-lg transition-colors text-white"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    field.onChange(
                                      checked
                                        ? [...field.value, day.value] // 追加
                                        : field.value.filter(
                                            (v: string) => v !== day.value
                                          ) // 削除
                                    );
                                  }}
                                  className="border-indigo-300 cursor-pointer hover:bg-white/20 data-[state=checked]:bg-indigo-600"
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer w-full p-2 !m-0">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-white">
                            面接可能開始時間
                          </FormLabel>
                          <FormDescription className="text-gray-400">
                            面接が可能な時間帯の開始時刻を設定してください。
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              className="bg-white/30 backdrop-blur-sm border-indigo-200 w-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-medium text-white">
                            面接可能終了時間
                          </FormLabel>
                          <FormDescription className="text-gray-400">
                            面接が可能な時間帯の終了時刻を設定してください。
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              className="bg-white/30 backdrop-blur-sm border-indigo-200 w-24"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="minimum_duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium text-white">
                          予定面接時間（分）
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          面接に必要な時間を設定してください。これより短い時間枠は除外されます。
                        </FormDescription>
                        <FormControl>
                          <NumberInput
                            value={field.value}
                            onChange={(val: number) => field.onChange(val)}
                            step={15}
                            min={0}
                            className="justify-start"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </GlassCard>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-end"
            >
              <Button
                type="submit"
                className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-indigo-600/20 transition-all duration-300"
              >
                面接候補リストを作成
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </div>
  );
}
