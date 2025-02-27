import { Component, computed, inject, signal } from '@angular/core';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';
import { IAppointmentModalData } from '../../../../core/models/appointment-modal-data.interface';
import { ActivatedRoute } from '@angular/router';
import { CalendarEventService } from '../../../../core/services/calendar-event/calendar-event.service';
import { AppointmentModalService } from '../../../../core/services/appointment-modal-service/appointment-modal.service';
import { EventInfoModalService } from '../../../../core/services/event-info-modal-service/event-info-modal.service';
import { CalendarEventChangeService } from '../../../../core/services/calendar-event-change-service/calendar-event-change.service';
import { combineLatest, startWith, switchMap } from 'rxjs';
import { parseTime } from '../../../../core/utils/time.utils';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { getWeeksForMonth } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-calendar-month-page',
  standalone: false,
  templateUrl: './calendar-month-page.component.html',
  styleUrl: './calendar-month-page.component.scss',
})
export class CalendarMonthPageComponent {
  activatedRoute = inject(ActivatedRoute);
  calendarEventService = inject(CalendarEventService);
  appointmentModalService = inject(AppointmentModalService);
  eventInfoModalService = inject(EventInfoModalService);
  eventChangeService = inject(CalendarEventChangeService);

  monthStartDate = signal<Date>(new Date());
  weeks = computed(() => getWeeksForMonth(this.monthStartDate()));
  events = signal<CalendarEvent[]>([]);
  eventsByDay = computed(() => this.groupEventsByDay(this.events()));

  constructor() {
    combineLatest([this.activatedRoute.params, this.eventChangeService.eventChange$.pipe(startWith(null))])
      .pipe(
        switchMap(([params]) => {
          const year = parseInt(params['year'], 10);
          const month = parseInt(params['month'], 10) - 1;

          const currentDate = new Date(year, month, 1);
          this.monthStartDate.set(this.getStartOfMonth(currentDate));

          return this.calendarEventService.searchEventsByMonth(currentDate);
        }),
      )
      .subscribe((events) => {
        const eventObjects = events.map((event) => CalendarEvent.create(event));
        this.events.set(eventObjects);
      });
  }

  private getStartOfMonth(date: Date): Date {
    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return startOfMonth;
  }

  private groupEventsByDay(events: CalendarEvent[]): { [key: string]: CalendarEvent[] } {
    const eventsByDay: { [key: string]: CalendarEvent[] } = {};

    events.forEach((event) => {
      const eventDate = new Date(event.date);
      const dateKey = eventDate.toISOString().split('T')[0];

      if (!eventsByDay[dateKey]) {
        eventsByDay[dateKey] = [];
      }

      eventsByDay[dateKey].push(event);
    });

    return eventsByDay;
  }

  getEventsForDay(day: Date): CalendarEvent[] {
    const dateKey = day.toISOString().split('T')[0];
    return this.eventsByDay()[dateKey] || [];
  }

  getWholeDayEventsForDay(day: Date): CalendarEvent[] {
    const eventsForDay = this.getEventsForDay(day);
    return eventsForDay.filter((event) => event.duration === 'day');
  }

  getFixedEventsForDay(day: Date): CalendarEvent[] {
    const eventsForDay = this.getEventsForDay(day);
    return eventsForDay
      .filter((event) => event.duration === 'fixed')
      .sort((a, b) => {
        const timeA = parseTime(a.startTime as string);
        const timeB = parseTime(b.startTime as string);
        return timeA.getTime() - timeB.getTime();
      });
  }

  onDrop(event: CdkDragDrop<Date>) {
    const draggedEvent = event.item.data as CalendarEvent;

    const mouseEvent = event.event as MouseEvent;
    const x = mouseEvent.clientX;
    const y = mouseEvent.clientY;

    const targetElement = document.elementFromPoint(x, y);

    const targetDayElement = this.findParentDayElement(targetElement);

    if (targetDayElement) {
      const targetDayValue = targetDayElement.getAttribute('data-date');
      if (targetDayValue) {
        const targetDay = new Date(targetDayValue);

        if (draggedEvent) {
          const modalData: IAppointmentModalData = {
            type: 'edit',
            data: CalendarEvent.create({
              ...draggedEvent,
              date: targetDay,
            }),
          };
          this.appointmentModalService.openAppointmentDialog(modalData).subscribe();
        }
      } else {
        console.error('data-date attribute is missing on target day');
      }
    } else {
      console.error('Target day not found');
    }
  }

  private findParentDayElement(element: Element | null): HTMLElement | null {
    while (element && !element.hasAttribute('data-date')) {
      element = element.parentElement;
    }
    return element as HTMLElement | null;
  }

  openEventInfoModal(event: MouseEvent, calendarEvent: CalendarEvent) {
    event.stopPropagation();
    this.eventInfoModalService.openEventInfoDialog(calendarEvent).subscribe((result) => {
      if (result) {
        this.events.update((events) => events.filter((e) => e.id !== result.id));
      }
    });
  }

  openCreateAppointmentModal(day: Date) {
    const modalData: IAppointmentModalData = {
      type: 'create',
      data: {
        date: day,
      },
    };

    this.appointmentModalService.openAppointmentDialog(modalData).subscribe();
  }
}
