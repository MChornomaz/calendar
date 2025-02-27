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

  monthStartDate = signal<Date | null>(null); // Початкова дата місяця
  weeks = computed(() => this.generateWeeks(this.monthStartDate())); // Тижні місяця
  events = signal<CalendarEvent[]>([]); // Всі події за місяць
  eventsByDay = computed(() => this.groupEventsByDay(this.events())); // Події, згруповані по днях

  constructor() {
    combineLatest([this.activatedRoute.params, this.eventChangeService.eventChange$.pipe(startWith(null))])
      .pipe(
        switchMap(([params]) => {
          const year = parseInt(params['year'], 10);
          const month = parseInt(params['month'], 10) - 1;

          const currentDate = new Date(year, month, 1);
          this.monthStartDate.set(this.getStartOfMonth(currentDate)); // Встановлюємо початкову дату місяця

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

  private generateWeeks(startDate: Date | null): Date[][] {
    if (!startDate) {
      return [];
    }
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    const firstDayOfMonth = new Date(startDate);
    firstDayOfMonth.setDate(1);

    const firstDayOfWeek = new Date(firstDayOfMonth);
    firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + (firstDayOfMonth.getDay() === 0 ? -6 : 1));

    for (let i = 0; i < 35; i++) {
      const currentDate = new Date(firstDayOfWeek);
      currentDate.setDate(firstDayOfWeek.getDate() + i);

      currentWeek.push(currentDate);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
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

  onDrop(event: CdkDragDrop<CalendarEvent[]>, day: Date) {
    const draggedEvent = event.item.data as CalendarEvent;
    if (draggedEvent) {
      const modalData: IAppointmentModalData = {
        type: 'edit',
        data: {
          ...draggedEvent,
          date: day,
        },
      };

      this.appointmentModalService.openAppointmentDialog(modalData).subscribe();
    }
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
