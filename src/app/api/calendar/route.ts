import { NextRequest, NextResponse } from "next/server";
// import { getTokenFromDynamoDB } from "@/lib/dynamoDB";
import { auth } from "../../../../auth";

export async function GET(req: NextRequest) {
  try {
    // **認証情報を取得**
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;

    // **DynamoDB からトークン取得**
    // let tokenData = await getTokenFromDynamoDB(email);

    // **アクセストークンの有効期限をチェック**
    // if (!tokenData || !tokenData.accessToken) {
    //   return NextResponse.json({ error: "Unauthorized: No valid access token" }, { status: 401 });
    // }

    // **Google カレンダー API を Lambda にリクエスト**
    const response = await fetch(`https://obi7r4wuyb.execute-api.us-east-1.amazonaws.com/fetchGoogleCalendar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Google Calendar from Lambda");
    }

    const calendarData = await response.json();
    return NextResponse.json(calendarData);
  } catch (error) {
    console.error("❌ Error fetching calendar from Lambda:", error);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
