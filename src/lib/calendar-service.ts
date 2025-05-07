// lib/calendar-service.ts

import { prisma } from "../../prisma";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

interface GoogleCalendar {
  id: string;
  summary: string;
  primary?: boolean;
  selected?: boolean;
}

// カレンダーイベント取得関数
export async function getCalendarEvents(email: string): Promise<{
  events: CalendarEvent[];
  authError?: boolean;
}> {
  try {
    console.log("🔍 Fetching calendar events for user:", email);
    
    // Prismaからトークンを取得
    const tokenData = await getTokenFromPrisma(email);
    
    if (!tokenData || !tokenData.accessToken || !tokenData.refreshToken) {
      console.error("❌ No valid token found for user:", email);
      return { events: [], authError: true };
    }
    
    let { accessToken } = tokenData;
    // Fixed: 'refreshToken' is never reassigned. Use 'const' instead
    const { refreshToken } = tokenData;
    
    try {
      // カレンダー一覧を取得
      const calendarListResponse = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      // アクセストークンが期限切れの場合
      if (calendarListResponse.status === 401) {
        console.log("🔄 Access token expired, refreshing token...");
        
        try {
          const newTokens = await refreshGoogleToken(refreshToken);
          accessToken = newTokens.access_token;
          
          // アクセストークンのみを更新
          await updateTokenInPrisma(email, accessToken, newTokens.expires_in);
          
          // 新しいトークンで再試行
          const retryResponse = await fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          
          if (!retryResponse.ok) {
            throw new Error(`Failed to fetch calendar list after token refresh: ${retryResponse.statusText}`);
          }
          
          const calendarListData = await retryResponse.json();
          const events = await fetchEventsFromCalendars(calendarListData.items, accessToken);
          return { events };
        } catch (error) {
          // リフレッシュトークンが無効な場合
          console.error("❌ Refresh token is invalid:", error);
          return { events: [], authError: true };
        }
      }

      if (!calendarListResponse.ok) {
        throw new Error(`Failed to fetch calendar list: ${calendarListResponse.statusText}`);
      }

      const calendarListData = await calendarListResponse.json();
      const events = await fetchEventsFromCalendars(calendarListData.items, accessToken);
      return { events };
      
    } catch (error) {
      console.error("❌ Error fetching calendar data:", error);
      
      // エラーメッセージからリフレッシュトークン無効を検出
      if (
        error instanceof Error && 
        (
          error.message.includes("invalid_grant") ||
          error.message.includes("refresh token") ||
          error.message.includes("token has been expired or revoked")
        )
      ) {
        return { events: [], authError: true };
      }
      
      return { events: [] };
    }
    
  } catch (error) {
    console.error("❌ Error in getCalendarEvents:", error);
    return { events: [] };
  }
}

// カレンダーの一覧から予定を取得する関数
// Fixed: 'Unexpected any. Specify a different type'
async function fetchEventsFromCalendars(
  calendars: GoogleCalendar[], 
  accessToken: string
): Promise<CalendarEvent[]> {
  // 3ヶ月間の予定を取得
  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);

  const timeMin = now.toISOString();
  const timeMax = threeMonthsLater.toISOString();

  const allEvents: CalendarEvent[] = [];
  const calendarIds = calendars.map((cal: GoogleCalendar) => cal.id);

  console.log("📅 Found calendars:", calendarIds.length);

  for (const calendarId of calendarIds) {
    try {
      const eventsResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
          calendarId
        )}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        allEvents.push(...(eventsData.items || []));
      } else {
        console.warn(`⚠️ Failed to fetch events for calendar: ${calendarId}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching events for calendar ${calendarId}:`, error);
    }
  }

  return allEvents;
}

// Prismaからトークンを取得する関数
async function getTokenFromPrisma(email: string): Promise<{ 
  accessToken: string; 
  refreshToken: string;
  expires_at?: number;
} | null> {
  try {
    // メールアドレスからユーザーを検索
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { provider: 'google' }
        }
      }
    });
    
    if (!user || user.accounts.length === 0) {
      console.error("❌ No Google account found for user:", email);
      return null;
    }
    
    const googleAccount = user.accounts[0];
    
    if (!googleAccount.access_token || !googleAccount.refresh_token) {
      console.error("❌ Incomplete token information for user:", email);
      return null;
    }
    
    return {
      accessToken: googleAccount.access_token,
      refreshToken: googleAccount.refresh_token,
      expires_at: googleAccount.expires_at || undefined
    };
  } catch (error) {
    console.error("❌ Failed to fetch token from Prisma:", error);
    return null;
  }
}

// Prismaでトークンを更新する関数
// Prismaでアクセストークンのみを更新する関数
async function updateTokenInPrisma(
  email: string, 
  accessToken: string,
  expiresIn?: number
): Promise<void> {
  try {
    // ユーザーのメールアドレスからユーザーを特定
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: {
          where: { provider: 'google' }
        }
      }
    });
    
    if (!user || user.accounts.length === 0) {
      console.error("❌ Cannot update token - no Google account found for user:", email);
      return;
    }
    
    const googleAccount = user.accounts[0];
    
    // 現在のUNIX時間（秒）
    const now = Math.floor(Date.now() / 1000);
    
    // アクセストークンと有効期限のみを更新
    await prisma.account.update({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleAccount.providerAccountId
        }
      },
      data: {
        access_token: accessToken,
        expires_at: expiresIn ? now + expiresIn : googleAccount.expires_at,
        updatedAt: new Date()
      }
    });
    
    console.log("✅ Access token updated for user:", email);
  } catch (error) {
    console.error("❌ Failed to update access token in Prisma:", error);
    throw error;
  }
}

// Googleトークンをリフレッシュする関数
async function refreshGoogleToken(refreshToken: string): Promise<{ 
  access_token: string;
  expires_in?: number;
}> {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Google client credentials are not configured");
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    throw new Error("No access token returned from Google");
  }
  
  return {
    access_token: data.access_token,
    expires_in: data.expires_in
  };
}