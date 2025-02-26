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

        // Якщо об'єктного сховища ще не існує, створюємо його
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });

          // Створюємо індекси для кожного з полів
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
              const index = store.index('startTime');
              const request = index.openCursor(IDBKeyRange.only(formattedEvent.startTime));

              request.onsuccess = (e) => {
                const cursor = (e.target as IDBRequest).result;

                while (cursor) {
                  const existingEvent = cursor.value;
                  const existingDate = new Date(existingEvent.date).toISOString();
                  const formattedEventDate = new Date(formattedEvent.date).toISOString();

                  if (existingDate === formattedEventDate && existingEvent.startTime === formattedEvent.startTime) {
                    observer.error(new Error('This time is already taken by another event.'));
                    return;
                  }
                  cursor.continue();
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
          })
      )
    );
  }



  public updateEvent(event: CalendarEvent): Observable<void> {
    return this.waitForDB().pipe(
      switchMap(
        (db) =>
          new Observable<void>((observer) => {
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            // Конвертуємо дату у формат ISO перед оновленням
            const updatedEvent = {
              ...event,
              date: event.date.toISOString(),
              startTime: event.startTime || null, // Якщо startTime відсутній, збережемо null
              endTime: event.endTime || null,     // Аналогічно для endTime
            };

            if (updatedEvent.startTime) {
              const index = store.index('startTime');
              const request = index.get(updatedEvent.startTime);

              request.onsuccess = () => {
                const existingEvent = request.result;

                if (existingEvent && existingEvent.id !== updatedEvent.id) {
                  observer.error('This time is already taken by another event.');
                  return;
                }

                store.put(updatedEvent);
                transaction.oncomplete = () => {
                  observer.next();
                  observer.complete();
                };
                transaction.onerror = (event) => observer.error(event);
              };

              request.onerror = () => observer.error('Error checking for existing event.');
            } else {
              store.put(updatedEvent);
              transaction.oncomplete = () => {
                observer.next();
                observer.complete();
              };
              transaction.onerror = (event) => observer.error(event);
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

    // Перетворюємо дату на ISO рядки для коректного порівняння
    const startIso = startOfDay.toISOString();
    const endIso = endOfDay.toISOString();

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
                // Перетворюємо всі дати у Date об'єкти після отримання
                observer.next(results.map(item => ({
                  ...item,
                  date: new Date(item.date), // Повертаємо назад у Date
                })));
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
