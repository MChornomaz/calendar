import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, distinctUntilChanged, switchMap, take } from 'rxjs';
import { DateMode } from '../../models/date-mode';

@Injectable({
  providedIn: 'root',
})
export class DateChangeService {
  private currentDateSubject = new BehaviorSubject<Date | null>(null);
  private dateModeSubject = new BehaviorSubject<DateMode | null>(null);

  public currentDate$ = this.currentDateSubject.asObservable();
  public dateMode$ = this.dateModeSubject.asObservable();

  public changeDate(date: Date) {
    this.currentDateSubject.next(date);
  }

  public changeMode(mode: DateMode) {
    this.dateModeSubject.next(mode);
  }

  public initializeDate(date: Date) {
    if (!this.currentDateSubject.value) {
      this.currentDateSubject.next(date);
    }
  }

  public incrementDate() {
    combineLatest([this.dateModeSubject, this.currentDateSubject])
      .pipe(
        distinctUntilChanged(([prevMode, prevDate], [currMode, currDate]) => prevMode === currMode && prevDate?.getTime() === currDate?.getTime()),
        take(1),
        switchMap(([mode, date]) => {
          if (!date) {
            date = new Date();
          }
          const newDate = this.addTime(date, mode || 'day', 1);
          this.currentDateSubject.next(newDate);
          return this.currentDateSubject;
        }),
      )
      .subscribe();
  }

  public decrementDate() {
    combineLatest([this.dateModeSubject, this.currentDateSubject])
      .pipe(
        distinctUntilChanged(([prevMode, prevDate], [currMode, currDate]) => prevMode === currMode && prevDate?.getTime() === currDate?.getTime()),
        take(1),
        switchMap(([mode, date]) => {
          if (!date) {
            date = new Date();
          }
          const newDate = this.addTime(date, mode || 'day', -1);
          this.currentDateSubject.next(newDate);
          return this.currentDateSubject;
        }),
      )
      .subscribe();
  }

  private addTime(date: Date, mode: DateMode, amount: number): Date {
    const newDate = new Date(date);

    switch (mode) {
      case 'day':
        newDate.setDate(newDate.getDate() + amount);
        break;

      case 'week':
        newDate.setDate(newDate.getDate() + amount * 7);
        break;

      case 'month':
        newDate.setMonth(newDate.getMonth() + amount);
        if (newDate.getDate() !== date.getDate()) {
          newDate.setDate(0);
        }
        break;

      case 'year':
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
    }

    return newDate;
  }
}
