import { Component, OnInit, signal, effect } from '@angular/core';
import { DateChangeService } from '../../../../core/services/date-change-service/date-change.service';
import { ActivatedRoute } from '@angular/router';
import { getWeeksForMonth } from '../../../../core/utils/date.utils';

@Component({
  selector: 'app-calendar-year-page',
  standalone: false,
  templateUrl: './calendar-year-page.component.html',
  styleUrls: ['./calendar-year-page.component.scss'],
})
export class CalendarYearPageComponent implements OnInit {
  year = signal<number>(new Date().getFullYear());
  months = signal<{ name: string; startDate: Date; weeks: Date[][] }[]>([]);
  selectedDate = signal<Date | null>(null);

  constructor(
    private route: ActivatedRoute,
    private dateChangeService: DateChangeService,
  ) {
    effect(() => {
      this.generateMonths();
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.year.set(+params['year']);
    });

    this.dateChangeService.currentDate$.subscribe((date) => {
      this.selectedDate.set(date);
      if (date) {
        this.year.set(date.getFullYear());
      }
    });
  }

  generateMonths(): void {
    const months = [];
    for (let month = 0; month < 12; month++) {
      const monthName = new Date(this.year(), month, 1).toLocaleString('en-US', { month: 'long' });
      const startDate = new Date(this.year(), month, 1);
      months.push({
        name: monthName,
        startDate,
        weeks: getWeeksForMonth(startDate),
      });
    }
    this.months.set(months);
  }

  isSelected(date: Date, month: { name: string; startDate: Date }): boolean {
    const selectedDate = this.selectedDate() || new Date();
    return selectedDate && date.toDateString() === selectedDate.toDateString() && date.getMonth() === month.startDate.getMonth();
  }

  onDateClick(date: Date): void {
    this.selectedDate.set(date);
    this.dateChangeService.changeDate(date);
    this.dateChangeService.changeMode('day');
  }

  checkCurrentMonth(day: Date, month: { name: string; startDate: Date }): boolean {
    return day.getMonth() === month.startDate.getMonth();
  }
}
