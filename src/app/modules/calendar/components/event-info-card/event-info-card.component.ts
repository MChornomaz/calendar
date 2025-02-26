import {Component, Inject, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {IAppointmentModalData} from '../../../../core/models/appointment-modal-data.interface';
import {CalendarEvent} from '../../../../core/models/calendar-event.model';
import {AppointmentModalService} from '../../../../core/services/appointment-modal-service/appointment-modal.service';
import {CalendarEventService} from '../../../../core/services/calendar-event/calendar-event.service';

@Component({
  selector: 'app-event-info-card',
  standalone: false,
  templateUrl: './event-info-card.component.html',
  styleUrl: './event-info-card.component.scss'
})
export class EventInfoCardComponent {
  private calendarEventService = inject(CalendarEventService);
  appointmentModalService = inject(AppointmentModalService);

  calendarEvent = signal<CalendarEvent | null>(null);
  deleteMode = signal<boolean>(false);

  constructor(
    public dialogRef: MatDialogRef<CalendarEvent>,
    @Inject(MAT_DIALOG_DATA) public data: CalendarEvent,
  ) {
    this.calendarEvent.set(data);
  }

  edit(){
    if(this.calendarEvent()){
      const modalData: IAppointmentModalData = {
        type: 'edit',
        data: this.calendarEvent() as CalendarEvent,
      };

      this.appointmentModalService.openAppointmentDialog(modalData).subscribe(
        () => this.close(),
      );
    }

  }

  delete(){
    if(this.calendarEvent()) {
      this.calendarEventService.deleteEvent((this.calendarEvent() as CalendarEvent).id).subscribe(
        () => this.close(this.calendarEvent() as CalendarEvent),
      );
    }
  }


  close(data?: CalendarEvent) {
    this.dialogRef.close(data);
  }

  showConfirmation() {
    this.deleteMode.set(true);
  }

  closeConfirmation() {
    this.deleteMode.set(false);
  }
}
