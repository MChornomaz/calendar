import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CalendarDayPageComponent} from './pages/calendar-day-page/calendar-day-page.component';
import {CalendarMonthPageComponent} from './pages/calendar-month-page/calendar-month-page.component';
import {CalendarWeekPageComponent} from './pages/calendar-week-page/calendar-week-page.component';
import {CalendarYearPageComponent} from './pages/calendar-year-page/calendar-year-page.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'day',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarDayPageComponent,
      }
    ]
  },
  {
    path: 'week',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarWeekPageComponent,
      }
    ]
  },
  {
    path: 'month',
    children: [
      {
        path: '::year/:month/:day',
        component: CalendarMonthPageComponent,
      }
    ]
  },
  {
    path: 'year',
    children: [
      {
        path: ':year/:month/:day',
        component: CalendarYearPageComponent,
      }
    ]
  },
];

@NgModule({
  declarations: [
    CalendarDayPageComponent,
    CalendarMonthPageComponent,
    CalendarWeekPageComponent,
    CalendarYearPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CalendarModule { }
