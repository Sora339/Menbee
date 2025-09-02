'use server';

import {
  parseISO,
  addMinutes,
  startOfDay as dfStartOfDay,
  getDay as dfGetDay,
} from "date-fns";
import { ja } from "date-fns/locale";
import { toZonedTime, format as tzFormat } from "date-fns-tz";
import { z } from "zod";
import { EventWithBuffer, TimeSlot } from "../../type";

const TIMEZONE = "Asia/Tokyo";

// 曜日のマッピング (0=日曜, …, 6=土曜)
const dayMapping: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const dayNameJp = ["日", "月", "火", "水", "木", "金", "土"];

// バックエンドでのスキーマ定義
const calendarEventSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
});

const eventSettingSchema = z.object({
  id: z.string(),
  selected: z.boolean(),
  bufferBefore: z.number(),
  bufferAfter: z.number(),
});

const formDataSchema = z.object({
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
  events: z.array(eventSettingSchema),
  calendarData: z.array(calendarEventSchema),
});


type FormData = z.infer<typeof formDataSchema>;


export async function getInterviewSlots(formData: FormData) {
  try {
    // サーバーサイドでのバリデーション
    const validatedData = formDataSchema.parse(formData);

    // 日付範囲のパース（Tokyo の startOfDay に合わせる）
    const { from, to } = JSON.parse(validatedData.date_range);
    const rawFrom = parseISO(from);
    const rawTo   = to ? parseISO(to) : rawFrom;
    const startDateZ = dfStartOfDay(toZonedTime(rawFrom, TIMEZONE));
    const endDateZ   = dfStartOfDay(toZonedTime(rawTo,   TIMEZONE));

    // 選択曜日日配列
    const selectedDays = validatedData.days.map(d => dayMapping[d]);

    // カレンダーイベント → 除外リストに
    const excludedEvents: EventWithBuffer[] = [];
    validatedData.calendarData.forEach(ev => {
      const setting = validatedData.events.find(e => e.id === ev.id);
      if (!setting || !setting.selected) return;

      // 終日イベント
      if (ev.start.date && ev.end.date) {
        // 終日イベントの日付をJST時刻として解釈し、UTC Dateオブジェクトを作成
        const startDateJST = parseISO(`${ev.start.date}T00:00:00+09:00`);
        const endDateJST = parseISO(`${ev.end.date}T23:59:59+09:00`);
        
        excludedEvents.push({
          id: ev.id,
          summary: ev.summary || "終日イベント",
          start: startDateJST,
          end: endDateJST,
          isAllDay: true,
        });
      }
      // 時間指定イベント
      else if (ev.start.dateTime && ev.end.dateTime) {
        const startUtc = addMinutes(parseISO(ev.start.dateTime), -setting.bufferBefore);
        const endUtc = addMinutes(parseISO(ev.end.dateTime), setting.bufferAfter);

        excludedEvents.push({
          id: ev.id,
          summary: ev.summary || "イベント",
          start: startUtc,
          end:   endUtc,
          isAllDay: false,
        });
      }
    });

    // 各日の利用可能スロットを収集
    const availableSlots: TimeSlot[] = [];
    for (
      let curr = new Date(startDateZ.getTime());
      curr <= endDateZ;
      curr.setDate(curr.getDate() + 1)
    ) {
      const dow = dfGetDay(curr);
      if (!selectedDays.includes(dow)) continue;

      // Tokyo 壁掛け日付文字列
      const dateStr = tzFormat(curr, "yyyy-MM-dd", { timeZone: TIMEZONE });
      
      // 開始／終了時刻をJST時刻として解釈し、UTC Dateオブジェクトを作成
      const dayStart = parseISO(`${dateStr}T${validatedData.start_time}:00+09:00`);
      const dayEnd   = parseISO(`${dateStr}T${validatedData.end_time}:00+09:00`);

      // 終日イベントのある日はスキップ
      // 終日イベントとdayStartの日付をJST基準で比較
      const currentDateJST = tzFormat(curr, "yyyy-MM-dd", { timeZone: TIMEZONE });
      const hasAllDay = excludedEvents.some(e => {
        if (!e.isAllDay) return false;
        
        // 終日イベントの開始日と終了日をJST基準で取得
        const eventStartDateJST = tzFormat(e.start, "yyyy-MM-dd", { timeZone: TIMEZONE });
        const eventEndDateJST = tzFormat(e.end, "yyyy-MM-dd", { timeZone: TIMEZONE });
        
        // 現在の日付が終日イベントの期間内（開始日〜終了日）にあるかチェック
        return currentDateJST >= eventStartDateJST && currentDateJST <= eventEndDateJST;
      });
      if (hasAllDay) continue;

      const daySlots = findAvailableTimeSlots(
        dayStart,
        dayEnd,
        excludedEvents,
        (validatedData.minimum_duration || 30) * 60 * 1000
      );
      availableSlots.push(...daySlots);
    }

    // --- 今の時間以降に調整 ---
    const nowUtc = new Date();
    const adjustedSlots: TimeSlot[] = availableSlots
      // 終了済みスロットは除外
      .filter(slot => slot.end.getTime() > nowUtc.getTime())
      // 開始が過去なら start を now に合わせる
      .map(slot => ({
        start:
          slot.start.getTime() < nowUtc.getTime()
            ? nowUtc
            : slot.start,
        end: slot.end,
      }));

    // レスポンス用に Tokyo 表示にフォーマット
    const formatted = adjustedSlots.map(slot => {
      const zStart = toZonedTime(slot.start, TIMEZONE);
      const zEnd   = toZonedTime(slot.end,   TIMEZONE);
      const dow    = dfGetDay(zStart);
      const date   = tzFormat(zStart, "yyyy/MM/dd", {
        timeZone: TIMEZONE,
        locale: ja,
      });
      const startTime = tzFormat(zStart, "HH:mm", {
        timeZone: TIMEZONE,
      });
      const endTime   = tzFormat(zEnd,   "HH:mm", {
        timeZone: TIMEZONE,
      });

      return {
        date,
        dayOfWeek: dayNameJp[dow],
        startTime,
        endTime,
        formatted: `${date}(${dayNameJp[dow]}) ${startTime}～${endTime}`,
      };
    });

    return { 
      slots: formatted,
      success: true
    };
  } catch (error) {
    console.error("Error processing interview slots:", error);
    return { 
      message: "エラーが発生しました",
      error: (error as Error).message,
      success: false
    };
  }
}

/**
 * 指定期間内で、除外イベントと重ならない空きスロットを返す
 */
function findAvailableTimeSlots(
  dayStart: Date,
  dayEnd: Date,
  excluded: EventWithBuffer[],
  minDur: number
): TimeSlot[] {
  const events = excluded
    .filter(e => !e.isAllDay && e.start < dayEnd && e.end > dayStart)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const slots: TimeSlot[] = [];
  let cursor = new Date(dayStart);

  for (const ev of events) {
    if (cursor < ev.start) {
      slots.push({ start: new Date(cursor), end: new Date(ev.start) });
    }
    if (ev.end > cursor) {
      cursor = new Date(ev.end);
    }
  }
  if (cursor < dayEnd) {
    slots.push({ start: cursor, end: dayEnd });
  }

  return slots.filter(s => s.end.getTime() - s.start.getTime() >= minDur);
}