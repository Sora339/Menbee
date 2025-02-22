"use client";

import InterviewForm from "@/app/components/form";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("📡 Fetching calendar events via API Gateway...");
        const res = await fetch("/api/calendar");

        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch`);

        const data = await res.json();
        console.log("✅ Fetched Calendar Data:", data);

        setEvents(data || []);
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        setError("カレンダーイベントの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container mx-auto grid grid-cols-2 p-4 gap-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">あなたの予定</h2>
        <div className="h-[80vh] overflow-y-auto">
          {loading && <p>読み込み中...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <ul className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <li key={event.id} className="p-4 border rounded-lg shadow">
                  <div className="flex items-center gap-4">
                    <Checkbox defaultChecked={true} />
                    <div className="flex w-full justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {event.summary}
                        </h3>
                        <p className="text-gray-600">
                          開始:{" "}
                          {event.start.dateTime
                            ? format(
                                new Date(event.start.dateTime),
                                "yyyy/MM/dd HH:mm"
                              )
                            : event.start.date
                            ? format(new Date(event.start.date), "yyyy/MM/dd")
                            : "日付未定"}
                        </p>
                        <p className="text-gray-600">
                          終了:{" "}
                          {event.end.dateTime
                            ? format(
                                new Date(event.end.dateTime),
                                "yyyy/MM/dd HH:mm"
                              )
                            : event.end.date
                            ? format(new Date(event.end.date), "yyyy/MM/dd")
                            : "日付未定"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-gray-600">
                          {event.start.dateTime ? (
                            <>
                              前の余裕時間(分): <Input />
                            </>
                          ) : event.start.date ? null : (
                            "日付未定"
                          )}
                        </p>
                        <p className="text-gray-600">
                          {event.end.dateTime ? (
                            <>
                              後の余裕時間(分): <Input />
                            </>
                          ) : event.end.date ? null : (
                            "日付未定"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p>予定はありません。</p>
            )}
          </ul>
        </div>
      </div>
      <div>
        <InterviewForm />
      </div>
    </div>
  );
}
