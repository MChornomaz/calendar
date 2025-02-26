import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDayPageComponent } from './pages/calendar-day-page/calendar-day-page.component';
import { CalendarMonthPageComponent } from './pages/calendar-month-page/calendar-month-page.component';
import { CalendarWeekPageComponent } from './pages/calendar-week-page/calendar-week-page.component';
import { CalendarYearPageComponent } from './pages/calendar-year-page/calendar-year-page.component';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CalendarEventComponent } from './components/calendar-event/calendar-event.component';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form.component';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import {EventInfoCardComponent} from './components/event-info-card/event-info-card.component';

const routes: Routes = [
  {
    path: 'day',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarDayPageComponent,
      },
    ],
  },
  {
    path: 'week',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarWeekPageComponent,
      },
    ],
  },
  {
    path: 'month',
    children: [
      {
        path: '::year/:month/:day',
        component: CalendarMonthPageComponent,
      },
    ],
  },
  {
    path: 'year',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarYearPageComponent,
      },
    ],
  },
];

@NgModule({
  declarations: [
    CalendarDayPageComponent,
    CalendarMonthPageComponent,
    CalendarWeekPageComponent,
    CalendarYearPageComponent,
    CalendarEventComponent,
    AppointmentFormComponent,
    EventInfoCardComponent
  ],
  imports: [
    CommonModule,
    DragDropModule,
    RouterModule.forChild(routes),
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatButton,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatSelect,
    MatOption,
    MatCheckbox,
    MatIcon,
    MatIconButton,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
  ],
})
export class CalendarModule {}
