import { Component, computed, inject, signal } from '@angular/core';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';
import { ActivatedRoute } from '@angular/router';
import { CalendarEventService } from '../../../../core/services/calendar-event/calendar-event.service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AppointmentModalService } from '../../../../core/services/appointment-modal-service/appointment-modal.service';
import { IAppointmentModalData } from '../../../../core/models/appointment-modal-data.interface';
import { EventInfoModalService } from '../../../../core/services/event-info-modal-service/event-info-modal.service';
import { CalendarEventChangeService } from '../../../../core/services/calendar-event-change-service/calendar-event-change.service';
import { combineLatest, startWith, switchMap } from 'rxjs';
import { generateTimeHours, parseTime } from '../../../../core/utils/time.utils';

@Component({
  selector: 'app-calendar-day-page',
  standalone: false,
  templateUrl: './calendar-day-page.component.html',
  styleUrl: './calendar-day-page.component.scss',
})
export class CalendarDayPageComponent {
  activatedRoute = inject(ActivatedRoute);
  calendarEventService = inject(CalendarEventService);
  appointmentModalService = inject(AppointmentModalService);
  private eventInfoModalService = inject(EventInfoModalService);
  eventChangeService = inject(CalendarEventChangeService);

  date = signal<Date | null>(null);
  events = signal<CalendarEvent[]>([]);
  wholeDayEvents = computed(() => this.events().filter((event) => event.duration === 'day'));

  timeHours = generateTimeHours();
  connectedDropLists = this.timeHours.map((h) => 'hour-' + h.id);

  constructor() {
    combineLatest([this.activatedRoute.params, this.eventChangeService.eventChange$.pipe(startWith(null))])
      .pipe(
        switchMap(([params]) => {
          const year = parseInt(params['year'], 10);
          const month = parseInt(params['month'], 10) - 1;
          const day = parseInt(params['day'], 10);

          const currentDate = new Date(year, month, day);
          this.date.set(currentDate);

          return this.calendarEventService.searchEventsByDate(currentDate);
        }),
      )
      .subscribe((events) => {
        const eventObjects = events.map((event) => CalendarEvent.create(event));
        this.events.set(eventObjects);
      });
  }

  getShortWeekday(): string {
    return this.date() ? (this.date() as Date).toLocaleDateString('en-US', { weekday: 'short' }) : '';
  }

  getEventsForHour(hour: { startTime: string; endTime: string }): CalendarEvent[] {
    return this.events().filter((event) => event.duration === 'fixed' && this.isEventInHour(event, hour));
  }

  isEventInHour(event: CalendarEvent, hour: { startTime: string; endTime: string }): boolean {
    const eventStartTime = parseTime(event.startTime as string);
    const eventEndTime = parseTime(event.endTime as string);
    const hourStartTime = parseTime(hour.startTime);
    const hourEndTime = parseTime(hour.endTime);

    return eventStartTime >= hourStartTime && eventEndTime <= hourEndTime;
  }

  onDrop(event: CdkDragDrop<CalendarEvent[]>, targetHour: { startTime: string; endTime: string }) {
    const draggedEvent = event.item.data as CalendarEvent;
    if (draggedEvent) {
      draggedEvent.startTime = targetHour.startTime;
      draggedEvent.endTime = targetHour.endTime;
      this.calendarEventService.updateEvent(draggedEvent).subscribe();
      this.events.set([...this.events()]);
    }
  }

  canEnter(drag: CdkDrag, drop: CdkDropList): boolean {
    const eventsInHour = drop.data as CalendarEvent[];
    return eventsInHour.length === 0;
  }

  openCreateAppointmentModal(startTime: string, endTime: string) {
    const modalData: IAppointmentModalData = {
      type: 'create',
      data: {
        startTime,
        endTime,
        date: this.date() || new Date(),
      },
    };

    this.appointmentModalService.openAppointmentDialog(modalData).subscribe();
  }

  openEventInfoModal(event: MouseEvent, calendarEvent: CalendarEvent) {
    event.stopPropagation();
    this.eventInfoModalService.openEventInfoDialog(calendarEvent).subscribe((result) => {
      if (result) {
        this.events.update((events) => events.filter((e) => e.id !== result.id));
      }
    });
  }
}
