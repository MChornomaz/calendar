import { Component, inject, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IAppointmentModalData } from '../../../../core/models/appointment-modal-data.interface';
import { CalendarEvent } from '../../../../core/models/calendar-event.model';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../core/models/date-adapter/date-adapter';
import { endTimeValidator, timeValidator } from './validatior/time-range.validator';
import { Subscription } from 'rxjs';
import { CalendarEventService } from '../../../../core/services/calendar-event/calendar-event.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarEventChangeService } from '../../../../core/services/calendar-event-change-service/calendar-event-change.service';
import { generateTimeHours } from '../../../../core/utils/time.utils';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'l, MMMM dd, yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-appointment-form',
  standalone: false,
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
})
export class AppointmentFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private calendarEventService = inject(CalendarEventService);
  private snackBar = inject(MatSnackBar);
  private calendarEventChangeService = inject(CalendarEventChangeService);

  isModal = signal(false);
  formType = signal<'create' | 'edit'>('create');
  dateEditing = signal<boolean>(false);
  eventId = signal<number | null>(null);

  private subscriptions: Subscription = new Subscription();

  timeHours = generateTimeHours();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public dialogRef: MatDialogRef<AppointmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IAppointmentModalData,
  ) {
    this.isModal.set(!!data);
    this.formType.set(data?.type || 'create');
    this.initForm(data);
  }

  ngOnInit() {
    this.subscribeToStartTimeChanges();
  }

  private initForm(data: IAppointmentModalData) {
    const isCalendarEvent = data?.data instanceof CalendarEvent;
    if (isCalendarEvent) {
      const calendarEvent = data?.data as CalendarEvent;
      this.form = this.fb.group({
        title: [calendarEvent.title || '', Validators.required],
        date: [calendarEvent.date || new Date(), Validators.required],
        duration: [calendarEvent.duration === 'day', Validators.required],
        description: [calendarEvent.description || '', Validators.required],
        startTime: [calendarEvent.startTime || '12:00 PM', [Validators.required, timeValidator(this.timeHours)]],
        endTime: [calendarEvent.endTime || '1:00 PM', [Validators.required, endTimeValidator(this.timeHours)]],
      });
      this.eventId.set(calendarEvent.id);
    } else {
      const eventData = data?.data as { startTime?: string; endTime?: string; duration?: 'fixed' | 'day'; date: Date };
      this.form = this.fb.group({
        title: ['', Validators.required],
        date: [eventData?.date || new Date(), Validators.required],
        duration: [eventData?.duration === 'day'],
        description: [''],
        startTime: [eventData?.startTime || '12:00 PM', [Validators.required, timeValidator(this.timeHours)]],
        endTime: [eventData?.endTime || '1:00 PM', [Validators.required, endTimeValidator(this.timeHours)]],
      });
    }

    this.addDurationValidation();
  }

  submit() {
    if (this.form.valid) {
      const calendarEvent = CalendarEvent.create({
        ...this.form.value,
        duration: this.form.get('duration')?.value ? 'day' : 'fixed',
        id: this.formType() === 'edit' ? this.eventId() : undefined,
      });

      const eventObservable = this.formType() === 'create' ? this.calendarEventService.addEvent(calendarEvent) : this.calendarEventService.updateEvent(calendarEvent);

      eventObservable.subscribe({
        next: () => {
          this.calendarEventChangeService.notifyChange();
          this.close(calendarEvent);
        },
        error: (err) => {
          this.showError(err.message || 'This time is already taken by another event.');
        },
      });
    }
  }

  close(data?: CalendarEvent) {
    if (this.isModal()) {
      this.dialogRef.close(data);
    } else {
      this.router.navigate(['/appointments']);
    }
  }

  private subscribeToStartTimeChanges() {
    const startTimeChangeSub = this.form.get('startTime')?.valueChanges.subscribe((startTime) => {
      if (!startTime) {
        return;
      }

      const startIndex = this.timeHours.findIndex((t) => t.startTime === startTime);
      if (startIndex === -1 || startIndex + 1 >= this.timeHours.length) {
        return;
      }

      const nextHour = this.timeHours[startIndex + 1].startTime;

      if (this.form.get('endTime')?.pristine) {
        this.form.patchValue({ endTime: nextHour });
      }
    });

    if (startTimeChangeSub) {
      this.subscriptions.add(startTimeChangeSub);
    }
  }

  addDurationValidation() {
    this.form.get('duration')?.valueChanges.subscribe((isDurationSelected: boolean) => {
      if (isDurationSelected) {
        this.form.get('startTime')?.clearValidators();
        this.form.get('endTime')?.clearValidators();
        this.form.get('startTime')?.disable();
        this.form.get('endTime')?.disable();
      } else {
        this.form.get('startTime')?.setValidators([Validators.required, timeValidator(this.timeHours)]);
        this.form.get('endTime')?.setValidators([Validators.required, endTimeValidator(this.timeHours)]);
        this.form.get('startTime')?.enable();
        this.form.get('endTime')?.enable();
      }

      this.form.get('startTime')?.updateValueAndValidity();
      this.form.get('endTime')?.updateValueAndValidity();
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Закрити', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
