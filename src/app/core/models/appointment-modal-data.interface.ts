import { CalendarEvent } from './calendar-event.model';

export interface IAppointmentModalData {
  type: 'create' | 'edit';
  data?: CalendarEvent | { startTime?: string; endTime?: string; duration?: 'fixed' | 'day'; date: Date };
}
