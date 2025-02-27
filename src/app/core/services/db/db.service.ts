import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { CalendarEvent } from '../../models/calendar-event.model';

@Injectable({
  providedIn: 'root',
})
export class DBService {
  private dbName = 'eventDB';
  private storeName = 'events';
  private db!: IDBDatabase;
  private dbReadySubject = new BehaviorSubject<boolean>(false);
  public dbReady$ = this.dbReadySubject.asObservable();

  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor() {
    this.initDB().subscribe();
  }

  public initDB(): Observable<void> {
    return new Observable<void>((observer) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          store.createIndex('startTime', 'startTime');
          store.createIndex('endTime', 'endTime');
          store.createIndex('date', 'date');
          store.createIndex('duration', 'duration');
          store.createIndex('description', 'description');
          store.createIndex('title', 'title');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        this.dbReadySubject.next(true);
        this.loadAllEvents();
        observer.next();
        observer.complete();
      };

      request.onerror = (event) => {
        console.error('Error initializing database:', event);
        observer.error(event);
      };
    });
  }

  private waitForDB(): Observable<IDBDatabase> {
    return this.dbReady$.pipe(
      filter((ready) => ready),
      switchMap(() => from(Promise.resolve(this.db))),
    );
  }

  public addEvent(event: CalendarEvent): Observable<void> {
    return this.waitForDB().pipe(
      switchMap(
        (db) =>
          new Observable<void>((observer) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const formattedEvent = {
              ...event,
              date: event.date.toISOString(),
              startTime: event.startTime || null,
              endTime: event.endTime || null,
            };

            if (formattedEvent.startTime) {
              const index = store.index('date');
              const request = index.getAll(formattedEvent.date);

              request.onsuccess = () => {
                const eventsOnSameDate = request.result;

                const isTimeTaken = eventsOnSameDate.some((existingEvent) => existingEvent.startTime === formattedEvent.startTime);

                if (isTimeTaken) {
                  observer.error(new Error('This time is already taken by another event.'));
                  return;
                }
                addEventToStore();
              };

              request.onerror = () => observer.error(new Error('Error checking for existing event.'));
            } else {
              addEventToStore();
            }

            function addEventToStore() {
              const addRequest = store.add(formattedEvent);
              addRequest.onsuccess = () => {
                observer.next();
                observer.complete();
              };

              addRequest.onerror = () => observer.error(new Error('Failed to add event.'));
            }

            transaction.onerror = () => observer.error(new Error('Transaction failed.'));
          }),
      ),
    );
  }

  public updateEvent(event: CalendarEvent): Observable<void> {
    return this.waitForDB().pipe(
      switchMap(
        (db) =>
          new Observable<void>((observer) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            const updatedEvent = {
              ...event,
              date: event.date.toISOString(),
              startTime: event.startTime || null,
              endTime: event.endTime || null,
            };

            if (updatedEvent.startTime) {
              const index = store.index('date');
              const request = index.getAll(updatedEvent.date);

              request.onsuccess = () => {
                const eventsOnSameDate = request.result;

                const isTimeTaken = eventsOnSameDate.some((existingEvent) => existingEvent.startTime === updatedEvent.startTime && existingEvent.id !== updatedEvent.id);

                if (isTimeTaken) {
                  observer.error('This time is already taken by another event.');
                  return;
                }

                store.put(updatedEvent);
                transaction.oncomplete = () => {
                  observer.next();
                  observer.complete();
                };
                transaction.onerror = (error) => observer.error(error);
              };

              request.onerror = () => observer.error('Error checking for existing event.');
            } else {
              store.put(updatedEvent);
              transaction.oncomplete = () => {
                observer.next();
                observer.complete();
              };
              transaction.onerror = (error) => observer.error(error);
            }
          }),
      ),
    );
  }

  public deleteEvent(id: number): Observable<void> {
    return this.waitForDB().pipe(
      switchMap(
        (db) =>
          new Observable<void>((observer) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            store.delete(id);

            transaction.oncomplete = () => {
              this.loadAllEvents();
              observer.next();
              observer.complete();
            };

            transaction.onerror = (event) => observer.error(event);
          }),
      ),
    );
  }

  public searchEventsByDate(date: Date): Observable<CalendarEvent[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startIso = startOfDay.toISOString();
    const endIso = endOfDay.toISOString();

    return this.searchEvents('date', IDBKeyRange.bound(startIso, endIso));
  }

  public searchEventsByWeek(date: Date): Observable<CalendarEvent[]> {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startIso = startOfWeek.toISOString();
    const endIso = endOfWeek.toISOString();

    return this.searchEvents('date', IDBKeyRange.bound(startIso, endIso));
  }

  public searchEventsByMonth(date: Date): Observable<CalendarEvent[]> {
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const startOfMonth = new Date(date);
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(startOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const startIso = startOfMonth.toISOString();
    const endIso = endOfMonth.toISOString();

    return this.searchEvents('date', IDBKeyRange.bound(startIso, endIso));
  }

  public searchEvents(field: keyof CalendarEvent, value: any): Observable<CalendarEvent[]> {
    return this.waitForDB().pipe(
      switchMap(
        (db) =>
          new Observable<CalendarEvent[]>((observer) => {
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const index = store.index(field);

            let request: IDBRequest;
            if (value instanceof IDBKeyRange) {
              request = index.openCursor(value);
            } else {
              request = index.openCursor(IDBKeyRange.only(value));
            }

            const results: CalendarEvent[] = [];

            request.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest).result;
              if (cursor) {
                results.push(cursor.value);
                cursor.continue();
              } else {
                observer.next(
                  results.map((item) => ({
                    ...item,
                    date: new Date(item.date),
                  })),
                );
                observer.complete();
              }
            };

            request.onerror = (event) => observer.error(event);
          }),
      ),
    );
  }

  public loadAllEvents(): void {
    this.waitForDB().subscribe((db) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const events = request.result.map((event: CalendarEvent) => ({
          ...event,
          date: new Date(event.date),
        }));
        this.eventsSubject.next(events);
      };
    });
  }
}
