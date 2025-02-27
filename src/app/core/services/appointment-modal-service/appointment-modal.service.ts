import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../../../modules/calendar/components/appointment-form/appointment-form.component';
import { IAppointmentModalData } from '../../models/appointment-modal-data.interface';
import { catchError, EMPTY, Observable, of, switchMap, throwError } from 'rxjs';
import { CalendarEvent } from '../../models/calendar-event.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentModalService {
  constructor(private dialog: MatDialog) {}

  openAppointmentDialog(data: IAppointmentModalData): Observable<CalendarEvent> {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '850px',
      data: data,
    });

    return dialogRef.afterClosed().pipe(
      switchMap((result: CalendarEvent | undefined) => {
        if (result) {
          return of(result);
        } else {
          return EMPTY;
        }
      }),
      catchError((err) => {
        console.error(err);
        return throwError(() => err);
      }),
    );
  }
}
