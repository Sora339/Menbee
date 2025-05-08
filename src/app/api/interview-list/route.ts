// api/interview-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { format, addMinutes, parseISO, getDay, startOfDay, endOfDay, isAfter } from "date-fns";
import { ja } from "date-fns/locale";

// 曜日のマッピング (0=日曜, 1=月曜, ...)
const dayMapping: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// 曜日の日本語表示用
const dayNameJp = ["日", "月", "火", "水", "木", "金", "土"];

// インターフェースの定義
interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface EventWithBuffer {
  id: string;
  summary: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
}

interface FormData {
  date_range: string;
  days: string[];
  start_time: string;
  end_time: string;
  minimum_duration?: number;
  events: Array<{
    id: string;
    selected: boolean;
    bufferBefore: number;
    bufferAfter: number;
  }>;
  calendarData: CalendarEvent[];
}

interface TimeSlot {
  start: Date;
  end: Date;
}

export async function POST(req: NextRequest) {
  try {
    const formData: FormData = await req.json();
    console.log("受信したフォームデータ:", JSON.stringify(formData, null, 2));
    
    // カレンダーイベントがない場合はエラーを返す
    if (!formData.calendarData || formData.calendarData.length === 0) {
      return NextResponse.json(
        { message: "カレンダーデータが提供されていません" },
        { status: 400 }
      );
    }
    
    // カレンダーイベントはフォームデータから取得
    const calendarEvents = formData.calendarData || [];
    console.log("カレンダーイベント数:", calendarEvents.length);
    
    // サンプルのカレンダーイベントを表示
    if (calendarEvents.length > 0) {
      console.log("最初のイベント例:", JSON.stringify(calendarEvents[0], null, 2));
    }
    
    // 日付範囲のパース
    const dateRange = JSON.parse(formData.date_range);
    const startDate = parseISO(dateRange.from);
    const endDate = dateRange.to ? parseISO(dateRange.to) : startDate;
    
    console.log(`日付範囲: ${format(startDate, "yyyy/MM/dd")} - ${format(endDate, "yyyy/MM/dd")}`);
    
    // 時間のパース
    const [startHour, startMinute] = formData.start_time.split(":").map(Number);
    const [endHour, endMinute] = formData.end_time.split(":").map(Number);
    
    console.log(`時間範囲: ${startHour}:${startMinute} - ${endHour}:${endMinute}`);
    
    // 最低面接時間（デフォルト：30分）
    const minimumDuration = (formData.minimum_duration || 30) * 60 * 1000; // ミリ秒に変換
    console.log(`最低面接時間: ${formData.minimum_duration || 30}分`);
    
    // 選択された曜日
    const selectedDays = formData.days.map(day => dayMapping[day]);
    console.log("選択された曜日:", selectedDays);
    
    // 除外するイベント（すべての予定）とバッファー時間を適用
    const excludedEvents: EventWithBuffer[] = [];
    
    calendarEvents.forEach(event => {
      // フォームから対応するイベント設定を探す
      const eventSetting = formData.events.find(e => e.id === event.id);
      
      // イベントが選択されていない場合はスキップ
      if (!eventSetting || !eventSetting.selected) {
        return;
      }
      
      // 日付型イベント（終日）の処理
      if (event.start.date && event.end.date) {
        const startDate = parseISO(event.start.date);
        // 終日イベントの場合、終了日は通常次の日の0時を指すので、1日引く
        // 今日の開始（0時0分）から終了（23時59分）までのイベントとして扱う
        excludedEvents.push({
          id: event.id,
          summary: event.summary || "終日イベント",
          start: startOfDay(startDate),
          end: endOfDay(startDate),
          isAllDay: true
        });
        
        console.log(`終日イベント: ${event.summary || "無題"}, ${format(startDate, "yyyy/MM/dd")}`);
      } 
      // 時間指定イベントの処理
      else if (event.start.dateTime && event.end.dateTime) {
        // startDateTimeとendDateTimeをパースする際に、タイムゾーンが指定されていることを確認
        let startDateTime = parseISO(event.start.dateTime);
        let endDateTime = parseISO(event.end.dateTime);
        
        // バッファー時間を適用
        const startWithBuffer = addMinutes(startDateTime, -eventSetting.bufferBefore);
        const endWithBuffer = addMinutes(endDateTime, eventSetting.bufferAfter);
        
        excludedEvents.push({
          id: event.id,
          summary: event.summary || "無題のイベント",
          start: startWithBuffer,
          end: endWithBuffer,
          isAllDay: false
        });
        
        console.log(`除外イベント: ${event.summary || "無題"}, ${format(startWithBuffer, "yyyy/MM/dd HH:mm")} - ${format(endWithBuffer, "yyyy/MM/dd HH:mm")}`);
      }
    });
    
    // 日付ごとの利用可能な時間スロットを生成
    const availableSlots: TimeSlot[] = [];
    
    // 今日の日付と時間を取得（Asia/Tokyo タイムゾーン）
    const now = new Date();
    // 現在時刻をJST（UTC+9）に調整
    const nowJST = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    // 開始日から終了日まで1日ずつ処理
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      // 曜日が選択されているか確認
      const dayOfWeek = getDay(currentDate);
      if (selectedDays.includes(dayOfWeek)) {
        // 終日イベントがあるかどうか確認
        const hasAllDayEvent = excludedEvents.some(event => 
          event.isAllDay && 
          event.start.getFullYear() === currentDate.getFullYear() &&
          event.start.getMonth() === currentDate.getMonth() &&
          event.start.getDate() === currentDate.getDate()
        );
        
        if (!hasAllDayEvent) {
          // その日の開始時間と終了時間を設定
          const dayStart = new Date(currentDate);
          dayStart.setHours(startHour, startMinute, 0, 0);
          
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(endHour, endMinute, 0, 0);
          
          console.log(`処理中の日: ${format(dayStart, "yyyy/MM/dd")}, 時間範囲: ${format(dayStart, "HH:mm")} - ${format(dayEnd, "HH:mm")}`);
          
          // 可能な時間帯を追加 - minimumDurationを引数として渡す
          const daySlots = findAvailableTimeSlots(dayStart, dayEnd, excludedEvents, minimumDuration);
          availableSlots.push(...daySlots);
        } else {
          console.log(`${format(currentDate, "yyyy/MM/dd")}は終日イベントがあるためスキップします`);
        }
      }
      
      // 次の日へ
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 結果をフォーマット - フィルタリングのためのスロット
    const slotsWithDateTime = availableSlots.map(slot => {
      const dayOfWeek = getDay(slot.start);
      return {
        date: format(slot.start, "yyyy/MM/dd", { locale: ja }),
        dayOfWeek: dayNameJp[dayOfWeek],
        startTime: format(slot.start, "HH:mm"),
        endTime: format(slot.end, "HH:mm"),
        startDateTime: slot.start,
        formatted: `${format(slot.start, "yyyy/MM/dd")}(${dayNameJp[dayOfWeek]}) ${format(slot.start, "HH:mm")}～${format(slot.end, "HH:mm")}`
      };
    });
    
    // 現在時刻以降のスロットだけをフィルタリング
    const filteredSlots = slotsWithDateTime.filter(slot => isAfter(slot.startDateTime, nowJST));
    
    // 最終的な出力用フォーマットに変換（startDateTimeを除外）
    const formattedSlots = filteredSlots.map(slot => ({
      date: slot.date,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      formatted: slot.formatted
    }));
    
    console.log("生成された時間スロット:", JSON.stringify(formattedSlots, null, 2));
    
    return NextResponse.json({ 
      slots: formattedSlots,
      debug: {
        excludedEvents: excludedEvents.map(event => ({
          id: event.id,
          summary: event.summary,
          start: format(event.start, "yyyy/MM/dd HH:mm"),
          end: format(event.end, "yyyy/MM/dd HH:mm"),
          isAllDay: event.isAllDay
        })),
        currentTime: format(nowJST, "yyyy/MM/dd HH:mm"),
        totalSlots: slotsWithDateTime.length,
        filteredSlots: filteredSlots.length
      }
    });
    
  } catch (error) {
    console.error("Error processing interview slots:", error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * 指定された期間内で、除外イベントと重ならない利用可能な時間帯を見つける
 */
function findAvailableTimeSlots(
  dayStart: Date,
  dayEnd: Date,
  excludedEvents: EventWithBuffer[],
  minimumDuration: number
): TimeSlot[] {
  // 時間指定イベントのみをフィルタリング（終日イベントはすでに処理済み）
  const relevantEvents = excludedEvents.filter(event => {
    return (
      !event.isAllDay && // 終日イベントは除外（すでに日付レベルで除外済み）
      (event.start <= dayEnd && event.end >= dayStart) // 日付範囲と重なりがある
    );
  });
  
  console.log(`関連する除外イベント: ${relevantEvents.length}件`);
  relevantEvents.forEach((event, index) => {
    console.log(`除外${index+1}: ${event.summary}, ${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`);
  });
  
  // 重なりがなければ、その日全体が利用可能
  if (relevantEvents.length === 0) {
    console.log(`重なりなし: ${format(dayStart, "HH:mm")} - ${format(dayEnd, "HH:mm")}を追加`);
    return [{ start: new Date(dayStart), end: new Date(dayEnd) }];
  }
  
  // 除外イベントを時間順にソート
  relevantEvents.sort((a, b) => a.start.getTime() - b.start.getTime());
  
  const availableSlots: TimeSlot[] = [];
  let currentStart = new Date(dayStart);
  
  // 除外イベントの間の空き時間を見つける
  for (const event of relevantEvents) {
    // 現在の開始時間がイベントの開始時間より前なら、空き時間がある
    if (currentStart < event.start) {
      const newSlot = {
        start: new Date(currentStart),
        end: new Date(event.start)
      };
      console.log(`空き時間発見: ${format(newSlot.start, "HH:mm")} - ${format(newSlot.end, "HH:mm")}`);
      availableSlots.push(newSlot);
    }
    
    // 次の開始時間を更新（現在の終了時間よりイベントの終了時間が後の場合）
    if (event.end > currentStart) {
      currentStart = new Date(event.end);
      console.log(`次の開始時間を更新: ${format(currentStart, "HH:mm")}`);
    }
  }
  
  // 最後のイベント後の時間を確認
  if (currentStart < dayEnd) {
    const newSlot = {
      start: new Date(currentStart),
      end: new Date(dayEnd)
    };
    console.log(`最後のスロット: ${format(newSlot.start, "HH:mm")} - ${format(newSlot.end, "HH:mm")}`);
    availableSlots.push(newSlot);
  }
  
  // 最低時間未満のスロットを除外
  const filteredSlots = availableSlots.filter(slot => 
    (slot.end.getTime() - slot.start.getTime()) >= minimumDuration
  );
  
  console.log(`生成されたスロット: ${filteredSlots.length}件 (${minimumDuration / 60000}分以上のみ)`);
  filteredSlots.forEach((slot, index) => {
    const durationMinutes = (slot.end.getTime() - slot.start.getTime()) / 60000;
    console.log(`スロット${index+1}: ${format(slot.start, "HH:mm")} - ${format(slot.end, "HH:mm")} (${Math.floor(durationMinutes)}分)`);
  });
  
  return filteredSlots;
}