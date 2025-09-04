import { CalenderDetail } from "./leave-detail.model";

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  leaves: CalenderDetail[];
}
