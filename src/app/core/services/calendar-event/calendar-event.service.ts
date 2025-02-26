import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CalendarEvent } from '../../models/calendar-event.model';
import { DBService } from '../db/db.service';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventService {
  private dbService = inject(DBService);
  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public calendarEvents$ = this.eventsSubject.asObservable();

  constructor() {
    this.dbService.events$.subscribe((events) => {
      this.eventsSubject.next(events);
    });
  }

  public getAllEvents(): Observable<CalendarEvent[]> {
    return this.dbService.events$;
  }

  public addEvent(event: CalendarEvent): Observable<void> {
    return this.dbService.addEvent(event);
  }

  public updateEvent(event: CalendarEvent): Observable<void> {
    return this.dbService.updateEvent(event);
  }

  public deleteEvent(id: number): Observable<void> {
    return this.dbService.deleteEvent(id);
  }

  public searchEvents(field: keyof CalendarEvent, value: any): Observable<CalendarEvent[]> {
    return this.dbService.searchEvents(field, value);
  }

  public searchEventsByDate(date: Date): Observable<CalendarEvent[]> {
    return this.dbService.searchEventsByDate(date);
  }

  private loadAllEvents(): void {
    this.dbService.loadAllEvents();
  }
}
