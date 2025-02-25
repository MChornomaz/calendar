import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, from, switchMap} from 'rxjs';
import { map } from 'rxjs/operators';
import {CalendarEvent} from '../../models/calendar-event.model';

@Injectable({
  providedIn: 'root',
})
export class DBService {
  private dbName = 'eventDB';
  private storeName = 'events';
  private db!: IDBDatabase;

  private eventsSubject = new BehaviorSubject<CalendarEvent[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor() {
    this.openDatabase().subscribe();
  }

  private openDatabase(): Observable<IDBDatabase> {
    return new Observable((observer) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBRequest).result;
        observer.next(this.db);
        observer.complete();
      };

      request.onerror = (event) => {
        console.error('Error opening database:', event);
        observer.error(event);
      };
    });
  }

  public updateEvent(event: CalendarEvent): Observable<void> {
    return from(this.openDatabase()).pipe(
      map((db) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        const eventToStore = {
          ...event,
          date: event.date.toISOString(),
        };

        store.put(eventToStore);
        transaction.oncomplete = () => {
          this.loadAllEvents();
        };
      })
    );
  }

  public deleteEvent(id: number): Observable<void> {
    return from(this.openDatabase()).pipe(
      map((db) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.delete(id);
        transaction.oncomplete = () => {
          this.loadAllEvents();
        };
      })
    );
  }

  private loadAllEvents(): void {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      const events = request.result.map((event: CalendarEvent) => {
        return {
          ...event,
          date: new Date(event.date),
        };
      });
      this.eventsSubject.next(events);
    };
  }

  public addEvent(event: CalendarEvent): Observable<void> {
    return from(this.openDatabase()).pipe(
      map((db) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        const eventToStore = {
          ...event,
          date: event.date.toISOString(),
        };

        store.add(eventToStore);
        transaction.oncomplete = () => {
          this.loadAllEvents();
        };
      })
    );
  }

  public searchEvents(field: keyof CalendarEvent, value: any): Observable<CalendarEvent[]> {
    return from(this.openDatabase()).pipe(
      switchMap((db) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index(field);
        const request = index.openCursor(IDBKeyRange.only(value));

        return new Observable<CalendarEvent[]>((observer) => {
          const results: CalendarEvent[] = [];

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              results.push(cursor.value);
              cursor.continue();
            } else {
              observer.next(results);
              observer.complete();
            }
          };

          request.onerror = (event) => {
            observer.error(event.target);
          };
        });
      })
    );
  }

  public searchEventsByDate(date: Date): Observable<CalendarEvent[]> {
    return this.searchEvents('date', date.toISOString());
  }


}
