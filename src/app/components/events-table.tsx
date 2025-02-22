"use client";

import { useState, useEffect } from "react";

import { columns, Event } from "./columns";
import { DataTable } from "./data-table";

interface EventsTableProps {
  events: any[]; // API からのデータを受け取るため `any[]`
}

export function EventsTable({ events }: EventsTableProps) {
  const [data, setData] = useState<Event[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      // Google Calendar API のデータを `Event` 型に変換
      const formattedData: Event[] = events.map((event) => ({
        id: event.id,
        summary: event.summary || "無題のイベント",
        start: {
          dateTime: event.start.dateTime || event.start.date || "",
        },
        end: {
          dateTime: event.end.dateTime || event.end.date || "",
        },
      }));

      setData(formattedData);
    }
  }, [events]);

  console.log("Transformed Data:", data); // デバッグ用

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">イベント一覧</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
