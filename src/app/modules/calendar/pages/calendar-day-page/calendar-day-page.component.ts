import { Component, computed, effect, inject, signal } from '@angular/core';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';
import { ActivatedRoute } from '@angular/router';
import { CalendarEventService } from '../../../../core/services/calendar-event/calendar-event.service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { AppointmentModalService } from '../../../../core/services/appointment-modal-service/appointment-modal.service';
import { IAppointmentModalData } from '../../../../core/models/appointment-modal-data.interface';
import {EventInfoModalService} from '../../../../core/services/event-info-modal-service/event-info-modal.service';
import {MatSnackBar} from '@angular/material/snack-bar';

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
  private snackBar = inject(MatSnackBar)

  date = signal<Date | null>(null);
  events = signal<CalendarEvent[]>([]);
  wholeDayEvents = computed(() => this.events().filter((event) => event.duration === 'day'));

  timeHours = Array.from({ length: 24 }, (_, i) => {
    const startHour = i % 12 || 12;
    const period = i < 12 ? 'AM' : 'PM';
    const endHour = (i + 1) % 12 || 12;
    const endPeriod = i + 1 < 12 ? 'AM' : 'PM';

    return {
      id: i,
      startTime: `${startHour}:00 ${period}`,
      endTime: `${endHour}:00 ${endPeriod}`,
    };
  });

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      const year = parseInt(params['year'], 10);
      const month = parseInt(params['month'], 10) - 1;
      const day = parseInt(params['day'], 10);

      this.date.set(new Date(year, month, day));
    });

    effect(() => {
      const currentDate = this.date();
      if (currentDate) {
        this.calendarEventService.searchEventsByDate(currentDate).subscribe((events) => {
          const eventObjects = events.map((event) => CalendarEvent.create(event));
          console.log(eventObjects);
          this.events.set(eventObjects);
        });
      }
    });
  }

  getShortWeekday(): string {
    return this.date() ? this.date()!.toLocaleDateString('en-US', { weekday: 'short' }) : '';
  }

  getEventsForHour(hour: { startTime: string; endTime: string }): CalendarEvent[] {
    return this.events().filter((event) => event.duration === 'fixed' && this.isEventInHour(event, hour));
  }

  isEventInHour(event: CalendarEvent, hour: { startTime: string; endTime: string }): boolean {
    const eventStartTime = this.parseTime(event.startTime!);
    const eventEndTime = this.parseTime(event.endTime!);
    const hourStartTime = this.parseTime(hour.startTime);
    const hourEndTime = this.parseTime(hour.endTime);

    return eventStartTime >= hourStartTime && eventEndTime <= hourEndTime;
  }

  private parseTime(time: string): Date {
    const [timeStr, period] = time.split(' ');
    let [hours, minutes] = timeStr.split(':').map((num) => parseInt(num, 10));

    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const now = new Date();
    now.setHours(hours, minutes, 0, 0);
    return now;
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

  connectedDropLists = this.timeHours.map((h) => 'hour-' + h.id);

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

    this.appointmentModalService.openAppointmentDialog(modalData).subscribe((result: { type: 'create' | 'edit', data: CalendarEvent }) => {
      if (result) {
        if(result.type === 'create'){
          this.events.update((events) => [...events, result.data]);
        } else if(result.type === 'edit'){
          const events = this.events();
          const index = events.findIndex((event) => event.id === result.data.id);
          events[index] = result.data;
          this.events.set(events);
          console.log(result.data);
        }
      }
    });
  }

  openEventInfoModal(event: MouseEvent ,calendarEvent: CalendarEvent) {
    event.stopPropagation();
    this.eventInfoModalService.openEventInfoDialog(calendarEvent).subscribe((result) => {
      if (result) {
        this.events.update((events) => events.filter((e) => e.id !== result.id));
      }
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }
}
