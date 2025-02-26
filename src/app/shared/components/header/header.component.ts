import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatMiniFabButton } from '@angular/material/button';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect, MatSelectChange } from '@angular/material/select';
import { DropdownOption } from '../../models/dropdown-option.interface';
import { SidebarService } from '../../../core/services/sidebar-service/sidebar.service';
import { DateChangeService } from '../../../core/services/date-change-service/date-change.service';
import { DateMode } from '../../../core/models/date-mode';

@Component({
  selector: 'app-header',
  imports: [MatIcon, MatMiniFabButton, NgOptimizedImage, MatButton, DatePipe, MatFormField, MatSelect, MatOption],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private sidebarService = inject(SidebarService);
  private dateChangeService = inject(DateChangeService);

  currentDate$ = this.dateChangeService.currentDate$;
  currentDate = signal<Date>(new Date());

  dateMode$ = this.dateChangeService.dateMode$;
  dateMode = signal<DateMode>('day');

  modeDropdown = signal<DropdownOption[]>([
    { value: 'day', viewValue: 'Day' },
    { value: 'week', viewValue: 'Week' },
    { value: 'month', viewValue: 'Month' },
    { value: 'year', viewValue: 'Year' },
  ]);

  constructor() {
    this.currentDate$.subscribe((date) => this.currentDate.set(date));
    this.dateMode$.subscribe((mode) => this.dateMode.set(mode));
  }

  changeMode($event: MatSelectChange) {
    this.dateChangeService.changeMode($event.value);
  }

  public toggleSidebar() {
    this.sidebarService.toggleExpanded();
  }

  setToday() {
    this.dateChangeService.changeDate(new Date());
    this.dateChangeService.changeMode('day');
  }

  incrementDate() {
    this.dateChangeService.incrementDate();
  }

  decrementDate() {
    this.dateChangeService.decrementDate();
  }
}
