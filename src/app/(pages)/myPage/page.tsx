// app/calendar/page.tsx
import { redirect } from "next/navigation";
import { parseISO, addDays } from "date-fns";
import { toZonedTime, format as tzFormat } from "date-fns-tz";
import CalendarPageClient from "@/app/components/calendar-page-client";
import { getCalendarEvents } from "@/lib/calendar-service";
import { CalendarEvent as OriginalCalendarEvent } from "../../../type";
import { FormattedCalendarEvent } from "../../../type";
import { TIMEZONE } from "@/lib/timezone";

export const dynamic = 'force-dynamic';

function formatCalendarEvent(event: OriginalCalendarEvent): FormattedCalendarEvent[] {
  const formatDateTime = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      const zonedDate = toZonedTime(date, TIMEZONE);
      return tzFormat(zonedDate, 'yyyy/MM/dd HH:mm', { timeZone: TIMEZONE });
    } catch (error) {
      console.error('Server date formatting error:', error);
      return '日時エラー';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      const zonedDate = toZonedTime(date, TIMEZONE);
      return tzFormat(zonedDate, 'yyyy/MM/dd', { timeZone: TIMEZONE });
    } catch (error) {
      console.error('Server date formatting error:', error);
      return '日付エラー';
    }
  };

  // 終日予定で複数日にわたる場合の処理
  if (event.start.date && event.end.date) {
    // 日付文字列を直接操作してJSTで解釈
    const startDateStr = event.start.date; // "2025-07-29" 形式
    const endDateStr = event.end.date;     // "2025-08-02" 形式
    
    // Google Calendarの終日予定は、終了日が実際の終了日の翌日になるため1日引く
    const endDateParsed = parseISO(endDateStr + 'T00:00:00');
    const actualEndDate = addDays(endDateParsed, -1);
    const actualEndDateStr = tzFormat(toZonedTime(actualEndDate, TIMEZONE), 'yyyy-MM-dd', { timeZone: TIMEZONE });
    
    // 開始日と終了日が同じ場合は単一の予定として処理
    if (startDateStr === actualEndDateStr) {
      return [{
        id: event.id,
        summary: event.summary,
        startDateTime: event.start.dateTime,
        startDate: event.start.date,
        endDateTime: event.end.dateTime,
        endDate: event.end.date,
        startFormatted: formatDate(startDateStr + 'T00:00:00'),
        endFormatted: formatDate(startDateStr + 'T00:00:00'), // 終日予定なので同じ日付
      }];
    }
    
    // 複数日にわたる場合は各日に分割
    const events: FormattedCalendarEvent[] = [];
    
    // 開始日から終了日まで日付文字列ベースでループ
    let currentDateParsed = parseISO(startDateStr + 'T00:00:00');
    const actualEndDateParsed = parseISO(actualEndDateStr + 'T00:00:00');
    let dayIndex = 0;
    
    while (currentDateParsed <= actualEndDateParsed) {
      // JSTタイムゾーンで日付文字列を生成
      const currentDateStr = tzFormat(toZonedTime(currentDateParsed, TIMEZONE), 'yyyy-MM-dd', { timeZone: TIMEZONE });
      
      events.push({
        id: `${event.id}-day-${dayIndex}`, // 各日に一意のIDを付与
        summary: event.summary,
        startDateTime: undefined,
        startDate: currentDateStr,
        endDateTime: undefined,
        endDate: currentDateStr,
        startFormatted: formatDate(currentDateStr + 'T00:00:00'),
        endFormatted: formatDate(currentDateStr + 'T00:00:00'),
      });
      
      // 次の日に進む
      currentDateParsed = addDays(currentDateParsed, 1);
      dayIndex++;
    }
    
    return events;
  }
  
  // 通常の予定（時間指定あり、または単日の終日予定）
  return [{
    id: event.id,
    summary: event.summary,
    startDateTime: event.start.dateTime,
    startDate: event.start.date,
    endDateTime: event.end.dateTime,
    endDate: event.end.date,
    startFormatted: event.start.dateTime 
      ? formatDateTime(event.start.dateTime)
      : event.start.date 
      ? formatDate(event.start.date)
      : undefined,
    endFormatted: event.end.dateTime 
      ? formatDateTime(event.end.dateTime)
      : event.end.date 
      ? formatDate(event.end.date)
      : undefined,
  }];
}

export default async function CalendarPage() {
  try {
    // サーバーサイドでカレンダーイベントを取得
    const { events, authError } = await getCalendarEvents();

    // 認証エラーの場合（リフレッシュトークンが無効など）
    if (authError) {
      console.log("🔐 Authentication error detected, redirecting to login page");
      redirect("/login?error=token_expired");
    }

    // サーバーサイドで日時をフォーマットし、複数日予定を分割してフラット構造に変換
    const formattedEvents = events.flatMap(formatCalendarEvent);

    console.log("📅 Formatted events on server:", formattedEvents.length);

    // フラットなデータをクライアントコンポーネントに渡す
    return <CalendarPageClient events={formattedEvents} />;
  } catch (error) {
    console.error('Error in CalendarPage:', error);
    // エラー時は空の配列でコンポーネントを初期化
    return <CalendarPageClient events={[]} />;
  }
}
