import { Component, input } from '@angular/core';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';

@Component({
  selector: 'app-calendar-event',
  standalone: false,
  templateUrl: './calendar-event.component.html',
  styleUrl: './calendar-event.component.scss',
})
export class CalendarEventComponent {
  calendarEvent = input.required<CalendarEvent>();
}
