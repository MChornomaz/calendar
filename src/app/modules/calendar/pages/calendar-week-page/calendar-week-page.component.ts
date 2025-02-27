import { Component, computed, inject, signal } from '@angular/core';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';
import { IAppointmentModalData } from '../../../../core/models/appointment-modal-data.interface';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { generateTimeHours, parseTime } from '../../../../core/utils/time.utils';
import { combineLatest, startWith, switchMap } from 'rxjs';
import { CalendarEventChangeService } from '../../../../core/services/calendar-event-change-service/calendar-event-change.service';
import { EventInfoModalService } from '../../../../core/services/event-info-modal-service/event-info-modal.service';
import { AppointmentModalService } from '../../../../core/services/appointment-modal-service/appointment-modal.service';
import { CalendarEventService } from '../../../../core/services/calendar-event/calendar-event.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-calendar-week-page',
  standalone: false,
  templateUrl: './calendar-week-page.component.html',
  styleUrl: './calendar-week-page.component.scss',
})
export class CalendarWeekPageComponent {
  activatedRoute = inject(ActivatedRoute);
  calendarEventService = inject(CalendarEventService);
  appointmentModalService = inject(AppointmentModalService);
  eventInfoModalService = inject(EventInfoModalService);
  eventChangeService = inject(CalendarEventChangeService);

  weekStartDate = signal<Date | null>(null);
  weekDays = computed(() => this.generateWeekDays(this.weekStartDate()));
  events = signal<CalendarEvent[]>([]);
  eventsByDay = computed(() => this.groupEventsByDay(this.events(), this.weekDays()));

  timeHours = generateTimeHours();

  connectedDropLists = this.weekDays().flatMap((day) => this.timeHours.map((hour) => `day-${day.toISOString()}-hour-${hour.id}`));

  constructor() {
    combineLatest([this.activatedRoute.params, this.eventChangeService.eventChange$.pipe(startWith(null))])
      .pipe(
        switchMap(([params]) => {
          const year = parseInt(params['year'], 10);
          const month = parseInt(params['month'], 10) - 1;
          const day = parseInt(params['day'], 10);

          const currentDate = new Date(year, month, day);
          this.weekStartDate.set(this.getStartOfWeek(currentDate));

          return this.calendarEventService.searchEventsByWeek(currentDate);
        }),
      )
      .subscribe((events) => {
        const eventObjects = events.map((event) => CalendarEvent.create(event));
        this.events.set(eventObjects);
      });
  }

  private getStartOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  private generateWeekDays(startDate: Date | null): Date[] {
    if (!startDate) {
      return [];
    }
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  }

  private groupEventsByDay(events: CalendarEvent[], weekDays: Date[]): { [key: string]: CalendarEvent[] } {
    const eventsByDay: { [key: string]: CalendarEvent[] } = {};

    weekDays.forEach((day) => {
      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      eventsByDay[day.toISOString()] = events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfDay && eventDate <= endOfDay;
      });
    });

    return eventsByDay;
  }

  getShortWeekday(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }

  getEventsForHour(day: Date, hour: { startTime: string; endTime: string }): CalendarEvent[] {
    const eventsForDay = this.eventsByDay()[day.toISOString()] || [];
    return eventsForDay.filter((event) => event.duration === 'fixed' && this.isEventInHour(event, hour));
  }

  isEventInHour(event: CalendarEvent, hour: { startTime: string; endTime: string }): boolean {
    const eventStartTime = parseTime(event.startTime as string);
    const eventEndTime = parseTime(event.endTime as string);
    const hourStartTime = parseTime(hour.startTime);
    const hourEndTime = parseTime(hour.endTime);

    return eventStartTime >= hourStartTime && eventEndTime <= hourEndTime;
  }

  onDrop(event: CdkDragDrop<CalendarEvent[]>) {
    const draggedEvent = event.item.data as CalendarEvent;
    if (draggedEvent) {
      const dropElement = document.elementFromPoint(event.dropPoint.x, event.dropPoint.y) as HTMLElement;
      const targetDropList = dropElement.closest('[cdkDropList]') as HTMLElement;

      if (targetDropList) {
        const targetId = targetDropList.id;

        const match = targetId.match(/day-(.+)-hour-(\d+)/);
        if (match) {
          const [, targetDayISO, targetHourId] = match; // Просто не оголошуємо `_`

          if (targetDayISO && targetHourId) {
            const targetDay = new Date(targetDayISO);
            const targetHour = this.timeHours.find((h) => h.id === +targetHourId);

            if (targetHour) {
              draggedEvent.startTime = targetHour.startTime;
              draggedEvent.endTime = targetHour.endTime;

              if (draggedEvent.date.toISOString() !== targetDay.toISOString()) {
                draggedEvent.date = targetDay;
              }

              this.calendarEventService.updateEvent(draggedEvent).subscribe(() => {
                this.events.set([...this.events()]);
              });
            }
          }
        }
      }
    }
  }

  canEnter(drag: CdkDrag, drop: CdkDropList): boolean {
    const eventsInHour = drop.data as CalendarEvent[];
    return eventsInHour.length === 0;
  }

  openCreateAppointmentModal(day: Date, startTime: string, endTime: string) {
    const modalData: IAppointmentModalData = {
      type: 'create',
      data: {
        startTime,
        endTime,
        date: day,
      },
    };

    this.appointmentModalService.openAppointmentDialog(modalData).subscribe((result) => {
      if (result) {
        this.events.update((events) => [...events, result]);
      }
    });
  }

  openEventInfoModal(event: MouseEvent, calendarEvent: CalendarEvent) {
    event.stopPropagation();
    this.eventInfoModalService.openEventInfoDialog(calendarEvent).subscribe((result) => {
      if (result) {
        this.events.update((events) => events.filter((e) => e.id !== result.id));
      }
    });
  }

  getWholeDayEventsForDay(day: Date): CalendarEvent[] {
    const eventsForDay = this.eventsByDay()[day.toISOString()] || [];
    return eventsForDay.filter((event) => event.duration === 'day');
  }
}
