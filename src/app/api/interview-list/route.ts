// // api/interview-slots/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import {
//   parseISO,
//   addMinutes,
//   startOfDay as dfStartOfDay,
//   endOfDay as dfEndOfDay,
//   getDay as dfGetDay,
// } from "date-fns";
// import { ja } from "date-fns/locale";
// import { toZonedTime, format as tzFormat } from "date-fns-tz";

// const TIMEZONE = "Asia/Tokyo";

// // 曜日のマッピング (0=日曜, …, 6=土曜)
// const dayMapping: Record<string, number> = {
//   sunday: 0,
//   monday: 1,
//   tuesday: 2,
//   wednesday: 3,
//   thursday: 4,
//   friday: 5,
//   saturday: 6,
// };
// const dayNameJp = ["日", "月", "火", "水", "木", "金", "土"];

// interface CalendarEvent {
//   id: string;
//   summary: string;
//   start: { dateTime?: string; date?: string };
//   end:   { dateTime?: string; date?: string };
// }

// interface EventWithBuffer {
//   id: string;
//   summary: string;
//   start: Date;
//   end:   Date;
//   isAllDay: boolean;
// }

// interface FormData {
//   date_range: string;
//   days: string[];
//   start_time: string;         // "HH:mm"
//   end_time:   string;         // "HH:mm"
//   minimum_duration?: number;  // 分
//   events: Array<{
//     id: string;
//     selected: boolean;
//     bufferBefore: number;     // 分
//     bufferAfter:  number;     // 分
//   }>;
//   calendarData: CalendarEvent[];
// }

// interface TimeSlot {
//   start: Date;
//   end:   Date;
// }

// export async function POST(req: NextRequest) {
//   try {
//     const formData: FormData = await req.json();

//     // 日付範囲のパース（Tokyo の startOfDay に合わせる）
//     const { from, to } = JSON.parse(formData.date_range);
//     const rawFrom = parseISO(from);
//     const rawTo   = to ? parseISO(to) : rawFrom;
//     const startDateZ = dfStartOfDay(toZonedTime(rawFrom, TIMEZONE));
//     const endDateZ   = dfStartOfDay(toZonedTime(rawTo,   TIMEZONE));

//     // 選択曜日日配列
//     const selectedDays = formData.days.map(d => dayMapping[d]);

//     // カレンダーイベント → 除外リストに
//     const excludedEvents: EventWithBuffer[] = [];
//     formData.calendarData.forEach(ev => {
//       const setting = formData.events.find(e => e.id === ev.id);
//       if (!setting || !setting.selected) return;

//       // 終日イベント
//       if (ev.start.date && ev.end.date) {
//         const dt = toZonedTime(parseISO(ev.start.date), TIMEZONE);
//         excludedEvents.push({
//           id: ev.id,
//           summary: ev.summary || "終日イベント",
//           start: dfStartOfDay(dt),
//           end:   dfEndOfDay(dt),
//           isAllDay: true,
//         });
//       }
//       // 時間指定イベント
//       else if (ev.start.dateTime && ev.end.dateTime) {
//         const zonedStart = toZonedTime(parseISO(ev.start.dateTime), TIMEZONE);
//         const zonedEnd   = toZonedTime(parseISO(ev.end.dateTime),   TIMEZONE);
//         const startBufLocal = addMinutes(zonedStart, -setting.bufferBefore);
//         const endBufLocal   = addMinutes(zonedEnd,   setting.bufferAfter);

//         // Tokyo 壁掛け時間の文字列にして +09:00 を付与 → parseISO で UTC Date に
//         const startUtc = parseISO(
//           tzFormat(startBufLocal, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE }) +
//             ":00+09:00"
//         );
//         const endUtc = parseISO(
//           tzFormat(endBufLocal, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE }) +
//             ":00+09:00"
//         );

//         excludedEvents.push({
//           id: ev.id,
//           summary: ev.summary || "イベント",
//           start: startUtc,
//           end:   endUtc,
//           isAllDay: false,
//         });
//       }
//     });

