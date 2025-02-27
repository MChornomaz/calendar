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
import { MatCalendar, MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { EventInfoCardComponent } from './components/event-info-card/event-info-card.component';

const routes: Routes = [
  {
    path: 'day',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarDayPageComponent,
      },
      {
        path: '',
        redirectTo: getDefaultDateUrl('day'),
        pathMatch: 'full',
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
      {
        path: '',
        redirectTo: getDefaultDateUrl('week'),
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'month',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarMonthPageComponent,
      },
      {
        path: '',
        redirectTo: getDefaultDateUrl('month'),
        pathMatch: 'full',
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
      {
        path: '',
        redirectTo: getDefaultDateUrl('year'),
        pathMatch: 'full',
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
    EventInfoCardComponent,
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
    MatCalendar,
  ],
})
export class CalendarModule {}

function getDefaultDateUrl(mode: string): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  switch (mode) {
    case 'day':
      return `/day/${year}/${month}/${day}`;
    case 'week':
      return `/week/${year}/${month}/${day}`;
    case 'month':
      return `/month/${year}/${month}/${day}`;
    case 'year':
      return `/year/${year}/${month}/${day}`;
    default:
      return `/day/${year}/${month}/${day}`;
  }
}
