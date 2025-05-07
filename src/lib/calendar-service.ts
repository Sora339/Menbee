// lib/calendar-service.ts
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { saveTokenToDynamoDB } from "@/lib/dynamoDB";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

// カレンダーイベント取得関数
export async function getCalendarEvents(email: string): Promise<CalendarEvent[]> {
  try {
    console.log("🔍 Fetching calendar events for user:", email);
    
    // DynamoDBからトークンを取得
    const tokenData = await getTokenFromDynamoDB(email);
    
    if (!tokenData || !tokenData.accessToken || !tokenData.refreshToken) {
      console.error("❌ No valid token found for user:", email);
      return [];
    }
    
    let { accessToken, refreshToken } = tokenData;
    
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
        
        // リフレッシュトークンの存在確認
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        
        const newTokens = await refreshGoogleToken(refreshToken);
        
        // 新しいアクセストークンの存在確認
        if (!newTokens.access_token) {
          throw new Error("Failed to get new access token");
        }
        
        accessToken = newTokens.access_token;
        
        // DynamoDBの更新
        await saveTokenToDynamoDB(
          email,
          accessToken,
          refreshToken
        );
        
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
        return await fetchEventsFromCalendars(calendarListData.items, accessToken);
      }

      if (!calendarListResponse.ok) {
        throw new Error(`Failed to fetch calendar list: ${calendarListResponse.statusText}`);
      }

      const calendarListData = await calendarListResponse.json();
      return await fetchEventsFromCalendars(calendarListData.items, accessToken);
      
    } catch (error) {
      console.error("❌ Error fetching calendar data:", error);
      return [];
    }
    
  } catch (error) {
    console.error("❌ Error in getCalendarEvents:", error);
    return [];
  }
}

// カレンダーの一覧から予定を取得する関数
async function fetchEventsFromCalendars(calendars: any[], accessToken: string): Promise<CalendarEvent[]> {
  // 3ヶ月間の予定を取得
  const now = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(now.getMonth() + 3);

  const timeMin = now.toISOString();
  const timeMax = threeMonthsLater.toISOString();

  const allEvents: CalendarEvent[] = [];
  const calendarIds = calendars.map((cal: any) => cal.id);

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

// DynamoDBからトークンを取得する関数
async function getTokenFromDynamoDB(email: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });

  const params = {
    TableName: "GoogleTokens",
    Key: {
      email: { S: email },
    },
  };

  try {
    const { Item } = await client.send(new GetItemCommand(params));
    
    if (!Item || !Item.accessToken?.S || !Item.refreshToken?.S) {
      return null;
    }

    return {
      accessToken: Item.accessToken.S,
      refreshToken: Item.refreshToken.S,
    };
  } catch (error) {
    console.error("❌ Failed to fetch token from DynamoDB:", error);
    return null;
  }
}

// Googleトークンをリフレッシュする関数
async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string }> {
  if (!refreshToken) {
    throw new Error("Refresh token is required");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
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
    access_token: data.access_token
  };
}