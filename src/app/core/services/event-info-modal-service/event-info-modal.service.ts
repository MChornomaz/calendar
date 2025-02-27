import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent } from '../../models/calendar-event.model';
import { EventInfoCardComponent } from '../../../modules/calendar/components/event-info-card/event-info-card.component';

@Injectable({
  providedIn: 'root',
})
export class EventInfoModalService {
  constructor(private dialog: MatDialog) {}

  openEventInfoDialog(data: CalendarEvent) {
    const dialogRef = this.dialog.open(EventInfoCardComponent, {
      width: '500px',
      data: data,
    });

    return dialogRef.afterClosed();
  }
}
