import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
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
    return this.dbService.events$.pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  public addEvent(event: CalendarEvent): Observable<void> {
    return this.dbService.addEvent(event).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  public updateEvent(event: CalendarEvent): Observable<void> {
    return this.dbService.updateEvent(event).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  public deleteEvent(id: number): Observable<void> {
    return this.dbService.deleteEvent(id).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  public searchEvents(field: keyof CalendarEvent, value: any): Observable<CalendarEvent[]> {
    return this.dbService.searchEvents(field, value).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  public searchEventsByDate(date: Date): Observable<CalendarEvent[]> {
    return this.dbService.searchEventsByDate(date).pipe(
      catchError((err) => {
        return throwError(() => err);
      }),
    );
  }

  private loadAllEvents(): void {
    this.dbService.loadAllEvents();
  }
}
