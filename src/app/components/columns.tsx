import { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";

export type Event = {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
  };
  end: {
    dateTime?: string;
  };
};

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "summary",
    header: "イベント名",
    cell: ({ row }) => <span className="font-semibold">{row.getValue("summary")}</span>,
  },
  {
    accessorKey: "start",
    header: "開始日時",
    cell: ({ row }) => {
      const { dateTime } = row.original.start;
      if (!dateTime) return <span>不明</span>;

      // 終日イベントか判定（`T` や `+` がない場合）
      const isAllDay = !dateTime.includes("T") && !dateTime.includes("+");

      return <span>{format(parseISO(dateTime), isAllDay ? "yyyy/MM/dd" : "yyyy/MM/dd HH:mm")}</span>;
    },
  },
  {
    accessorKey: "end",
    header: "終了日時",
    cell: ({ row }) => {
      const { dateTime } = row.original.end;
      if (!dateTime) return <span>不明</span>;

      const isAllDay = !dateTime.includes("T") && !dateTime.includes("+");

      // 終日イベントの場合、Google カレンダーは次の日を終了日として返すので 1日引く
      const formattedDate = isAllDay
        ? format(parseISO(dateTime), "yyyy/MM/dd")
        : format(parseISO(dateTime), "yyyy/MM/dd HH:mm");

      return <span>{formattedDate}</span>;
    },
  },
];
