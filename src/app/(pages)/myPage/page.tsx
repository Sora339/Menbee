// app/calendar/page.tsx

import { getCalendarEvents } from "@/lib/calendar-service";
import { auth, signIn } from "../../../../auth";
import CalendarPageClient from "@/app/components/calendar-page-client";
import LogOutButton from "@/app/components/sign-out";

export default async function CalendarPage() {
  // サーバーサイドで認証情報を取得
  const session = await auth();

  if (!session || !session.user?.email) {
    // 未認証の場合はログインを促す
    return (
      <div className="p-8 flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">認証が必要です</h1>
        <p className="mb-4">
          カレンダー情報を取得するにはログインしてください。
        </p>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Googleでログイン
        </button>
      </div>
    );
  }

  // サーバーサイドでカレンダーイベントを取得
  const calendarEvents = await getCalendarEvents(session.user.email);

  // クライアントコンポーネントにデータを渡す
  return (
    <>
      <LogOutButton />
      <CalendarPageClient initialEvents={calendarEvents} />
    </>
  );
}
