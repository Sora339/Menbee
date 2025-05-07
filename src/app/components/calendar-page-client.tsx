// app/components/calendar-page-client.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";

import InterviewSlotsList from "@/app/components/interview-list";
import { useMouseGradient } from "@/lib/animation-utils";
import { CalendarEvent } from "@/lib/calendar-service";

// イベント設定のためのスキーマ定義
interface EventSettings {
  id: string;
  selected: boolean;
  bufferBefore: number;
  bufferAfter: number;
}



const formSchema = z.object({
    date_range: z.string()
    .refine((val) => {
      // 未入力または「日付を選択」状態の検出
      if (!val) return false;
      
      try {
        const parsed = JSON.parse(val);
        // from が設定されているかチェック
        return parsed && parsed.from !== undefined;
      } catch {
        return false;
      }
    }, {
      message: "面接予定期間を選択してください。",
    }),
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

export default function CalendarPageClient({ initialEvents }: CalendarPageClientProps) {
  const [calendarEvents] = useState<CalendarEvent[]>(initialEvents);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("settings");
  const mousePosition = useMouseGradient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_range: "",
      days: [],
      start_time: "",
      end_time: "",
      minimum_duration: 30,
      events: initialEvents.map(event => ({
        id: event.id,
        selected: true,
        bufferBefore: 0,
        bufferAfter: 0,
      })),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("フォーム送信:", values);
    // カレンダーイベントデータを含める
    const formDataWithCalendar = {
      ...values,
      calendarData: calendarEvents,
    };
    console.log("送信するデータ:", formDataWithCalendar);
    setFormValues(formDataWithCalendar);
    setFormSubmitted(true);
    setActiveTab("results");
  }

  return (
    <div className="mx-auto relative">
      <div className="p-6 container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <TabsList className="mb-2 w-fit justify-start bg-white/20 backdrop-blur-sm text-white">
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r from-blue-500 to-indigo-500 data-[state=active]:text-primary !text-white"
              >
                スケジュール設定
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={!formSubmitted}
                className="data-[state=active]:bg-gradient-to-r from-purple-500 to-pink-500 data-[state=active]:text-primary !text-white"
              >
                候補時間
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="settings">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 h-fit">
                  {/* 左側：カレンダーイベント */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                      あなたの予定
                    </h2>
                    <GlassCard className="h-[600px] p-4 overflow-y-scroll custom-scrollbar">
                      <ul className="space-y-4 pr-2">
                        {calendarEvents.length > 0 ? (
                          calendarEvents.map((event, index) => (
                            <motion.li
                              key={event.id}
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
                                            className="border-indigo-300 data-[state=checked]:bg-indigo-500"
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />

                                  <div className="flex flex-col sm:flex-row w-full justify-between sm:items-center">
                                    <div>
                                      <h3 className="text-lg font-semibold text-left">
                                        {event.summary}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-300">
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
                                      <p className="text-gray-600 dark:text-gray-300">
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
                                    <div className="flex sm:flex-col gap-2 mt-2 md:mt-0 ml-auto text-right">
                                      {/* 時間指定のある予定のみ余裕時間を表示 */}
                                      {event.start.dateTime && (
                                        <FormField
                                          control={form.control}
                                          name={`events.${index}.bufferBefore`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                                  前の余裕(分):
                                                </label>
                                                <FormControl>
                                                  <Input
                                                    type="number"
                                                    className="w-20 bg-white/30 backdrop-blur-sm border-indigo-200"
                                                    value={field.value}
                                                    step={15}
                                                    onChange={(e) =>
                                                      field.onChange(
                                                        Number.parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      )
                                                    }
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
                                            <FormItem>
                                              <div className="flex items-center gap-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">
                                                  後の余裕(分):
                                                </label>
                                                <FormControl>
                                                  <Input
                                                    type="number"
                                                    className="w-20 bg-white/30 backdrop-blur-sm border-indigo-200"
                                                    value={field.value}
                                                    step={15}
                                                    onChange={(e) =>
                                                      field.onChange(
                                                        Number.parseInt(
                                                          e.target.value
                                                        ) || 0
                                                      )
                                                    }
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
                          <p className="text-center p-4">予定はありません。</p>
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
                    <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                      面接可能時間設定
                    </h2>
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
                                  className="w-[60%]"
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
                                      className="border-indigo-300 cursor-pointer hover:bg-white/20 data-[state=checked]:bg-indigo-500"
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
                                  className="bg-white/30 backdrop-blur-sm border-indigo-200 w-[80%]"
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
                                  className="bg-white/30 backdrop-blur-sm border-indigo-200 w-[80%]"
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
                              最低面接時間（分）
                            </FormLabel>
                            <FormDescription className="text-gray-400">
                              面接に必要な最低時間を設定してください。これより短い時間枠は除外されます。
                            </FormDescription>
                            <FormControl>
                              <Input
                                type="number"
                                step={15}
                                onChange={(e) =>
                                  field.onChange(
                                    Number.parseInt(e.target.value)
                                  )
                                }
                                value={field.value.toString() || "30"}
                                className="bg-white/30 backdrop-blur-sm border-indigo-200 w-[20%]"
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
                    className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
                  >
                    面接候補時間を計算
                  </Button>
                </motion.div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="results">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {formValues && <InterviewSlotsList formData={formValues} />}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}