// app/calendar/page.tsx
import { redirect } from 'next/navigation';

import CalendarPageClient from "@/app/components/calendar-page-client";
import { getCalendarEvents } from "@/lib/calendar-service";
import { auth } from '../../../../auth';
import LogOutButton from '@/app/components/sign-out';
import LoginButton from '@/app/components/sign-in';

export default async function CalendarPage() {
  // サーバーサイドで認証情報を取得
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  // サーバーサイドでカレンダーイベントを取得
  const { events, authError } = await getCalendarEvents(session.user.email);
  
  // 認証エラーの場合（リフレッシュトークンが無効など）
  if (authError) {
    console.log("🔐 Authentication error detected, redirecting to login page");
    redirect('/login?error=token_expired');
  }
  
  // クライアントコンポーネントにデータを渡す
  return (
    <CalendarPageClient initialEvents={events} />
  );
}