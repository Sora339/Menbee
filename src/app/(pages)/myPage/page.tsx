// app/calendar/page.tsx
import { redirect } from "next/navigation";

import CalendarPageClient from "@/app/components/calendar-page-client";
import { getCalendarEvents } from "@/lib/calendar-service";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  // サーバーサイドでカレンダーイベントを取得
  const { events, authError } = await getCalendarEvents();

  // 認証エラーの場合（リフレッシュトークンが無効など）
  if (authError) {
    console.log("🔐 Authentication error detected, redirecting to login page");
    redirect("/login?error=token_expired");
  }

  // クライアントコンポーネントにデータを渡す
  return <CalendarPageClient initialEvents={events} />;
}
