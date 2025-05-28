"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
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
import { NumberInput } from "@/components/ui/number-input";
import { daysOfWeek } from "./calendar-page-client";

export default function InterviewSettingsForm() {
  const { control } = useFormContext();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-1 bg-clip-text text-white">
        面接可能時間設定
      </h2>
      <div className="mb-4">
        <span className="text-white/80 font-sans">
          面接の日程に関する条件の設定です
        </span>
      </div>
      <GlassCard className="h-[600px] space-y-4 p-4 overflow-y-scroll custom-scrollbar">
        <FormField
          control={control}
          name="date_range"
          render={({ field }) => {
            const parseValue = (val: string) => {
              if (!val) return { from: undefined, to: undefined };
              try {
                return JSON.parse(val);
              } catch {
                return { from: undefined, to: undefined };
              }
            };

            const value = parseValue(field.value);

            return (
              <FormItem>
                <FormLabel className="text-lg font-medium text-white">
                  面接予定期間
                </FormLabel>
                <FormDescription className="text-gray-400">
                  候補日を設定する期間の開始日と終了日を指定してください。
                </FormDescription>
                <FormControl>
                  <DatePickerWithRange
                    value={value}
                    onChange={(date) => {
                      try {
                        field.onChange(JSON.stringify(date));
                      } catch (error) {
                        console.error("Date serialization error:", error);
                        field.onChange("");
                      }
                    }}
                    className="sm:w-[60%] w-[90%]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={control}
          name="days"
          render={({ field }) => (
            <FormItem>
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
            control={control}
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
                    className="bg-white/30 backdrop-blur-sm border-indigo-200 w-24 h-[42px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
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
                    className="bg-white/30 backdrop-blur-sm border-indigo-200 w-24 h-[42px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
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
  );
}
