"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { DatePickerWithRange } from "./date-picker-range";

const formSchema = z.object({
  date_range: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  days: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  start_time: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  end_time: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
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

export default function InterviewForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date_range: "",
      days: "",
      start_time: "",
      end_time: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="date_range"
          render={({ field }) => {
            const value = field.value
              ? JSON.parse(field.value)
              : { from: undefined, to: undefined };

            return (
              <FormItem>
                <FormLabel>面接予定期間</FormLabel>
                <FormDescription>
                  候補日を設定する期間の開始日と終了日を指定してください。
                </FormDescription>
                <FormControl>
                  <DatePickerWithRange
                    value={value}
                    onChange={(date) => field.onChange(JSON.stringify(date))}
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
            <FormItem>
              <FormLabel>面接可能曜日</FormLabel>
              <FormDescription>
                面接が可能な曜日を設定してください。
              </FormDescription>
              <FormMessage />
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <FormItem
                    key={day.value}
                    className="flex flex-row items-center space-x-3"
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
                      />
                    </FormControl>
                    <FormLabel>{day.label}</FormLabel>
                  </FormItem>
                ))}
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>面接可能開始時間</FormLabel>
              <FormDescription>
                面接が可能な開始時間を指定してください。
              </FormDescription>
              <FormControl>
                <Input placeholder="shadcn" {...field} type="time" />
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
              <FormLabel>面接可能終了時間</FormLabel>
              <FormDescription>
                面接が可能な終了時間を指定してください。
              </FormDescription>
              <FormControl>
                <Input placeholder="shadcn" {...field} type="time" />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="!flex !ml-auto">
          Submit
        </Button>
      </form>
    </Form>
  );
}
