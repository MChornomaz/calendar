import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalendarEventChangeService {
  private eventChangeSubject = new Subject<void>();

  eventChange$ = this.eventChangeSubject.asObservable();

  notifyChange(): void {
    this.eventChangeSubject.next();
  }
}
