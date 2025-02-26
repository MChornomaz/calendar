import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppointmentFormComponent } from '../../../modules/calendar/components/appointment-form/appointment-form.component';
import { IAppointmentModalData } from '../../models/appointment-modal-data.interface';

@Injectable({
  providedIn: 'root',
})
export class AppointmentModalService {
  constructor(private dialog: MatDialog) {}

  openAppointmentDialog(data: IAppointmentModalData) {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '850px',
      data: data,
    });

    return dialogRef.afterClosed();
  }
}
