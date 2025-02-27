import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SidebarService } from '../../../core/services/sidebar-service/sidebar.service';
import { DateChangeService } from '../../../core/services/date-change-service/date-change.service';

@Component({
  selector: 'app-sidebar',
  providers: [provideNativeDateAdapter()],
  imports: [MatCardModule, MatDatepickerModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('fadeIn', [
      state(
        'in',
        style({
          opacity: 1,
          transform: 'translateX(0)',
        }),
      ),
      transition('void => *', [
        style({
          opacity: 0,
          width: '100%',
          height: '100%',
        }),
        animate(100),
      ]),
      transition('* => void', [
        animate(
          150,
          style({
            width: '0px',
            opacity: 0,
          }),
        ),
      ]),
    ]),
  ],
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService);
  private dateChangeService = inject(DateChangeService);

  currentDate$ = this.dateChangeService.currentDate$;
  currentDate = signal<Date>(new Date());

  sidebarExpanded$ = this.sidebarService.expanded$;
  sidebarExpanded = signal<boolean>(true);

  constructor() {
    this.sidebarExpanded$.subscribe((expanded) => this.sidebarExpanded.set(expanded));
    this.currentDate$.subscribe((date) => {
      this.currentDate.set(date);
      if (this.calendar) {
        this.calendar.activeDate = date;
      }
    });
  }

  @ViewChild('calendar') calendar: MatCalendar<Date> | undefined;

  selectDate(date: Date | null) {
    if (date === null) {
      return;
    }
    this.dateChangeService.changeDate(date);
  }
}
