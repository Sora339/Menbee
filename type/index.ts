export interface CalendarEvent {
  id: string;
  summary?: string;
  start: { dateTime?: string; date?: string };
  end:   { dateTime?: string; date?: string };
}

export interface FormattedCalendarEvent {
  id: string;
  summary?: string;
  startDateTime?: string;
  startDate?: string;
  endDateTime?: string;
  endDate?: string;
  startFormatted?: string;
  endFormatted?: string;
}

export interface InterviewFormData {
  date_range: string;
  days: string[];
  start_time: string;         // "HH:mm"
  end_time:   string;         // "HH:mm"
  minimum_duration?: number;  // 分
  events: Array<{
    id: string;
    selected: boolean;
    bufferBefore: number;     // 分
    bufferAfter:  number;     // 分
  }>;
  calendarData: CalendarEvent[];
}

export interface InterviewSlot {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  formatted: string;
}


export interface EventWithBuffer {
  id: string;
  summary: string;
  start: Date;
  end:   Date;
  isAllDay: boolean;
}

export interface TimeSlot {
  start: Date;
  end:   Date;
}