//     // 各日の利用可能スロットを収集
//     const availableSlots: TimeSlot[] = [];
//     for (
//       let curr = new Date(startDateZ.getTime());
//       curr <= endDateZ;
//       curr.setDate(curr.getDate() + 1)
//     ) {
//       const dow = dfGetDay(curr);
//       if (!selectedDays.includes(dow)) continue;

//       // Tokyo 壁掛け日付文字列
//       const dateStr = tzFormat(curr, "yyyy-MM-dd", { timeZone: TIMEZONE });
//       // 開始／終了時刻を Tokyo の "+09:00" 付き ISO 文字列 → UTC Date
//       const dayStart = parseISO(`${dateStr}T${formData.start_time}:00+09:00`);
//       const dayEnd   = parseISO(`${dateStr}T${formData.end_time}:00+09:00`);

//       // 終日イベントのある日はスキップ
//       const hasAllDay = excludedEvents.some(e =>
//         e.isAllDay &&
//         dfStartOfDay(e.start).getTime() === dfStartOfDay(dayStart).getTime()
//       );
//       if (hasAllDay) continue;

//       const daySlots = findAvailableTimeSlots(
//         dayStart,
//         dayEnd,
//         excludedEvents,
//         (formData.minimum_duration || 30) * 60 * 1000
//       );
//       availableSlots.push(...daySlots);
//     }

//     // --- 今の時間以降に調整 ---
//     const nowUtc = new Date();
//     const adjustedSlots: TimeSlot[] = availableSlots
//       // 終了済みスロットは除外
//       .filter(slot => slot.end.getTime() > nowUtc.getTime())
//       // 開始が過去なら start を now に合わせる
//       .map(slot => ({
//         start:
//           slot.start.getTime() < nowUtc.getTime()
//             ? nowUtc
//             : slot.start,
//         end: slot.end,
//       }));

//     // レスポンス用に Tokyo 表示にフォーマット
//     const formatted = adjustedSlots.map(slot => {
//       const zStart = toZonedTime(slot.start, TIMEZONE);
//       const zEnd   = toZonedTime(slot.end,   TIMEZONE);
//       const dow    = dfGetDay(zStart);
//       const date   = tzFormat(zStart, "yyyy/MM/dd", {
//         timeZone: TIMEZONE,
//         locale: ja,
//       });
//       const startTime = tzFormat(zStart, "HH:mm", {
//         timeZone: TIMEZONE,
//       });
//       const endTime   = tzFormat(zEnd,   "HH:mm", {
//         timeZone: TIMEZONE,
//       });

//       return {
//         date,
//         dayOfWeek: dayNameJp[dow],
//         startTime,
//         endTime,
//         formatted: `${date}(${dayNameJp[dow]}) ${startTime}～${endTime}`,
//       };
//     });

//     return NextResponse.json({ slots: formatted });
//   } catch (error) {
//     console.error("Error processing interview slots:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * 指定期間内で、除外イベントと重ならない空きスロットを返す
//  */
// function findAvailableTimeSlots(
//   dayStart: Date,
//   dayEnd: Date,
//   excluded: EventWithBuffer[],
//   minDur: number
// ): TimeSlot[] {
//   const events = excluded
//     .filter(e => !e.isAllDay && e.start < dayEnd && e.end > dayStart)
//     .sort((a, b) => a.start.getTime() - b.start.getTime());

//   const slots: TimeSlot[] = [];
//   let cursor = new Date(dayStart);

//   for (const ev of events) {
//     if (cursor < ev.start) {
//       slots.push({ start: new Date(cursor), end: new Date(ev.start) });
//     }
//     if (ev.end > cursor) {
//       cursor = new Date(ev.end);
//     }
//   }
//   if (cursor < dayEnd) {
//     slots.push({ start: cursor, end: dayEnd });
//   }

//   return slots.filter(s => s.end.getTime() - s.start.getTime() >= minDur);
// }
